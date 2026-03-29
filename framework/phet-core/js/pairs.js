"use strict";
// Copyright 2014-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates an array of arrays, which consists of pairs of objects from the input array without duplication.
 *
 * For example, phet.phetCore.pairs( [ 'a', 'b', 'c' ] ) will return:
 * [ [ 'a', 'b' ], [ 'a', 'c' ], [ 'b', 'c' ] ]
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
function pairs(array) {
    var result = [];
    var length = array.length;
    if (length > 1) {
        for (var i = 0; i < length - 1; i++) {
            var first = array[i];
            for (var j = i + 1; j < length; j++) {
                result.push([first, array[j]]);
            }
        }
    }
    return result;
}
phetCore_js_1.default.register('pairs', pairs);
exports.default = pairs;
