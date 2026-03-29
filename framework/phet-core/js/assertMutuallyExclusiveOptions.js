"use strict";
// Copyright 2019-2025, University of Colorado Boulder
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
 * Throws an assertion error if mutually exclusive options are specified.
 *
 * @example
 * assertMutuallyExclusiveOptions( { tree:1, flower:2 }, [ 'tree' ], [ 'flower' ] ) => error
 * assertMutuallyExclusiveOptions( { flower:2 }, [ 'tree' ], [ 'flower' ] ) => no error
 * assertMutuallyExclusiveOptions( { tree:1 }, [ 'tree' ], [ 'flower' ] ) => no error
 * assertMutuallyExclusiveOptions( { tree:1, mountain:2 }, [ 'tree', 'mountain' ], [ 'flower' ] ) => no error
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
var phetCore_js_1 = require("./phetCore.js");
/**
 * @param options - an options object.  Could be before or after merge, and may therefore
 *                                        - be null or undefined
 * @param sets - families of mutually exclusive option keys, see examples above.
 */
var assertMutuallyExclusiveOptions = function (options) {
    var sets = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sets[_i - 1] = arguments[_i];
    }
    if ((0, affirm_js_1.isAffirmEnabled)() && options) {
        // Determine which options are used from each set
        var usedElementsFromEachSet = sets.map(function (set) { return Object.keys(lodash_js_1.default.pick.apply(lodash_js_1.default, __spreadArray([options], set, false))); });
        // If any element is used from more than one set...
        if (usedElementsFromEachSet.filter(function (usedElements) { return usedElements.length > 0; }).length > 1) {
            // Output the errant options.
            (0, affirm_js_1.default)(false, "Cannot simultaneously specify ".concat(usedElementsFromEachSet.join(' and ')));
        }
    }
};
phetCore_js_1.default.register('assertMutuallyExclusiveOptions', assertMutuallyExclusiveOptions);
exports.default = assertMutuallyExclusiveOptions;
