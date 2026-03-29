"use strict";
// Copyright 2020-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Outputs a number for use in SVG's style/transform/path strings.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var dot_js_1 = require("../dot.js");
/**
 * Outputs a number for use in SVG's style/transform/path strings.
 *
 * We need to prevent the numbers from being in an exponential toString form, since the CSS transform does not support
 * that.
 */
function toSVGNumber(number) {
    // Largest guaranteed number of digits according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
    // See https://github.com/phetsims/dot/issues/36
    return number.toFixed(20); // eslint-disable-line phet/bad-sim-text
}
dot_js_1.default.register('toSVGNumber', toSVGNumber);
exports.default = toSVGNumber;
