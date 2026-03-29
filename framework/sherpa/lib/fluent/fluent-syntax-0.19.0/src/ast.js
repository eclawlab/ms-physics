"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Annotation = exports.Span = exports.Junk = exports.ResourceComment = exports.GroupComment = exports.Comment = exports.BaseComment = exports.Identifier = exports.NamedArgument = exports.Variant = exports.Attribute = exports.CallArguments = exports.SelectExpression = exports.FunctionReference = exports.VariableReference = exports.TermReference = exports.MessageReference = exports.NumberLiteral = exports.StringLiteral = exports.BaseLiteral = exports.Placeable = exports.TextElement = exports.Pattern = exports.Term = exports.Message = exports.Resource = exports.SyntaxNode = exports.BaseNode = void 0;
/**
 * Base class for all Fluent AST nodes.
 *
 * All productions described in the ASDL subclass BaseNode, including Span and
 * Annotation.
 *
 */
var BaseNode = /** @class */ (function () {
    function BaseNode() {
    }
    BaseNode.prototype.equals = function (other, ignoredFields) {
        if (ignoredFields === void 0) { ignoredFields = ["span"]; }
        var thisKeys = new Set(Object.keys(this));
        var otherKeys = new Set(Object.keys(other));
        if (ignoredFields) {
            for (var _i = 0, ignoredFields_1 = ignoredFields; _i < ignoredFields_1.length; _i++) {
                var fieldName = ignoredFields_1[_i];
                thisKeys.delete(fieldName);
                otherKeys.delete(fieldName);
            }
        }
        if (thisKeys.size !== otherKeys.size) {
            return false;
        }
        for (var _a = 0, thisKeys_1 = thisKeys; _a < thisKeys_1.length; _a++) {
            var fieldName = thisKeys_1[_a];
            if (!otherKeys.has(fieldName)) {
                return false;
            }
            var thisVal = this[fieldName];
            var otherVal = other[fieldName];
            if (typeof thisVal !== typeof otherVal) {
                return false;
            }
            if (thisVal instanceof Array && otherVal instanceof Array) {
                if (thisVal.length !== otherVal.length) {
                    return false;
                }
                for (var i = 0; i < thisVal.length; ++i) {
                    if (!scalarsEqual(thisVal[i], otherVal[i], ignoredFields)) {
                        return false;
                    }
                }
            }
            else if (!scalarsEqual(thisVal, otherVal, ignoredFields)) {
                return false;
            }
        }
        return true;
    };
    BaseNode.prototype.clone = function () {
        function visit(value) {
            if (value instanceof BaseNode) {
                return value.clone();
            }
            if (Array.isArray(value)) {
                return value.map(visit);
            }
            return value;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        var clone = Object.create(this.constructor.prototype);
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var prop = _a[_i];
            clone[prop] = visit(this[prop]);
        }
        return clone;
    };
    return BaseNode;
}());
exports.BaseNode = BaseNode;
function scalarsEqual(thisVal, otherVal, ignoredFields) {
    if (thisVal instanceof BaseNode && otherVal instanceof BaseNode) {
        return thisVal.equals(otherVal, ignoredFields);
    }
    return thisVal === otherVal;
}
/**
 * Base class for AST nodes which can have Spans.
 */
