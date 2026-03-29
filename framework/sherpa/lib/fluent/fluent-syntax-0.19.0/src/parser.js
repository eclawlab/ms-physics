"use strict";
/*  eslint no-magic-numbers: [0]  */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Indent = exports.FluentParser = void 0;
var AST = require("./ast.js");
var stream_js_1 = require("./stream.js");
var errors_js_1 = require("./errors.js");
var trailingWSRe = /[ \n\r]+$/;
function withSpan(fn) {
    return function (ps) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this.withSpans) {
            return fn.call.apply(fn, __spreadArray([this, ps], args, false));
        }
        var start = ps.index;
        var node = fn.call.apply(fn, __spreadArray([this, ps], args, false));
        // Don't re-add the span if the node already has it. This may happen when
        // one decorated function calls another decorated function.
        if (node.span) {
            return node;
        }
        var end = ps.index;
        node.addSpan(start, end);
        return node;
    };
}
var FluentParser = /** @class */ (function () {
    function FluentParser(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.withSpans, withSpans = _c === void 0 ? true : _c;
        this.withSpans = withSpans;
        // Poor man's decorators.
        /* eslint-disable @typescript-eslint/unbound-method */
        this.getComment = withSpan(this.getComment);
        this.getMessage = withSpan(this.getMessage);
        this.getTerm = withSpan(this.getTerm);
        this.getAttribute = withSpan(this.getAttribute);
        this.getIdentifier = withSpan(this.getIdentifier);
        this.getVariant = withSpan(this.getVariant);
        this.getNumber = withSpan(this.getNumber);
        this.getPattern = withSpan(this.getPattern);
        this.getTextElement = withSpan(this.getTextElement);
        this.getPlaceable = withSpan(this.getPlaceable);
        this.getExpression = withSpan(this.getExpression);
        this.getInlineExpression = withSpan(this.getInlineExpression);
        this.getCallArgument = withSpan(this.getCallArgument);
        this.getCallArguments = withSpan(this.getCallArguments);
        this.getString = withSpan(this.getString);
        this.getLiteral = withSpan(this.getLiteral);
        this.getComment = withSpan(this.getComment);
        /* eslint-enable @typescript-eslint/unbound-method */
    }
    FluentParser.prototype.parse = function (source) {
        var ps = new stream_js_1.FluentParserStream(source);
        ps.skipBlankBlock();
        var entries = [];
        var lastComment = null;
        while (ps.currentChar()) {
            var entry = this.getEntryOrJunk(ps);
            var blankLines = ps.skipBlankBlock();
            // Regular Comments require special logic. Comments may be attached to
            // Messages or Terms if they are followed immediately by them. However
            // they should parse as standalone when they're followed by Junk.
            // Consequently, we only attach Comments once we know that the Message
            // or the Term parsed successfully.
            if (entry instanceof AST.Comment &&
                blankLines.length === 0 &&
                ps.currentChar()) {
                // Stash the comment and decide what to do with it in the next pass.
                lastComment = entry;
                continue;
            }
            if (lastComment) {
                if (entry instanceof AST.Message || entry instanceof AST.Term) {
                    entry.comment = lastComment;
                    if (this.withSpans) {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        entry.span.start = entry.comment.span.start;
                    }
                }
                else {
                    entries.push(lastComment);
                }
                // In either case, the stashed comment has been dealt with; clear it.
                lastComment = null;
            }
            // No special logic for other types of entries.
            entries.push(entry);
        }
        var res = new AST.Resource(entries);
        if (this.withSpans) {
            res.addSpan(0, ps.index);
        }
        return res;
    };
    /**
     * Parse the first Message or Term in `source`.
     *
     * Skip all encountered comments and start parsing at the first Message or
     * Term start. Return Junk if the parsing is not successful.
     *
     * Preceding comments are ignored unless they contain syntax errors
     * themselves, in which case Junk for the invalid comment is returned.
     */
    FluentParser.prototype.parseEntry = function (source) {
        var ps = new stream_js_1.FluentParserStream(source);
        ps.skipBlankBlock();
        while (ps.currentChar() === "#") {
            var skipped = this.getEntryOrJunk(ps);
            if (skipped instanceof AST.Junk) {
                // Don't skip Junk comments.
                return skipped;
            }
            ps.skipBlankBlock();
        }
        return this.getEntryOrJunk(ps);
    };
    FluentParser.prototype.getEntryOrJunk = function (ps) {
        var entryStartPos = ps.index;
        try {
            var entry = this.getEntry(ps);
            ps.expectLineEnd();
            return entry;
        }
        catch (err) {
            if (!(err instanceof errors_js_1.ParseError)) {
                throw err;
            }
            var errorIndex = ps.index;
            ps.skipToNextEntryStart(entryStartPos);
            var nextEntryStart = ps.index;
            if (nextEntryStart < errorIndex) {
                // The position of the error must be inside of the Junk's span.
                errorIndex = nextEntryStart;
            }
            // Create a Junk instance
            var slice = ps.string.substring(entryStartPos, nextEntryStart);
            var junk = new AST.Junk(slice);
            if (this.withSpans) {
                junk.addSpan(entryStartPos, nextEntryStart);
            }
            var annot = new AST.Annotation(err.code, err.args, err.message);
            annot.addSpan(errorIndex, errorIndex);
            junk.addAnnotation(annot);
            return junk;
        }
    };
    FluentParser.prototype.getEntry = function (ps) {
        if (ps.currentChar() === "#") {
            return this.getComment(ps);
        }
        if (ps.currentChar() === "-") {
            return this.getTerm(ps);
        }
        if (ps.isIdentifierStart()) {
            return this.getMessage(ps);
        }
        throw new errors_js_1.ParseError("E0002");
    };
    FluentParser.prototype.getComment = function (ps) {
        // 0 - comment
        // 1 - group comment
        // 2 - resource comment
        var level = -1;
        var content = "";
        while (true) {
            var i = -1;
            while (ps.currentChar() === "#" && i < (level === -1 ? 2 : level)) {
                ps.next();
                i++;
            }
            if (level === -1) {
                level = i;
            }
            if (ps.currentChar() !== stream_js_1.EOL) {
                ps.expectChar(" ");
                var ch = void 0;
                while ((ch = ps.takeChar(function (x) { return x !== stream_js_1.EOL; }))) {
                    content += ch;
                }
            }
            if (ps.isNextLineComment(level)) {
                content += ps.currentChar();
                ps.next();
            }
            else {
                break;
            }
        }
        var Comment;
        switch (level) {
            case 0:
                Comment = AST.Comment;
                break;
            case 1:
                Comment = AST.GroupComment;
                break;
            default:
                Comment = AST.ResourceComment;
        }
        return new Comment(content);
    };
    FluentParser.prototype.getMessage = function (ps) {
        var id = this.getIdentifier(ps);
        ps.skipBlankInline();
        ps.expectChar("=");
        var value = this.maybeGetPattern(ps);
        var attrs = this.getAttributes(ps);
        if (value === null && attrs.length === 0) {
            throw new errors_js_1.ParseError("E0005", id.name);
        }
        return new AST.Message(id, value, attrs);
    };
    FluentParser.prototype.getTerm = function (ps) {
        ps.expectChar("-");
        var id = this.getIdentifier(ps);
        ps.skipBlankInline();
        ps.expectChar("=");
        var value = this.maybeGetPattern(ps);
        if (value === null) {
            throw new errors_js_1.ParseError("E0006", id.name);
        }
        var attrs = this.getAttributes(ps);
        return new AST.Term(id, value, attrs);
    };
    FluentParser.prototype.getAttribute = function (ps) {
        ps.expectChar(".");
        var key = this.getIdentifier(ps);
        ps.skipBlankInline();
        ps.expectChar("=");
        var value = this.maybeGetPattern(ps);
        if (value === null) {
            throw new errors_js_1.ParseError("E0012");
        }
        return new AST.Attribute(key, value);
    };
    FluentParser.prototype.getAttributes = function (ps) {
        var attrs = [];
        ps.peekBlank();
        while (ps.isAttributeStart()) {
            ps.skipToPeek();
            var attr = this.getAttribute(ps);
            attrs.push(attr);
            ps.peekBlank();
        }
        return attrs;
    };
    FluentParser.prototype.getIdentifier = function (ps) {
        var name = ps.takeIDStart();
        var ch;
        while ((ch = ps.takeIDChar())) {
            name += ch;
        }
        return new AST.Identifier(name);
    };
    FluentParser.prototype.getVariantKey = function (ps) {
        var ch = ps.currentChar();
        if (ch === stream_js_1.EOF) {
            throw new errors_js_1.ParseError("E0013");
        }
        var cc = ch.charCodeAt(0);
        if ((cc >= 48 && cc <= 57) || cc === 45) {
            // 0-9, -
            return this.getNumber(ps);
        }
        return this.getIdentifier(ps);
    };
    FluentParser.prototype.getVariant = function (ps, hasDefault) {
        if (hasDefault === void 0) { hasDefault = false; }
        var defaultIndex = false;
        if (ps.currentChar() === "*") {
            if (hasDefault) {
                throw new errors_js_1.ParseError("E0015");
            }
            ps.next();
            defaultIndex = true;
        }
        ps.expectChar("[");
        ps.skipBlank();
        var key = this.getVariantKey(ps);
        ps.skipBlank();
        ps.expectChar("]");
        var value = this.maybeGetPattern(ps);
        if (value === null) {
            throw new errors_js_1.ParseError("E0012");
        }
        return new AST.Variant(key, value, defaultIndex);
    };
    FluentParser.prototype.getVariants = function (ps) {
        var variants = [];
        var hasDefault = false;
        ps.skipBlank();
        while (ps.isVariantStart()) {
            var variant = this.getVariant(ps, hasDefault);
            if (variant.default) {
                hasDefault = true;
            }
            variants.push(variant);
            ps.expectLineEnd();
            ps.skipBlank();
        }
        if (variants.length === 0) {
            throw new errors_js_1.ParseError("E0011");
        }
        if (!hasDefault) {
            throw new errors_js_1.ParseError("E0010");
        }
        return variants;
    };
    FluentParser.prototype.getDigits = function (ps) {
        var num = "";
        var ch;
        while ((ch = ps.takeDigit())) {
            num += ch;
        }
        if (num.length === 0) {
            throw new errors_js_1.ParseError("E0004", "0-9");
        }
        return num;
    };
    FluentParser.prototype.getNumber = function (ps) {
        var value = "";
        if (ps.currentChar() === "-") {
            ps.next();
            value += "-".concat(this.getDigits(ps));
        }
        else {
            value += this.getDigits(ps);
        }
        if (ps.currentChar() === ".") {
            ps.next();
            value += ".".concat(this.getDigits(ps));
        }
        return new AST.NumberLiteral(value);
    };
    /**
     * maybeGetPattern distinguishes between patterns which start on the same line
     * as the identifier (a.k.a. inline signleline patterns and inline multiline
     * patterns) and patterns which start on a new line (a.k.a. block multiline
     * patterns). The distinction is important for the dedentation logic: the
     * indent of the first line of a block pattern must be taken into account when
     * calculating the maximum common indent.
     */
    FluentParser.prototype.maybeGetPattern = function (ps) {
        ps.peekBlankInline();
        if (ps.isValueStart()) {
            ps.skipToPeek();
            return this.getPattern(ps, false);
        }
        ps.peekBlankBlock();
        if (ps.isValueContinuation()) {
            ps.skipToPeek();
            return this.getPattern(ps, true);
        }
        return null;
    };
    FluentParser.prototype.getPattern = function (ps, isBlock) {
        var elements = [];
        var commonIndentLength;
        if (isBlock) {
            // A block pattern is a pattern which starts on a new line. Store and
            // measure the indent of this first line for the dedentation logic.
            var blankStart = ps.index;
            var firstIndent = ps.skipBlankInline();
            elements.push(this.getIndent(ps, firstIndent, blankStart));
            commonIndentLength = firstIndent.length;
        }
        else {
            commonIndentLength = Infinity;
        }
        var ch;
        elements: while ((ch = ps.currentChar())) {
            switch (ch) {
                case stream_js_1.EOL: {
                    var blankStart = ps.index;
                    var blankLines = ps.peekBlankBlock();
                    if (ps.isValueContinuation()) {
                        ps.skipToPeek();
                        var indent = ps.skipBlankInline();
                        commonIndentLength = Math.min(commonIndentLength, indent.length);
                        elements.push(this.getIndent(ps, blankLines + indent, blankStart));
                        continue elements;
                    }
                    // The end condition for getPattern's while loop is a newline
                    // which is not followed by a valid pattern continuation.
                    ps.resetPeek();
                    break elements;
                }
                case "{":
                    elements.push(this.getPlaceable(ps));
                    continue elements;
                case "}":
                    throw new errors_js_1.ParseError("E0027");
                default:
                    elements.push(this.getTextElement(ps));
            }
        }
        var dedented = this.dedent(elements, commonIndentLength);
        return new AST.Pattern(dedented);
    };
    /**
     * Create a token representing an indent. It's not part of the AST and it will
     * be trimmed and merged into adjacent TextElements, or turned into a new
     * TextElement, if it's surrounded by two Placeables.
     */
    FluentParser.prototype.getIndent = function (ps, value, start) {
        return new Indent(value, start, ps.index);
    };
    /**
     * Dedent a list of elements by removing the maximum common indent from the
     * beginning of text lines. The common indent is calculated in getPattern.
     */
    FluentParser.prototype.dedent = function (elements, commonIndent) {
        var trimmed = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var element = elements_1[_i];
            if (element instanceof AST.Placeable) {
                trimmed.push(element);
                continue;
            }
            if (element instanceof Indent) {
                // Strip common indent.
                element.value = element.value.slice(0, element.value.length - commonIndent);
                if (element.value.length === 0) {
                    continue;
                }
            }
            var prev = trimmed[trimmed.length - 1];
            if (prev && prev instanceof AST.TextElement) {
                // Join adjacent TextElements by replacing them with their sum.
                var sum = new AST.TextElement(prev.value + element.value);
                if (this.withSpans) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    sum.addSpan(prev.span.start, element.span.end);
                }
                trimmed[trimmed.length - 1] = sum;
                continue;
            }
            if (element instanceof Indent) {
                // If the indent hasn't been merged into a preceding TextElement,
                // convert it into a new TextElement.
                var textElement = new AST.TextElement(element.value);
                if (this.withSpans) {
                    textElement.addSpan(element.span.start, element.span.end);
                }
                element = textElement;
            }
            trimmed.push(element);
        }
        // Trim trailing whitespace from the Pattern.
        var lastElement = trimmed[trimmed.length - 1];
        if (lastElement instanceof AST.TextElement) {
            lastElement.value = lastElement.value.replace(trailingWSRe, "");
            if (lastElement.value.length === 0) {
                trimmed.pop();
            }
        }
        return trimmed;
    };
    FluentParser.prototype.getTextElement = function (ps) {
        var buffer = "";
        var ch;
        while ((ch = ps.currentChar())) {
            if (ch === "{" || ch === "}") {
                return new AST.TextElement(buffer);
            }
            if (ch === stream_js_1.EOL) {
                return new AST.TextElement(buffer);
            }
            buffer += ch;
            ps.next();
        }
        return new AST.TextElement(buffer);
    };
    FluentParser.prototype.getEscapeSequence = function (ps) {
        var next = ps.currentChar();
        switch (next) {
            case "\\":
            case '"':
                ps.next();
                return "\\".concat(next);
            case "u":
                return this.getUnicodeEscapeSequence(ps, next, 4);
            case "U":
                return this.getUnicodeEscapeSequence(ps, next, 6);
            default:
                throw new errors_js_1.ParseError("E0025", next);
        }
    };
    FluentParser.prototype.getUnicodeEscapeSequence = function (ps, u, digits) {
        ps.expectChar(u);
        var sequence = "";
        for (var i = 0; i < digits; i++) {
            var ch = ps.takeHexDigit();
            if (!ch) {
                throw new errors_js_1.ParseError("E0026", "\\".concat(u).concat(sequence).concat(ps.currentChar()));
            }
            sequence += ch;
        }
        return "\\".concat(u).concat(sequence);
    };
    FluentParser.prototype.getPlaceable = function (ps) {
        ps.expectChar("{");
        ps.skipBlank();
        var expression = this.getExpression(ps);
        ps.expectChar("}");
        return new AST.Placeable(expression);
    };
    FluentParser.prototype.getExpression = function (ps) {
        var selector = this.getInlineExpression(ps);
        ps.skipBlank();
        if (ps.currentChar() === "-") {
            if (ps.peek() !== ">") {
                ps.resetPeek();
                return selector;
            }
            // Validate selector expression according to
            // abstract.js in the Fluent specification
            if (selector instanceof AST.MessageReference) {
                if (selector.attribute === null) {
                    throw new errors_js_1.ParseError("E0016");
                }
                else {
                    throw new errors_js_1.ParseError("E0018");
                }
            }
            else if (selector instanceof AST.TermReference) {
                if (selector.attribute === null) {
                    throw new errors_js_1.ParseError("E0017");
                }
            }
            else if (selector instanceof AST.Placeable) {
                throw new errors_js_1.ParseError("E0029");
            }
            ps.next();
            ps.next();
            ps.skipBlankInline();
            ps.expectLineEnd();
            var variants = this.getVariants(ps);
            return new AST.SelectExpression(selector, variants);
        }
        if (selector instanceof AST.TermReference && selector.attribute !== null) {
            throw new errors_js_1.ParseError("E0019");
        }
        return selector;
    };
    FluentParser.prototype.getInlineExpression = function (ps) {
        if (ps.currentChar() === "{") {
            return this.getPlaceable(ps);
        }
        if (ps.isNumberStart()) {
            return this.getNumber(ps);
        }
        if (ps.currentChar() === '"') {
            return this.getString(ps);
        }
        if (ps.currentChar() === "$") {
            ps.next();
            var id = this.getIdentifier(ps);
            return new AST.VariableReference(id);
        }
        if (ps.currentChar() === "-") {
            ps.next();
            var id = this.getIdentifier(ps);
            var attr = void 0;
            if (ps.currentChar() === ".") {
                ps.next();
                attr = this.getIdentifier(ps);
            }
            var args = void 0;
            ps.peekBlank();
            if (ps.currentPeek() === "(") {
                ps.skipToPeek();
                args = this.getCallArguments(ps);
            }
            return new AST.TermReference(id, attr, args);
        }
        if (ps.isIdentifierStart()) {
            var id = this.getIdentifier(ps);
            ps.peekBlank();
            if (ps.currentPeek() === "(") {
                // It's a Function. Ensure it's all upper-case.
                if (!/^[A-Z][A-Z0-9_-]*$/.test(id.name)) {
                    throw new errors_js_1.ParseError("E0008");
                }
                ps.skipToPeek();
                var args = this.getCallArguments(ps);
                return new AST.FunctionReference(id, args);
            }
            var attr = void 0;
            if (ps.currentChar() === ".") {
                ps.next();
                attr = this.getIdentifier(ps);
            }
            return new AST.MessageReference(id, attr);
        }
        throw new errors_js_1.ParseError("E0028");
    };
    FluentParser.prototype.getCallArgument = function (ps) {
        var exp = this.getInlineExpression(ps);
        ps.skipBlank();
        if (ps.currentChar() !== ":") {
            return exp;
        }
        if (exp instanceof AST.MessageReference && exp.attribute === null) {
            ps.next();
            ps.skipBlank();
            var value = this.getLiteral(ps);
            return new AST.NamedArgument(exp.id, value);
        }
        throw new errors_js_1.ParseError("E0009");
    };
    FluentParser.prototype.getCallArguments = function (ps) {
        var positional = [];
        var named = [];
        var argumentNames = new Set();
        ps.expectChar("(");
        ps.skipBlank();
        while (true) {
            if (ps.currentChar() === ")") {
                break;
            }
            var arg = this.getCallArgument(ps);
            if (arg instanceof AST.NamedArgument) {
                if (argumentNames.has(arg.name.name)) {
                    throw new errors_js_1.ParseError("E0022");
                }
                named.push(arg);
                argumentNames.add(arg.name.name);
            }
            else if (argumentNames.size > 0) {
                throw new errors_js_1.ParseError("E0021");
            }
            else {
                positional.push(arg);
            }
            ps.skipBlank();
            if (ps.currentChar() === ",") {
                ps.next();
                ps.skipBlank();
                continue;
            }
            break;
        }
        ps.expectChar(")");
        return new AST.CallArguments(positional, named);
    };
    FluentParser.prototype.getString = function (ps) {
        ps.expectChar('"');
        var value = "";
        var ch;
        while ((ch = ps.takeChar(function (x) { return x !== '"' && x !== stream_js_1.EOL; }))) {
            if (ch === "\\") {
                value += this.getEscapeSequence(ps);
            }
            else {
                value += ch;
            }
        }
        if (ps.currentChar() === stream_js_1.EOL) {
            throw new errors_js_1.ParseError("E0020");
        }
        ps.expectChar('"');
        return new AST.StringLiteral(value);
    };
    FluentParser.prototype.getLiteral = function (ps) {
        if (ps.isNumberStart()) {
            return this.getNumber(ps);
        }
        if (ps.currentChar() === '"') {
            return this.getString(ps);
        }
        throw new errors_js_1.ParseError("E0014");
    };
    return FluentParser;
}());
exports.FluentParser = FluentParser;
var Indent = /** @class */ (function () {
    /** @ignore */
    function Indent(value, start, end) {
        this.type = "Indent";
        this.value = value;
        this.span = new AST.Span(start, end);
    }
    return Indent;
}());
exports.Indent = Indent;
