"use strict";
// Copyright 2018-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a copy of an array, with generated elements interleaved (inserted in-between) every element. For example, if
 * you call `interleave( [ a, b, c ], Math.random )`, it will result in the equivalent:
 * `[ a, Math.random(), b, Math.random(), c ]`.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
/**
 * @param arr - The array in which to interleave elements
 * @param generator - function( index: {number} ):{*} - 0-based index for which "separator" it is for. e.g.
 *                               [ _, generator(0), _, generator(1), _, generator(2), ..., _ ]
 * @returns - The interleaved array
 */
function interleave(arr, generator) {
    (0, affirm_js_1.default)(Array.isArray(arr));
    var result = [];
    var finalLength = arr.length * 2 - 1;
    for (var i = 0; i < finalLength; i++) {
        if (i % 2 === 0) {
            result.push(arr[i / 2]);
        }
        else {
            result.push(generator((i - 1) / 2));
        }
    }
    return result;
}
phetCore_js_1.default.register('interleave', interleave);
exports.default = interleave;
