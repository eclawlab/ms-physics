"use strict";
// Copyright 2018-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Computes what elements are in both arrays, or only one array.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
/**
 * Given two arrays, find the items that are only in one of them (mutates the aOnly/bOnly/inBoth parameters)
 *
 * NOTE: Assumes there are no duplicate values in each individual array.
 *
 * For example:
 *   var a = [ 1, 2 ];
 *   var b = [ 5, 2, 0 ];
 *   var aOnly = [];
 *   var bOnly = [];
 *   var inBoth = [];
 *   arrayDifference( a, b, aOnly, bOnly, inBoth );
 *   // aOnly is [ 1 ]
 *   // bOnly is [ 5, 0 ]
 *   // inBoth is [ 2 ]
 *
 * @param a - Input array
 * @param b - Input array
 * @param [aOnly] - Output array (will be filled with all elements that are in `a` but NOT in `b`).
 *                              Ordered based on the order of `a`.
 * @param [bOnly] - Output array (will be filled with all elements that are in `b` but NOT in `a`).
 *                              Ordered based on the order of `b`.
 * @param [inBoth] - Output array (will be filled with all elements that are in both `a` AND `b`).
 *                               Ordered based on the order of `a`.
 * @returns - Returns the value of aOnly (the classic definition of difference)
 */
function arrayDifference(a, b, aOnly, bOnly, inBoth) {
    (0, affirm_js_1.default)(Array.isArray(a) && lodash_js_1.default.uniq(a).length === a.length, 'a is not an array of unique items');
    (0, affirm_js_1.default)(Array.isArray(b) && lodash_js_1.default.uniq(b).length === b.length, 'b is not an array of unique items');
    aOnly = aOnly || [];
    bOnly = bOnly || [];
    inBoth = inBoth || [];
    (0, affirm_js_1.default)(Array.isArray(aOnly) && aOnly.length === 0);
    (0, affirm_js_1.default)(Array.isArray(bOnly) && bOnly.length === 0);
    (0, affirm_js_1.default)(Array.isArray(inBoth) && inBoth.length === 0);
    Array.prototype.push.apply(aOnly, a);
    Array.prototype.push.apply(bOnly, b);
    outerLoop: // eslint-disable-line no-labels
     for (var i = 0; i < aOnly.length; i++) {
        var aItem = aOnly[i];
        for (var j = 0; j < bOnly.length; j++) {
            var bItem = bOnly[j];
            if (aItem === bItem) {
                inBoth.push(aItem);
                aOnly.splice(i, 1);
                bOnly.splice(j, 1);
                j = 0;
                if (i === aOnly.length) {
                    break outerLoop; // eslint-disable-line no-labels
                }
                i -= 1;
            }
        }
    }
    // We return the classic meaning of "difference"
    return aOnly;
}
phetCore_js_1.default.register('arrayDifference', arrayDifference);
exports.default = arrayDifference;