var SyntaxNode = /** @class */ (function (_super) {
    __extends(SyntaxNode, _super);
    function SyntaxNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** @ignore */
    SyntaxNode.prototype.addSpan = function (start, end) {
        this.span = new Span(start, end);
    };
    return SyntaxNode;
}(BaseNode));
exports.SyntaxNode = SyntaxNode;
var Resource = /** @class */ (function (_super) {
    __extends(Resource, _super);
    function Resource(body) {
        if (body === void 0) { body = []; }
        var _this = _super.call(this) || this;
        _this.type = "Resource";
        _this.body = body;
        return _this;
    }
    return Resource;
}(SyntaxNode));
exports.Resource = Resource;
var Message = /** @class */ (function (_super) {
    __extends(Message, _super);
    function Message(id, value, attributes, comment) {
        if (value === void 0) { value = null; }
        if (attributes === void 0) { attributes = []; }
        if (comment === void 0) { comment = null; }
        var _this = _super.call(this) || this;
        _this.type = "Message";
        _this.id = id;
        _this.value = value;
        _this.attributes = attributes;
        _this.comment = comment;
        return _this;
    }
    return Message;
}(SyntaxNode));
exports.Message = Message;
var Term = /** @class */ (function (_super) {
    __extends(Term, _super);
    function Term(id, value, attributes, comment) {
        if (attributes === void 0) { attributes = []; }
        if (comment === void 0) { comment = null; }
        var _this = _super.call(this) || this;
        _this.type = "Term";
        _this.id = id;
        _this.value = value;
        _this.attributes = attributes;
        _this.comment = comment;
        return _this;
    }
    return Term;
}(SyntaxNode));
exports.Term = Term;
var Pattern = /** @class */ (function (_super) {
    __extends(Pattern, _super);
    function Pattern(elements) {
        var _this = _super.call(this) || this;
        _this.type = "Pattern";
        _this.elements = elements;
        return _this;
    }
    return Pattern;
}(SyntaxNode));
exports.Pattern = Pattern;
var TextElement = /** @class */ (function (_super) {
    __extends(TextElement, _super);
    function TextElement(value) {
        var _this = _super.call(this) || this;
        _this.type = "TextElement";
        _this.value = value;
        return _this;
    }
    return TextElement;
}(SyntaxNode));
exports.TextElement = TextElement;
var Placeable = /** @class */ (function (_super) {
    __extends(Placeable, _super);
    function Placeable(expression) {
        var _this = _super.call(this) || this;
        _this.type = "Placeable";
        _this.expression = expression;
        return _this;
    }
    return Placeable;
}(SyntaxNode));
exports.Placeable = Placeable;
// An abstract base class for Literals.
var BaseLiteral = /** @class */ (function (_super) {
    __extends(BaseLiteral, _super);
    function BaseLiteral(value) {
        var _this = _super.call(this) || this;
        // The "value" field contains the exact contents of the literal,
        // character-for-character.
        _this.value = value;
        return _this;
    }
    return BaseLiteral;
}(SyntaxNode));
exports.BaseLiteral = BaseLiteral;
var StringLiteral = /** @class */ (function (_super) {
    __extends(StringLiteral, _super);
    function StringLiteral() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "StringLiteral";
        return _this;
    }
    StringLiteral.prototype.parse = function () {
        // Backslash backslash, backslash double quote, uHHHH, UHHHHHH.
        var KNOWN_ESCAPES = /(?:\\\\|\\"|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
        function fromEscapeSequence(match, codepoint4, codepoint6) {
            switch (match) {
                case "\\\\":
                    return "\\";
                case '\\"':
                    return '"';
                default: {
                    var codepoint = parseInt(codepoint4 || codepoint6, 16);
                    if (codepoint <= 0xd7ff || 0xe000 <= codepoint) {
                        // It's a Unicode scalar value.
                        return String.fromCodePoint(codepoint);
                    }
                    // Escape sequences reresenting surrogate code points are
                    // well-formed but invalid in Fluent. Replace them with U+FFFD
                    // REPLACEMENT CHARACTER.
                    return "�";
                }
            }
        }
        var value = this.value.replace(KNOWN_ESCAPES, fromEscapeSequence);
        return { value: value };
    };
    return StringLiteral;
}(BaseLiteral));
exports.StringLiteral = StringLiteral;
var NumberLiteral = /** @class */ (function (_super) {
    __extends(NumberLiteral, _super);
    function NumberLiteral() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "NumberLiteral";
        return _this;
    }
    NumberLiteral.prototype.parse = function () {
        var value = parseFloat(this.value);
        var decimalPos = this.value.indexOf(".");
        var precision = decimalPos > 0 ? this.value.length - decimalPos - 1 : 0;
        return { value: value, precision: precision };
    };
    return NumberLiteral;
}(BaseLiteral));
exports.NumberLiteral = NumberLiteral;
var MessageReference = /** @class */ (function (_super) {
    __extends(MessageReference, _super);
    function MessageReference(id, attribute) {
        if (attribute === void 0) { attribute = null; }
        var _this = _super.call(this) || this;
        _this.type = "MessageReference";
        _this.id = id;
        _this.attribute = attribute;
        return _this;
    }
    return MessageReference;
}(SyntaxNode));
exports.MessageReference = MessageReference;
var TermReference = /** @class */ (function (_super) {
    __extends(TermReference, _super);
    function TermReference(id, attribute, args) {
        if (attribute === void 0) { attribute = null; }
        if (args === void 0) { args = null; }
        var _this = _super.call(this) || this;
        _this.type = "TermReference";
        _this.id = id;
        _this.attribute = attribute;
        _this.arguments = args;
        return _this;
    }
    return TermReference;
}(SyntaxNode));
exports.TermReference = TermReference;
var VariableReference = /** @class */ (function (_super) {
    __extends(VariableReference, _super);
    function VariableReference(id) {
        var _this = _super.call(this) || this;
        _this.type = "VariableReference";
        _this.id = id;
        return _this;
    }
    return VariableReference;
}(SyntaxNode));
exports.VariableReference = VariableReference;
var FunctionReference = /** @class */ (function (_super) {
    __extends(FunctionReference, _super);
    function FunctionReference(id, args) {
        var _this = _super.call(this) || this;
        _this.type = "FunctionReference";
        _this.id = id;
        _this.arguments = args;
        return _this;
    }
    return FunctionReference;
}(SyntaxNode));
exports.FunctionReference = FunctionReference;
var SelectExpression = /** @class */ (function (_super) {
    __extends(SelectExpression, _super);
    function SelectExpression(selector, variants) {
        var _this = _super.call(this) || this;
        _this.type = "SelectExpression";
        _this.selector = selector;
        _this.variants = variants;
        return _this;
    }
    return SelectExpression;
}(SyntaxNode));
exports.SelectExpression = SelectExpression;
var CallArguments = /** @class */ (function (_super) {
    __extends(CallArguments, _super);
    function CallArguments(positional, named) {
        if (positional === void 0) { positional = []; }
        if (named === void 0) { named = []; }
        var _this = _super.call(this) || this;
        _this.type = "CallArguments";
        _this.positional = positional;
        _this.named = named;
        return _this;
    }
    return CallArguments;
}(SyntaxNode));
exports.CallArguments = CallArguments;
var Attribute = /** @class */ (function (_super) {
    __extends(Attribute, _super);
    function Attribute(id, value) {
        var _this = _super.call(this) || this;
        _this.type = "Attribute";
        _this.id = id;
        _this.value = value;
        return _this;
    }
    return Attribute;
}(SyntaxNode));
exports.Attribute = Attribute;
var Variant = /** @class */ (function (_super) {
    __extends(Variant, _super);
    function Variant(key, value, def) {
        var _this = _super.call(this) || this;
        _this.type = "Variant";
        _this.key = key;
        _this.value = value;
        _this.default = def;
        return _this;
    }
    return Variant;
}(SyntaxNode));
exports.Variant = Variant;
var NamedArgument = /** @class */ (function (_super) {
    __extends(NamedArgument, _super);
    function NamedArgument(name, value) {
        var _this = _super.call(this) || this;
        _this.type = "NamedArgument";
        _this.name = name;
        _this.value = value;
        return _this;
    }
    return NamedArgument;
}(SyntaxNode));
exports.NamedArgument = NamedArgument;
var Identifier = /** @class */ (function (_super) {
    __extends(Identifier, _super);
    function Identifier(name) {
        var _this = _super.call(this) || this;
        _this.type = "Identifier";
        _this.name = name;
        return _this;
    }
    return Identifier;
}(SyntaxNode));
exports.Identifier = Identifier;
var BaseComment = /** @class */ (function (_super) {
    __extends(BaseComment, _super);
    function BaseComment(content) {
        var _this = _super.call(this) || this;
        _this.content = content;
        return _this;
    }
    return BaseComment;
}(SyntaxNode));
exports.BaseComment = BaseComment;
var Comment = /** @class */ (function (_super) {
    __extends(Comment, _super);
    function Comment() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "Comment";
        return _this;
    }
    return Comment;
}(BaseComment));
exports.Comment = Comment;
var GroupComment = /** @class */ (function (_super) {
    __extends(GroupComment, _super);
    function GroupComment() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "GroupComment";
        return _this;
    }
    return GroupComment;
}(BaseComment));
exports.GroupComment = GroupComment;
var ResourceComment = /** @class */ (function (_super) {
    __extends(ResourceComment, _super);
    function ResourceComment() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = "ResourceComment";
        return _this;
    }
    return ResourceComment;
}(BaseComment));
exports.ResourceComment = ResourceComment;
var Junk = /** @class */ (function (_super) {
    __extends(Junk, _super);
    function Junk(content) {
        var _this = _super.call(this) || this;
        _this.type = "Junk";
        _this.annotations = [];
        _this.content = content;
        return _this;
    }
    Junk.prototype.addAnnotation = function (annotation) {
        this.annotations.push(annotation);
    };
    return Junk;
}(SyntaxNode));
exports.Junk = Junk;
var Span = /** @class */ (function (_super) {
    __extends(Span, _super);
    function Span(start, end) {
        var _this = _super.call(this) || this;
        _this.type = "Span";
        _this.start = start;
        _this.end = end;
        return _this;
    }
    return Span;
}(BaseNode));
exports.Span = Span;
var Annotation = /** @class */ (function (_super) {
    __extends(Annotation, _super);
    function Annotation(code, args, message) {
        if (args === void 0) { args = []; }
        var _this = _super.call(this) || this;
        _this.type = "Annotation";
        _this.code = code;
        _this.arguments = args;
        _this.message = message;
        return _this;
    }
    return Annotation;
}(SyntaxNode));
exports.Annotation = Annotation;
