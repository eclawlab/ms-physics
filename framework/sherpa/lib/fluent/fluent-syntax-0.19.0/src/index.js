"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentSerializer = exports.FluentParser = exports.Visitor = exports.Transformer = exports.serializeVariantKey = exports.serializeExpression = exports.ParseError = void 0;
exports.parse = parse;
exports.serialize = serialize;
exports.lineOffset = lineOffset;
exports.columnOffset = columnOffset;
var parser_js_1 = require("./parser.js");
Object.defineProperty(exports, "FluentParser", { enumerable: true, get: function () { return parser_js_1.FluentParser; } });
var serializer_js_1 = require("./serializer.js");
Object.defineProperty(exports, "FluentSerializer", { enumerable: true, get: function () { return serializer_js_1.FluentSerializer; } });
__exportStar(require("./ast.js"), exports);
var errors_js_1 = require("./errors.js");
Object.defineProperty(exports, "ParseError", { enumerable: true, get: function () { return errors_js_1.ParseError; } });
var serializer_js_2 = require("./serializer.js");
Object.defineProperty(exports, "serializeExpression", { enumerable: true, get: function () { return serializer_js_2.serializeExpression; } });
Object.defineProperty(exports, "serializeVariantKey", { enumerable: true, get: function () { return serializer_js_2.serializeVariantKey; } });
var visitor_js_1 = require("./visitor.js");
Object.defineProperty(exports, "Transformer", { enumerable: true, get: function () { return visitor_js_1.Transformer; } });
Object.defineProperty(exports, "Visitor", { enumerable: true, get: function () { return visitor_js_1.Visitor; } });
function parse(source, opts) {
    var parser = new parser_js_1.FluentParser(opts);
    return parser.parse(source);
}
function serialize(resource, opts) {
    var serializer = new serializer_js_1.FluentSerializer(opts);
    return serializer.serialize(resource);
}
function lineOffset(source, pos) {
    // Subtract 1 to get the offset.
    return source.substring(0, pos).split("\n").length - 1;
}
function columnOffset(source, pos) {
    // Find the last line break starting backwards from the index just before
    // pos.  This allows us to correctly handle ths case where the character at
    // pos  is a line break as well.
    var fromIndex = pos - 1;
    var prevLineBreak = source.lastIndexOf("\n", fromIndex);
    // pos is a position in the first line of source.
    if (prevLineBreak === -1) {
        return pos;
    }
    // Subtracting two offsets gives length; subtract 1 to get the offset.
    return pos - prevLineBreak - 1;
}
