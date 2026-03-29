"use strict";
// Copyright 2014-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Removes a single (the first) matching object from an Array.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
function arrayRemove(array, toRemove) {
    (0, affirm_js_1.default)(Array.isArray(array), 'arrayRemove takes an Array');
    var index = lodash_js_1.default.indexOf(array, toRemove);
    (0, affirm_js_1.default)(index >= 0, 'item not found in Array');
    array.splice(index, 1);
}
phetCore_js_1.default.register('arrayRemove', arrayRemove);
exports.default = arrayRemove;
