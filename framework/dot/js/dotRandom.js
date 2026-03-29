"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A singleton instance that is statically seeded; for use generally.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var dot_js_1 = require("./dot.js");
var Random_js_1 = require("./Random.js");
var dotRandom = new Random_js_1.default({
    seed: _.hasIn(window, 'phet.chipper.queryParameters.randomSeed') ? window.phet.chipper.queryParameters.randomSeed : null
});
dot_js_1.default.register('dotRandom', dotRandom);
exports.default = dotRandom;
