"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = clamp;
/**
 * Returns the original value if it is inclusively within the [max,min] range. If it's below the range, min is
 * returned, and if it's above the range, max is returned.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var dot_js_1 = require("../dot.js");
function clamp(value, min, max) {
    if (value < min) {
        return min;
    }
    else if (value > max) {
        return max;
    }
    else {
        return value;
    }
}
dot_js_1.default.register('clamp', clamp);
