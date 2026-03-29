"use strict";
/* eslint-disable @typescript-eslint/restrict-template-expressions */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentSerializer = void 0;
exports.serializeExpression = serializeExpression;
exports.serializeVariantKey = serializeVariantKey;
var AST = require("./ast.js");
function indentExceptFirstLine(content) {
    return content.split("\n").join("\n    ");
}
function includesNewLine(elem) {
    return elem instanceof AST.TextElement && elem.value.includes("\n");
}
function isSelectExpr(elem) {
    return (elem instanceof AST.Placeable &&
        elem.expression instanceof AST.SelectExpression);
}
function shouldStartOnNewLine(pattern) {
    var isMultiline = pattern.elements.some(isSelectExpr) ||
        pattern.elements.some(includesNewLine);
    if (isMultiline) {
        var firstElement = pattern.elements[0];
        if (firstElement instanceof AST.TextElement) {
            var firstChar = firstElement.value[0];
            // Due to the indentation requirement these text characters may not appear
            // as the first character on a new line.
            if (firstChar === "[" || firstChar === "." || firstChar === "*") {
                return false;
            }
        }
        return true;
    }
    return false;
}
/** Bit masks representing the state of the serializer. */
var HAS_ENTRIES = 1;
var FluentSerializer = /** @class */ (function () {
    function FluentSerializer(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.withJunk, withJunk = _c === void 0 ? false : _c;
        this.withJunk = withJunk;
    }
    FluentSerializer.prototype.serialize = function (resource) {
        if (!(resource instanceof AST.Resource)) {
            throw new Error("Unknown resource type: ".concat(resource));
        }
        var state = 0;
        var parts = [];
        for (var _i = 0, _a = resource.body; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (!(entry instanceof AST.Junk) || this.withJunk) {
                parts.push(this.serializeEntry(entry, state));
                if (!(state & HAS_ENTRIES)) {
                    state |= HAS_ENTRIES;
                }
            }
        }
        return parts.join("");
    };
    FluentSerializer.prototype.serializeEntry = function (entry, state) {
        if (state === void 0) { state = 0; }
        if (entry instanceof AST.Message) {
            return serializeMessage(entry);
        }
        if (entry instanceof AST.Term) {
            return serializeTerm(entry);
        }
        if (entry instanceof AST.Comment) {
            if (state & HAS_ENTRIES) {
                return "\n".concat(serializeComment(entry, "#"), "\n");
            }
            return "".concat(serializeComment(entry, "#"), "\n");
        }
        if (entry instanceof AST.GroupComment) {
            if (state & HAS_ENTRIES) {
                return "\n".concat(serializeComment(entry, "##"), "\n");
            }
            return "".concat(serializeComment(entry, "##"), "\n");
        }
        if (entry instanceof AST.ResourceComment) {
            if (state & HAS_ENTRIES) {
                return "\n".concat(serializeComment(entry, "###"), "\n");
            }
            return "".concat(serializeComment(entry, "###"), "\n");
        }
        if (entry instanceof AST.Junk) {
            return serializeJunk(entry);
        }
        throw new Error("Unknown entry type: ".concat(entry));
    };
    return FluentSerializer;
}());
exports.FluentSerializer = FluentSerializer;
function serializeComment(comment, prefix) {
    if (prefix === void 0) { prefix = "#"; }
    var prefixed = comment.content
        .split("\n")
        .map(function (line) { return (line.length ? "".concat(prefix, " ").concat(line) : prefix); })
        .join("\n");
    // Add the trailing newline.
    return "".concat(prefixed, "\n");
}
function serializeJunk(junk) {
    return junk.content;
}
function serializeMessage(message) {
    var parts = [];
    if (message.comment) {
        parts.push(serializeComment(message.comment));
    }
    parts.push("".concat(message.id.name, " ="));
    if (message.value) {
        parts.push(serializePattern(message.value));
    }
    for (var _i = 0, _a = message.attributes; _i < _a.length; _i++) {
        var attribute = _a[_i];
        parts.push(serializeAttribute(attribute));
    }
    parts.push("\n");
    return parts.join("");
}
function serializeTerm(term) {
    var parts = [];
    if (term.comment) {
        parts.push(serializeComment(term.comment));
    }
    parts.push("-".concat(term.id.name, " ="));
    parts.push(serializePattern(term.value));
    for (var _i = 0, _a = term.attributes; _i < _a.length; _i++) {
        var attribute = _a[_i];
        parts.push(serializeAttribute(attribute));
    }
    parts.push("\n");
    return parts.join("");
}
function serializeAttribute(attribute) {
    var value = indentExceptFirstLine(serializePattern(attribute.value));
    return "\n    .".concat(attribute.id.name, " =").concat(value);
}
function serializePattern(pattern) {
    var content = pattern.elements.map(serializeElement).join("");
    if (shouldStartOnNewLine(pattern)) {
        return "\n    ".concat(indentExceptFirstLine(content));
    }
    return " ".concat(indentExceptFirstLine(content));
}
function serializeElement(element) {
    if (element instanceof AST.TextElement) {
        return element.value;
    }
    if (element instanceof AST.Placeable) {
        return serializePlaceable(element);
    }
    throw new Error("Unknown element type: ".concat(element));
}
function serializePlaceable(placeable) {
    var expr = placeable.expression;
    if (expr instanceof AST.Placeable) {
        return "{".concat(serializePlaceable(expr), "}");
    }
    if (expr instanceof AST.SelectExpression) {
        // Special-case select expression to control the whitespace around the
        // opening and the closing brace.
        return "{ ".concat(serializeExpression(expr), "}");
    }
    return "{ ".concat(serializeExpression(expr), " }");
}
function serializeExpression(expr) {
    if (expr instanceof AST.StringLiteral) {
        return "\"".concat(expr.value, "\"");
    }
    if (expr instanceof AST.NumberLiteral) {
        return expr.value;
    }
    if (expr instanceof AST.VariableReference) {
        return "$".concat(expr.id.name);
    }
    if (expr instanceof AST.TermReference) {
        var out = "-".concat(expr.id.name);
        if (expr.attribute) {
            out += ".".concat(expr.attribute.name);
        }
        if (expr.arguments) {
            out += serializeCallArguments(expr.arguments);
        }
        return out;
    }
    if (expr instanceof AST.MessageReference) {
        var out = expr.id.name;
        if (expr.attribute) {
            out += ".".concat(expr.attribute.name);
        }
        return out;
    }
    if (expr instanceof AST.FunctionReference) {
        return "".concat(expr.id.name).concat(serializeCallArguments(expr.arguments));
    }
    if (expr instanceof AST.SelectExpression) {
        var out = "".concat(serializeExpression(expr.selector), " ->");
        for (var _i = 0, _a = expr.variants; _i < _a.length; _i++) {
            var variant = _a[_i];
            out += serializeVariant(variant);
        }
        return "".concat(out, "\n");
    }
    if (expr instanceof AST.Placeable) {
        return serializePlaceable(expr);
    }
    throw new Error("Unknown expression type: ".concat(expr));
}
function serializeVariant(variant) {
    var key = serializeVariantKey(variant.key);
    var value = indentExceptFirstLine(serializePattern(variant.value));
    if (variant.default) {
        return "\n   *[".concat(key, "]").concat(value);
    }
    return "\n    [".concat(key, "]").concat(value);
}
function serializeCallArguments(expr) {
    var positional = expr.positional.map(serializeExpression).join(", ");
    var named = expr.named.map(serializeNamedArgument).join(", ");
    if (expr.positional.length > 0 && expr.named.length > 0) {
        return "(".concat(positional, ", ").concat(named, ")");
    }
    return "(".concat(positional || named, ")");
}
function serializeNamedArgument(arg) {
    var value = serializeExpression(arg.value);
    return "".concat(arg.name.name, ": ").concat(value);
}
function serializeVariantKey(key) {
    if (key instanceof AST.Identifier) {
        return key.name;
    }
    if (key instanceof AST.NumberLiteral) {
        return key.value;
    }
    throw new Error("Unknown variant key type: ".concat(key));
}
