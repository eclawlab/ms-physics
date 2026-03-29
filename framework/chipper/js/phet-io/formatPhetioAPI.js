"use strict";
// Copyright 2021-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Format a PhET-iO API file for printing.
 *
 * NOTE: Please be mindful of the copy in copyWithSortedKeys, see https://github.com/phetsims/phet-io/issues/1733
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fixEOL_js_1 = require("../../../perennial-alias/js/common/fixEOL.js");
/**
 * Creates a new object, recursively, by sorting the keys at each level.
 * @param unordered - jsonifiable object to be sorted by key name.  Sorting is recursive.
 */
var copyWithSortedKeys = function (unordered) {
    if (Array.isArray(unordered)) {
        return unordered.map(copyWithSortedKeys);
    }
    else if (typeof unordered !== 'object' || unordered === null) {
        return unordered;
    }
    var ordered = {};
    Object.keys(unordered).sort().forEach(function (key) {
        var value = unordered[key];
        ordered[key] = copyWithSortedKeys(value);
    });
    return ordered;
};
exports.default = (function (api) {
    (0, assert_1.default)(api, 'api expected');
    var objectString = JSON.stringify(copyWithSortedKeys(api), null, 2);
    return (0, fixEOL_js_1.default)(objectString);
});
