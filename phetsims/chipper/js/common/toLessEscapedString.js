"use strict";
// Copyright 2023-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * More space-efficient alternative to JSON.stringify for strings, that will escape only the necessary characters.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var toLessEscapedString = function (string) {
    var result = '';
    string.split(/(?:)/u).forEach(function (char) {
        if (char === '\r') {
            result += '\\r';
        }
        else if (char === '\n') {
            result += '\\n';
        }
        else if (char === '\\') {
            result += '\\\\';
        }
        else if (char === '\'') {
            result += '\\\'';
        }
        else {
            result += char;
        }
    });
    return "'".concat(result, "'");
};
exports.default = toLessEscapedString;
