"use strict";
// Copyright 2015-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Random number generator with an optional seed.  It uses seedrandom.js, a monkey patch for Math, see
 * https://github.com/davidbau/seedrandom.
 *
 * If you are developing a PhET Simulation, you should probably use the global `DOT/dotRandom` because it
 * provides built-in support for phet-io seeding and a check that it isn't used before the seed has been set.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Aaron Davis (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Mohamed Safi
 */
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var dot_js_1 = require("./dot.js");
var Vector2_js_1 = require("./Vector2.js");
var boxMullerTransform_js_1 = require("./util/boxMullerTransform.js");
var Random = /** @class */ (function () {
    function Random(providedOptions) {
        this.seed = null;
        // If seed is provided, create a local random number generator without altering Math.random.
        // Math.seedrandom is provided by seedrandom.js, see https://github.com/davidbau/seedrandom.
        this.seedrandom = null;
        // the number of times `nextDouble` is called. Clients should not write to this value.
        this.numberOfCalls = 0;
        var options = (0, optionize_js_1.default)()({
            seed: null
        }, providedOptions);
        this.setSeed(options.seed);
    }
    /**
     * Gets the seed.
     */
    Random.prototype.getSeed = function () {
        return this.seed;
    };
    /**
     * Returns the next pseudo-random boolean
     */
    Random.prototype.nextBoolean = function () {
        return this.nextDouble() >= 0.5;
    };
    /**
     * Returns the next pseudo random number from this random number generator sequence.
     * The random number is an integer ranging from 0 to n-1.
     * @returns an integer
     */
    Random.prototype.nextInt = function (n) {
        var value = this.nextDouble() * n;
        return Math.floor(value);
    };
    /**
     * Randomly select a random integer between min and max (inclusive).
     * @param min - must be an integer
     * @param max - must be an integer
     * @returns an integer between min and max, inclusive
     */
    Random.prototype.nextIntBetween = function (min, max) {
        assert && assert(Number.isInteger(min), "min must be an integer: ".concat(min));
        assert && assert(Number.isInteger(max), "max must be an integer: ".concat(max));
        var range = max - min;
        return this.nextInt(range + 1) + min;
    };
    /**
     * Randomly select one element from the given array.
     * @param array - from which one element will be selected, must have at least one element
     * @returns the selected element from the array
     */
    Random.prototype.sample = function (array) {
        assert && assert(array.length > 0, 'Array should have at least 1 item.');
        var index = this.nextIntBetween(0, array.length - 1);
        return array[index];
    };
    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates shuffle.  Adapted from lodash-2.4.1 by
     * Sam Reid on Aug 16, 2016, See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     * @param array - the array which will be shuffled
     * @returns a new array with all the same elements in the passed-in array, in randomized order.
     */
    Random.prototype.shuffle = function (array) {
        var _this = this;
        var index = -1;
        var result = new Array(array.length);
        _.forEach(array, function (value) {
            var rand = _this.nextIntBetween(0, ++index);
            result[index] = result[rand];
            result[rand] = value;
        });
        return result;
    };
    /**
     * Returns the next pseudo random number from this random number generator sequence in the range [0, 1)
     * The distribution of the random numbers is uniformly distributed across the interval
     * @returns the random number
     */
    Random.prototype.nextDouble = function () {
        this.numberOfCalls++;
        return this.seedrandom();
    };
    /**
     * Randomly selects a double in the range [min,max).
     */
    Random.prototype.nextDoubleBetween = function (min, max) {
        assert && assert(min < max, 'min must be < max');
        var value = min + this.nextDouble() * (max - min);
        assert && assert(value >= min && value < max, "value out of range: ".concat(value));
        return value;
    };
    /**
     * Returns the next gaussian-distributed random number from this random number generator sequence.
     * The distribution of the random numbers is gaussian, with a mean = 0 and standard deviation = 1
     */
    Random.prototype.nextGaussian = function () {
        return (0, boxMullerTransform_js_1.boxMullerTransform)(0, 1, this);
    };
    /**
     * Gets the next random double in a Range.
     * For min < max, the return value is [min,max), between min (inclusive) and max (exclusive).
     * For min === max, the return value is min.
     */
    Random.prototype.nextDoubleInRange = function (range) {
        if (range.min < range.max) {
            return this.nextDoubleBetween(range.min, range.max);
        }
        else {
            // because random.nextDoubleBetween requires min < max
            return range.min;
        }
    };
    /**
     * Gets a random point within the provided Bounds2, [min,max)
     */
    Random.prototype.nextPointInBounds = function (bounds) {
        return new Vector2_js_1.default(this.nextDoubleBetween(bounds.minX, bounds.maxX), this.nextDoubleBetween(bounds.minY, bounds.maxY));
    };
    /**
     * @param seed - if null, Math.random will be used to create the seed.
     */
    Random.prototype.setSeed = function (seed) {
        if (typeof seed === 'number') {
            // @ts-expect-error
            assert && assert(Math.seedrandom, 'If a seed is specified, then we must also have Math.seedrandom to use the seed.');
        }
        else {
            seed = Math.random(); // eslint-disable-line phet/bad-sim-text
        }
        this.seed = seed;
        // If seed is provided, create a local random number generator without altering Math.random.
        // Math.seedrandom is provided by seedrandom.js, see https://github.com/davidbau/seedrandom.
        // @ts-expect-error
        this.seedrandom = Math.seedrandom ? new Math.seedrandom("".concat(seed)) : function () { return Math.random(); }; // eslint-disable-line phet/bad-sim-text
    };
    /**
     * Choose a numeric index from the array of weights.  The array of weights does not need to be normalized.
     * See https://stackoverflow.com/questions/8877249/generate-random-integers-with-probabilities
     * See also ContinuousServer.weightedSampleTest which uses the same algorithm
     */
    Random.prototype.sampleProbabilities = function (weights) {
        var totalWeight = _.sum(weights);
        var cutoffWeight = totalWeight * this.nextDouble();
        var cumulativeWeight = 0;
        for (var i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (cumulativeWeight >= cutoffWeight) {
                return i;
            }
        }
        // The fallback is the last test
        assert && assert(weights[weights.length - 1] !== 0, 'if last weight is zero, should have selected something beforehand');
        return weights.length - 1;
    };
    return Random;
}());
exports.default = Random;
dot_js_1.default.register('Random', Random);
