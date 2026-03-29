"use strict";
// Copyright 2018-2026, University of Colorado Boulder
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
/**
 * ForEach for multidimensional arrays.
 *
 * e.g. dimensionForEach( 1, array, callback ) is equivalent to array.forEach( callback )
 * e.g. dimensionForEach( 2, [ [ 1, 2 ], [ 3, 4 ] ], f ) will call:
 *      f(1), f(2), f(3), f(4)
 *   OR more accurately (since it includes indices indicating how to reach that element:
 *      f(1,0,0), f(2,0,1), f(3,1,0), f(4,1,1)
 *   Notably, f(2,0,1) is called for the element 3 BECAUSE original[ 0 ][ 1 ] is the element 2
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
/**
 * @param dimension - The dimension of the array (how many levels of nested arrays there are). For instance,
 *   [ 'a' ] is a 1-dimensional array, [ [ 'b' ] ] is a 2-dimensional array, etc.
 * @param array - A multidimensional array of the specified dimension
 * @param forEach - function( element: {*}, indices...: {Array.<number>} ). Called for each individual
 *   element. The indices are provided as the 2nd, 3rd, etc. parameters to the function (continues depending on the
 *   dimension). This is a generalization of the normal `forEach` function, which only provides the first index. Thus:
 *   array[ indices[ 0 ] ]...[ indices[ dimension - 1 ] ] === element
 */
function dimensionForEach(dimension, array, forEach) {
    // Will get indices pushed when we go deeper into the multidimensional array, and popped when we go back, so that
    // this essentially represents our "position" in the multidimensional array during iteration.
    var indices = [];
    /**
     * Responsible for iterating through a multidimensional array of the given dimension, while accumulating
     * indices.
     */
    function recur(dim, arr) {
        return arr.forEach(function (element, index) {
            // To process this element, we need to record our index (in case it is an array that we iterate through).
            indices.push(index);
            // Our base case, where recur was passed a 1-dimensional array
            if (dim === 1) {
                forEach.apply(void 0, __spreadArray([element], indices, false));
            }
            // We have more dimensions
            else {
                recur(dim - 1, element);
            }
            // We are done with iteration
            indices.pop();
        });
    }
    return recur(dimension, array);
}
phetCore_js_1.default.register('dimensionForEach', dimensionForEach);
exports.default = dimensionForEach;
