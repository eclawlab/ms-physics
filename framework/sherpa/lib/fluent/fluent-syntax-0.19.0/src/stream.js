"use strict";
/* eslint no-magic-numbers: "off" */
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
exports.FluentParserStream = exports.EOF = exports.EOL = exports.ParserStream = void 0;
var errors_js_1 = require("./errors.js");
var ParserStream = /** @class */ (function () {
    function ParserStream(string) {
        this.string = string;
        this.index = 0;
        this.peekOffset = 0;
    }
    ParserStream.prototype.charAt = function (offset) {
        // When the cursor is at CRLF, return LF but don't move the cursor.
        // The cursor still points to the EOL position, which in this case is the
        // beginning of the compound CRLF sequence. This ensures slices of
        // [inclusive, exclusive) continue to work properly.
        if (this.string[offset] === "\r" && this.string[offset + 1] === "\n") {
            return "\n";
        }
        return this.string[offset];
    };
    ParserStream.prototype.currentChar = function () {
        return this.charAt(this.index);
    };
    ParserStream.prototype.currentPeek = function () {
        return this.charAt(this.index + this.peekOffset);
    };
    ParserStream.prototype.next = function () {
        this.peekOffset = 0;
        // Skip over the CRLF as if it was a single character.
        if (this.string[this.index] === "\r" &&
            this.string[this.index + 1] === "\n") {
            this.index++;
        }
        this.index++;
        return this.string[this.index];
    };
    ParserStream.prototype.peek = function () {
        // Skip over the CRLF as if it was a single character.
        if (this.string[this.index + this.peekOffset] === "\r" &&
            this.string[this.index + this.peekOffset + 1] === "\n") {
            this.peekOffset++;
        }
        this.peekOffset++;
        return this.string[this.index + this.peekOffset];
    };
    ParserStream.prototype.resetPeek = function (offset) {
        if (offset === void 0) { offset = 0; }
        this.peekOffset = offset;
    };
    ParserStream.prototype.skipToPeek = function () {
        this.index += this.peekOffset;
        this.peekOffset = 0;
    };
    return ParserStream;
}());
exports.ParserStream = ParserStream;
exports.EOL = "\n";
exports.EOF = undefined;
var SPECIAL_LINE_START_CHARS = ["}", ".", "[", "*"];
var FluentParserStream = /** @class */ (function (_super) {
    __extends(FluentParserStream, _super);
    function FluentParserStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FluentParserStream.prototype.peekBlankInline = function () {
        var start = this.index + this.peekOffset;
        while (this.currentPeek() === " ") {
            this.peek();
        }
        return this.string.slice(start, this.index + this.peekOffset);
    };
    FluentParserStream.prototype.skipBlankInline = function () {
        var blank = this.peekBlankInline();
        this.skipToPeek();
        return blank;
    };
    FluentParserStream.prototype.peekBlankBlock = function () {
        var blank = "";
        while (true) {
            var lineStart = this.peekOffset;
            this.peekBlankInline();
            if (this.currentPeek() === exports.EOL) {
                blank += exports.EOL;
                this.peek();
                continue;
            }
            if (this.currentPeek() === exports.EOF) {
                // Treat the blank line at EOF as a blank block.
                return blank;
            }
            // Any other char; reset to column 1 on this line.
            this.resetPeek(lineStart);
            return blank;
        }
    };
    FluentParserStream.prototype.skipBlankBlock = function () {
        var blank = this.peekBlankBlock();
        this.skipToPeek();
        return blank;
    };
    FluentParserStream.prototype.peekBlank = function () {
        while (this.currentPeek() === " " || this.currentPeek() === exports.EOL) {
            this.peek();
        }
    };
    FluentParserStream.prototype.skipBlank = function () {
        this.peekBlank();
        this.skipToPeek();
    };
    FluentParserStream.prototype.expectChar = function (ch) {
        if (this.currentChar() === ch) {
            this.next();
            return;
        }
        throw new errors_js_1.ParseError("E0003", ch);
    };
    FluentParserStream.prototype.expectLineEnd = function () {
        if (this.currentChar() === exports.EOF) {
            // EOF is a valid line end in Fluent.
            return;
        }
        if (this.currentChar() === exports.EOL) {
            this.next();
            return;
        }
        // Unicode Character 'SYMBOL FOR NEWLINE' (U+2424)
        throw new errors_js_1.ParseError("E0003", "\u2424");
    };
    FluentParserStream.prototype.takeChar = function (f) {
        var ch = this.currentChar();
        if (ch === exports.EOF) {
            return exports.EOF;
        }
        if (f(ch)) {
            this.next();
            return ch;
        }
        return null;
    };
    FluentParserStream.prototype.isCharIdStart = function (ch) {
        if (ch === exports.EOF) {
            return false;
        }
        var cc = ch.charCodeAt(0);
        return ((cc >= 97 && cc <= 122) || // a-z
            (cc >= 65 && cc <= 90)); // A-Z
    };
    FluentParserStream.prototype.isIdentifierStart = function () {
        return this.isCharIdStart(this.currentPeek());
    };
    FluentParserStream.prototype.isNumberStart = function () {
        var ch = this.currentChar() === "-" ? this.peek() : this.currentChar();
        if (ch === exports.EOF) {
            this.resetPeek();
            return false;
        }
        var cc = ch.charCodeAt(0);
        var isDigit = cc >= 48 && cc <= 57; // 0-9
        this.resetPeek();
        return isDigit;
    };
    FluentParserStream.prototype.isCharPatternContinuation = function (ch) {
        if (ch === exports.EOF) {
            return false;
        }
        return !SPECIAL_LINE_START_CHARS.includes(ch);
    };
    FluentParserStream.prototype.isValueStart = function () {
        // Inline Patterns may start with any char.
        var ch = this.currentPeek();
        return ch !== exports.EOL && ch !== exports.EOF;
    };
    FluentParserStream.prototype.isValueContinuation = function () {
        var column1 = this.peekOffset;
        this.peekBlankInline();
        if (this.currentPeek() === "{") {
            this.resetPeek(column1);
            return true;
        }
        if (this.peekOffset - column1 === 0) {
            return false;
        }
        if (this.isCharPatternContinuation(this.currentPeek())) {
            this.resetPeek(column1);
            return true;
        }
        return false;
    };
    /**
     * @param level - -1: any, 0: comment, 1: group comment, 2: resource comment
     */
    FluentParserStream.prototype.isNextLineComment = function (level) {
        if (level === void 0) { level = -1; }
        if (this.currentChar() !== exports.EOL) {
            return false;
        }
        var i = 0;
        while (i <= level || (level === -1 && i < 3)) {
            if (this.peek() !== "#") {
                if (i <= level && level !== -1) {
                    this.resetPeek();
                    return false;
                }
                break;
            }
            i++;
        }
        // The first char after #, ## or ###.
        var ch = this.peek();
        if (ch === " " || ch === exports.EOL) {
            this.resetPeek();
            return true;
        }
        this.resetPeek();
        return false;
    };
    FluentParserStream.prototype.isVariantStart = function () {
        var currentPeekOffset = this.peekOffset;
        if (this.currentPeek() === "*") {
            this.peek();
        }
        if (this.currentPeek() === "[") {
            this.resetPeek(currentPeekOffset);
            return true;
        }
        this.resetPeek(currentPeekOffset);
        return false;
    };
    FluentParserStream.prototype.isAttributeStart = function () {
        return this.currentPeek() === ".";
    };
    FluentParserStream.prototype.skipToNextEntryStart = function (junkStart) {
        var lastNewline = this.string.lastIndexOf(exports.EOL, this.index);
        if (junkStart < lastNewline) {
            // Last seen newline is _after_ the junk start. It's safe to rewind
            // without the risk of resuming at the same broken entry.
            this.index = lastNewline;
        }
        while (this.currentChar()) {
            // We're only interested in beginnings of line.
            if (this.currentChar() !== exports.EOL) {
                this.next();
                continue;
            }
            // Break if the first char in this line looks like an entry start.
            var first = this.next();
            if (this.isCharIdStart(first) || first === "-" || first === "#") {
                break;
            }
        }
    };
    FluentParserStream.prototype.takeIDStart = function () {
        if (this.isCharIdStart(this.currentChar())) {
            var ret = this.currentChar();
            this.next();
            return ret;
        }
        throw new errors_js_1.ParseError("E0004", "a-zA-Z");
    };
    FluentParserStream.prototype.takeIDChar = function () {
        var closure = function (ch) {
            var cc = ch.charCodeAt(0);
            return ((cc >= 97 && cc <= 122) || // a-z
                (cc >= 65 && cc <= 90) || // A-Z
                (cc >= 48 && cc <= 57) || // 0-9
                cc === 95 ||
                cc === 45); // _-
        };
        return this.takeChar(closure);
    };
    FluentParserStream.prototype.takeDigit = function () {
        var closure = function (ch) {
            var cc = ch.charCodeAt(0);
            return cc >= 48 && cc <= 57; // 0-9
        };
        return this.takeChar(closure);
    };
    FluentParserStream.prototype.takeHexDigit = function () {
        var closure = function (ch) {
            var cc = ch.charCodeAt(0);
            return ((cc >= 48 && cc <= 57) || // 0-9
                (cc >= 65 && cc <= 70) || // A-F
                (cc >= 97 && cc <= 102)); // a-f
        };
        return this.takeChar(closure);
    };
    return FluentParserStream;
}(ParserStream));
exports.FluentParserStream = FluentParserStream;
