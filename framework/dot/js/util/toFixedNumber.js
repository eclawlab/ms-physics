"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFixedNumber = toFixedNumber;
/**
 * A predictable implementation of toFixed, where the result is returned as a number instead of a string.
 *
 * JavaScript's toFixed is notoriously buggy, behavior differs depending on browser,
 * because the spec doesn't specify whether to round or floor.
 * Rounding is symmetric for positive and negative values, see roundSymmetric.
 *
 * @author Chris Malley (cmalley@pixelzoom.com)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var dot_js_1 = require("../dot.js");
var toFixed_js_1 = require("./toFixed.js");
function toFixedNumber(value, decimalPlaces) {
    return parseFloat((0, toFixed_js_1.toFixed)(value, decimalPlaces));
}
dot_js_1.default.register('toFixedNumber', toFixedNumber);
