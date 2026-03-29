"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundSymmetric = roundSymmetric;
/**
 * Rounds using "Round half away from zero" algorithm. See dot#35.
 *
 * JavaScript's Math.round is not symmetric for positive and negative numbers, it uses IEEE 754 "Round half up".
 * See https://en.wikipedia.org/wiki/Rounding#Round_half_up.
 * For sims, we want to treat positive and negative values symmetrically, which is IEEE 754 "Round half away from zero",
 * See https://en.wikipedia.org/wiki/Rounding#Round_half_away_from_zero
 *
 * Note that -0 is rounded to 0, since we typically do not want to display -0 in sims.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var dot_js_1 = require("../dot.js");
function roundSymmetric(value) {
    return ((value < 0) ? -1 : 1) * Math.round(Math.abs(value)); // eslint-disable-line phet/bad-sim-text
}
dot_js_1.default.register('roundSymmetric', roundSymmetric);
