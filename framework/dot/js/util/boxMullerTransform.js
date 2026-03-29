"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.boxMullerTransform = boxMullerTransform;
/**
 * Generates a random Gaussian sample with the given mean and standard deviation.
 * This method relies on the "static" variables generate, z0, and z1 defined above.
 * Random.js is the primary client of this function, but it is defined here so it can be
 * used other places more easily if need be.
 * Code inspired by example here: https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform.
 *
 * @param mu - The mean of the Gaussian
 * @param sigma - The standard deviation of the Gaussian
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var dot_js_1 = require("../dot.js");
var generate = false;
var z0 = 0;
var z1 = 0;
var TWO_PI = 2 * Math.PI;
function boxMullerTransform(mu, sigma, random) {
    generate = !generate;
    if (!generate) {
        return z1 * sigma + mu;
    }
    var u1;
    var u2;
    do {
        u1 = random.nextDouble();
        u2 = random.nextDouble();
    } while (u1 <= Number.MIN_VALUE);
    z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(TWO_PI * u2);
    z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(TWO_PI * u2);
    return z0 * sigma + mu;
}
dot_js_1.default.register('boxMullerTransform', boxMullerTransform);
