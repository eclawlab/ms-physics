"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentResource = void 0;
// This regex is used to iterate through the beginnings of messages and terms.
// With the /m flag, the ^ matches at the beginning of every line.
var RE_MESSAGE_START = /^(-?[a-zA-Z][\w-]*) *= */gm;
// Both Attributes and Variants are parsed in while loops. These regexes are
// used to break out of them.
var RE_ATTRIBUTE_START = /\.([a-zA-Z][\w-]*) *= */y;
var RE_VARIANT_START = /\*?\[/y;
var RE_NUMBER_LITERAL = /(-?[0-9]+(?:\.([0-9]+))?)/y;
var RE_IDENTIFIER = /([a-zA-Z][\w-]*)/y;
var RE_REFERENCE = /([$-])?([a-zA-Z][\w-]*)(?:\.([a-zA-Z][\w-]*))?/y;
var RE_FUNCTION_NAME = /^[A-Z][A-Z0-9_-]*$/;
// A "run" is a sequence of text or string literal characters which don't
// require any special handling. For TextElements such special characters are: {
// (starts a placeable), and line breaks which require additional logic to check
// if the next line is indented. For StringLiterals they are: \ (starts an
// escape sequence), " (ends the literal), and line breaks which are not allowed
// in StringLiterals. Note that string runs may be empty; text runs may not.
var RE_TEXT_RUN = /([^{}\n\r]+)/y;
var RE_STRING_RUN = /([^\\"\n\r]*)/y;
// Escape sequences.
var RE_STRING_ESCAPE = /\\([\\"])/y;
var RE_UNICODE_ESCAPE = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{6})/y;
// Used for trimming TextElements and indents.
var RE_LEADING_NEWLINES = /^\n+/;
var RE_TRAILING_SPACES = / +$/;
// Used in makeIndent to strip spaces from blank lines and normalize CRLF to LF.
var RE_BLANK_LINES = / *\r?\n/g;
// Used in makeIndent to measure the indentation.
var RE_INDENT = /( *)$/;
// Common tokens.
var TOKEN_BRACE_OPEN = /{\s*/y;
var TOKEN_BRACE_CLOSE = /\s*}/y;
var TOKEN_BRACKET_OPEN = /\[\s*/y;
var TOKEN_BRACKET_CLOSE = /\s*] */y;
var TOKEN_PAREN_OPEN = /\s*\(\s*/y;
var TOKEN_ARROW = /\s*->\s*/y;
var TOKEN_COLON = /\s*:\s*/y;
// Note the optional comma. As a deviation from the Fluent EBNF, the parser
// doesn't enforce commas between call arguments.
var TOKEN_COMMA = /\s*,?\s*/y;
var TOKEN_BLANK = /\s+/y;
/**
 * Fluent Resource is a structure storing parsed localization entries.
 */
var FluentResource = /** @class */ (function () {
    function FluentResource(source) {
        this.body = [];
        RE_MESSAGE_START.lastIndex = 0;
        var cursor = 0;
        // Iterate over the beginnings of messages and terms to efficiently skip
        // comments and recover from errors.
        while (true) {
            var next = RE_MESSAGE_START.exec(source);
            if (next === null) {
                break;
            }
            cursor = RE_MESSAGE_START.lastIndex;
            try {
                this.body.push(parseMessage(next[1]));
            }
            catch (err) {
                if (err instanceof SyntaxError) {
                    // Don't report any Fluent syntax errors. Skip directly to the
                    // beginning of the next message or term.
                    continue;
                }
                throw err;
            }
        }
        // The parser implementation is inlined below for performance reasons,
        // as well as for convenience of accessing `source` and `cursor`.
        // The parser focuses on minimizing the number of false negatives at the
        // expense of increasing the risk of false positives. In other words, it
        // aims at parsing valid Fluent messages with a success rate of 100%, but it
        // may also parse a few invalid messages which the reference parser would
        // reject. The parser doesn't perform any validation and may produce entries
        // which wouldn't make sense in the real world. For best results users are
        // advised to validate translations with the fluent-syntax parser
        // pre-runtime.
        // The parser makes an extensive use of sticky regexes which can be anchored
        // to any offset of the source string without slicing it. Errors are thrown
        // to bail out of parsing of ill-formed messages.
        function test(re) {
            re.lastIndex = cursor;
            return re.test(source);
        }
        // Advance the cursor by the char if it matches. May be used as a predicate
        // (was the match found?) or, if errorClass is passed, as an assertion.
        function consumeChar(char, errorClass) {
            if (source[cursor] === char) {
                cursor++;
                return true;
            }
            if (errorClass) {
                throw new errorClass("Expected ".concat(char));
            }
            return false;
        }
        // Advance the cursor by the token if it matches. May be used as a predicate
        // (was the match found?) or, if errorClass is passed, as an assertion.
        function consumeToken(re, errorClass) {
            if (test(re)) {
                cursor = re.lastIndex;
                return true;
            }
            if (errorClass) {
                throw new errorClass("Expected ".concat(re.toString()));
            }
            return false;
        }
        // Execute a regex, advance the cursor, and return all capture groups.
        function match(re) {
            re.lastIndex = cursor;
            var result = re.exec(source);
            if (result === null) {
                throw new SyntaxError("Expected ".concat(re.toString()));
            }
            cursor = re.lastIndex;
            return result;
        }
        // Execute a regex, advance the cursor, and return the capture group.
        function match1(re) {
            return match(re)[1];
        }
        function parseMessage(id) {
            var value = parsePattern();
            var attributes = parseAttributes();
            if (value === null && Object.keys(attributes).length === 0) {
                throw new SyntaxError("Expected message value or attributes");
            }
            return { id: id, value: value, attributes: attributes };
        }
        function parseAttributes() {
            var attrs = Object.create(null);
            while (test(RE_ATTRIBUTE_START)) {
                var name_1 = match1(RE_ATTRIBUTE_START);
                var value = parsePattern();
                if (value === null) {
                    throw new SyntaxError("Expected attribute value");
                }
                attrs[name_1] = value;
            }
            return attrs;
        }
        function parsePattern() {
            var first;
            // First try to parse any simple text on the same line as the id.
            if (test(RE_TEXT_RUN)) {
                first = match1(RE_TEXT_RUN);
            }
            // If there's a placeable on the first line, parse a complex pattern.
            if (source[cursor] === "{" || source[cursor] === "}") {
                // Re-use the text parsed above, if possible.
                return parsePatternElements(first ? [first] : [], Infinity);
            }
            // RE_TEXT_VALUE stops at newlines. Only continue parsing the pattern if
            // what comes after the newline is indented.
            var indent = parseIndent();
            if (indent) {
                if (first) {
                    // If there's text on the first line, the blank block is part of the
                    // translation content in its entirety.
                    return parsePatternElements([first, indent], indent.length);
                }
                // Otherwise, we're dealing with a block pattern, i.e. a pattern which
                // starts on a new line. Discrad the leading newlines but keep the
                // inline indent; it will be used by the dedentation logic.
                indent.value = trim(indent.value, RE_LEADING_NEWLINES);
                return parsePatternElements([indent], indent.length);
            }
            if (first) {
                // It was just a simple inline text after all.
                return trim(first, RE_TRAILING_SPACES);
            }
            return null;
        }
        // Parse a complex pattern as an array of elements.
        function parsePatternElements(elements, commonIndent) {
            if (elements === void 0) { elements = []; }
            while (true) {
                if (test(RE_TEXT_RUN)) {
                    elements.push(match1(RE_TEXT_RUN));
                    continue;
                }
                if (source[cursor] === "{") {
                    elements.push(parsePlaceable());
                    continue;
                }
                if (source[cursor] === "}") {
                    throw new SyntaxError("Unbalanced closing brace");
                }
                var indent = parseIndent();
                if (indent) {
                    elements.push(indent);
                    commonIndent = Math.min(commonIndent, indent.length);
                    continue;
                }
                break;
            }
            var lastIndex = elements.length - 1;
            var lastElement = elements[lastIndex];
            // Trim the trailing spaces in the last element if it's a TextElement.
            if (typeof lastElement === "string") {
                elements[lastIndex] = trim(lastElement, RE_TRAILING_SPACES);
            }
            var baked = [];
            for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
                var element = elements_1[_i];
                if (element instanceof Indent) {
                    // Dedent indented lines by the maximum common indent.
                    element = element.value.slice(0, element.value.length - commonIndent);
                }
                if (element) {
                    baked.push(element);
                }
            }
            return baked;
        }
        function parsePlaceable() {
            consumeToken(TOKEN_BRACE_OPEN, SyntaxError);
            var selector = parseInlineExpression();
            if (consumeToken(TOKEN_BRACE_CLOSE)) {
                return selector;
            }
            if (consumeToken(TOKEN_ARROW)) {
                var variants = parseVariants();
                consumeToken(TOKEN_BRACE_CLOSE, SyntaxError);
                return __assign({ type: "select", selector: selector }, variants);
            }
            throw new SyntaxError("Unclosed placeable");
        }
        function parseInlineExpression() {
            if (source[cursor] === "{") {
                // It's a nested placeable.
                return parsePlaceable();
            }
            if (test(RE_REFERENCE)) {
                var _a = match(RE_REFERENCE), sigil = _a[1], name_2 = _a[2], _b = _a[3], attr = _b === void 0 ? null : _b;
                if (sigil === "$") {
                    return { type: "var", name: name_2 };
                }
                if (consumeToken(TOKEN_PAREN_OPEN)) {
                    var args = parseArguments();
                    if (sigil === "-") {
                        // A parameterized term: -term(...).
                        return { type: "term", name: name_2, attr: attr, args: args };
                    }
                    if (RE_FUNCTION_NAME.test(name_2)) {
                        return { type: "func", name: name_2, args: args };
                    }
                    throw new SyntaxError("Function names must be all upper-case");
                }
                if (sigil === "-") {
                    // A non-parameterized term: -term.
                    return {
                        type: "term",
                        name: name_2,
                        attr: attr,
                        args: [],
                    };
                }
                return { type: "mesg", name: name_2, attr: attr };
            }
            return parseLiteral();
        }
        function parseArguments() {
            var args = [];
            while (true) {
                switch (source[cursor]) {
                    case ")": // End of the argument list.
                        cursor++;
                        return args;
                    case undefined: // EOF
                        throw new SyntaxError("Unclosed argument list");
                }
                args.push(parseArgument());
                // Commas between arguments are treated as whitespace.
                consumeToken(TOKEN_COMMA);
            }
        }
        function parseArgument() {
            var expr = parseInlineExpression();
            if (expr.type !== "mesg") {
                return expr;
            }
            if (consumeToken(TOKEN_COLON)) {
                // The reference is the beginning of a named argument.
                return {
                    type: "narg",
                    name: expr.name,
                    value: parseLiteral(),
                };
            }
            // It's a regular message reference.
            return expr;
        }
        function parseVariants() {
            var variants = [];
            var count = 0;
            var star;
            while (test(RE_VARIANT_START)) {
                if (consumeChar("*")) {
                    star = count;
                }
                var key = parseVariantKey();
                var value = parsePattern();
                if (value === null) {
                    throw new SyntaxError("Expected variant value");
                }
                variants[count++] = { key: key, value: value };
            }
            if (count === 0) {
                return null;
            }
            if (star === undefined) {
                throw new SyntaxError("Expected default variant");
            }
            return { variants: variants, star: star };
        }
        function parseVariantKey() {
            consumeToken(TOKEN_BRACKET_OPEN, SyntaxError);
            var key;
            if (test(RE_NUMBER_LITERAL)) {
                key = parseNumberLiteral();
            }
            else {
                key = {
                    type: "str",
                    value: match1(RE_IDENTIFIER),
                };
            }
            consumeToken(TOKEN_BRACKET_CLOSE, SyntaxError);
            return key;
        }
        function parseLiteral() {
            if (test(RE_NUMBER_LITERAL)) {
                return parseNumberLiteral();
            }
            if (source[cursor] === '"') {
                return parseStringLiteral();
            }
            throw new SyntaxError("Invalid expression");
        }
        function parseNumberLiteral() {
            var _a = match(RE_NUMBER_LITERAL), value = _a[1], _b = _a[2], fraction = _b === void 0 ? "" : _b;
            var precision = fraction.length;
            return {
                type: "num",
                value: parseFloat(value),
                precision: precision,
            };
        }
        function parseStringLiteral() {
            consumeChar('"', SyntaxError);
            var value = "";
            while (true) {
                value += match1(RE_STRING_RUN);
                if (source[cursor] === "\\") {
                    value += parseEscapeSequence();
                    continue;
                }
                if (consumeChar('"')) {
                    return { type: "str", value: value };
                }
                // We've reached an EOL of EOF.
                throw new SyntaxError("Unclosed string literal");
            }
        }
        // Unescape known escape sequences.
        function parseEscapeSequence() {
            if (test(RE_STRING_ESCAPE)) {
                return match1(RE_STRING_ESCAPE);
            }
            if (test(RE_UNICODE_ESCAPE)) {
                var _a = match(RE_UNICODE_ESCAPE), codepoint4 = _a[1], codepoint6 = _a[2];
                var codepoint = parseInt(codepoint4 || codepoint6, 16);
                return codepoint <= 0xd7ff || 0xe000 <= codepoint
                    ? // It's a Unicode scalar value.
                        String.fromCodePoint(codepoint)
                    : // Lonely surrogates can cause trouble when the parsing result is
                        // saved using UTF-8. Use U+FFFD REPLACEMENT CHARACTER instead.
                        "�";
            }
            throw new SyntaxError("Unknown escape sequence");
        }
        // Parse blank space. Return it if it looks like indent before a pattern
        // line. Skip it othwerwise.
        function parseIndent() {
            var start = cursor;
            consumeToken(TOKEN_BLANK);
            // Check the first non-blank character after the indent.
            switch (source[cursor]) {
                case ".":
                case "[":
                case "*":
                case "}":
                case undefined: // EOF
                    // A special character. End the Pattern.
                    return false;
                case "{":
                    // Placeables don't require indentation (in EBNF: block-placeable).
                    // Continue the Pattern.
                    return makeIndent(source.slice(start, cursor));
            }
            // If the first character on the line is not one of the special characters
            // listed above, it's a regular text character. Check if there's at least
            // one space of indent before it.
            if (source[cursor - 1] === " ") {
                // It's an indented text character (in EBNF: indented-char). Continue
                // the Pattern.
                return makeIndent(source.slice(start, cursor));
            }
            // A not-indented text character is likely the identifier of the next
            // message. End the Pattern.
            return false;
        }
        // Trim blanks in text according to the given regex.
        function trim(text, re) {
            return text.replace(re, "");
        }
        // Normalize a blank block and extract the indent details.
        function makeIndent(blank) {
            var value = blank.replace(RE_BLANK_LINES, "\n");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            var length = RE_INDENT.exec(blank)[1].length;
            return new Indent(value, length);
        }
    }
    return FluentResource;
}());
exports.FluentResource = FluentResource;
var Indent = /** @class */ (function () {
    function Indent(value, length) {
        this.value = value;
        this.length = length;
    }
    return Indent;
}());
