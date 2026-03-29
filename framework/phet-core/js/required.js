"use strict";
// Copyright 2019-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Validates that the passed in entry exists and returns that value if validation is successful.
 *
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
/**
 * Checks if the value passed is defined
 */
function required(entry) {
    (0, affirm_js_1.default)(entry !== undefined, 'Required field is undefined.');
    return entry;
}
phetCore_js_1.default.register('required', required);
exports.default = required;
