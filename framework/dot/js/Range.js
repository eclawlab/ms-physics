"use strict";
// Copyright 2013-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var InfiniteNumberIO_js_1 = require("../../tandem/js/types/InfiniteNumberIO.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var dot_js_1 = require("./dot.js");
var STATE_SCHEMA = {
    min: InfiniteNumberIO_js_1.default,
    max: InfiniteNumberIO_js_1.default
};
var Range = /** @class */ (function () {
    /**
     * @param min - the minimum value of the range
     * @param max - the maximum value of the range
     */
    function Range(min, max) {
        this._min = min;
        this._max = max;
    }
    /**
     * Getter for min
     */
    Range.prototype.getMin = function () {
        return this._min;
    };
    Object.defineProperty(Range.prototype, "min", {
        get: function () {
            return this.getMin();
        },
        set: function (min) {
            this.setMin(min);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * TODO: Allow chaining, https://github.com/phetsims/dot/issues/122
     * Setter for min
     */
    Range.prototype.setMin = function (min) {
        assert && assert(min <= this._max, "min must be <= max: ".concat(min));
        this._min = min;
    };
    /**
     * Getter for max
     */
    Range.prototype.getMax = function () {
        return this._max;
    };
    Object.defineProperty(Range.prototype, "max", {
        get: function () {
            return this.getMax();
        },
        set: function (max) {
            this.setMax(max);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Setter for max
     */
    Range.prototype.setMax = function (max) {
        assert && assert(this._min <= max, "max must be >= to min: ".concat(max));
        this._max = max;
    };
    /**
     * Sets the minimum and maximum value of the range
     */
    Range.prototype.setMinMax = function (min, max) {
        assert && assert(min <= max, "max must be >= to min. min: ".concat(min, ", max: ").concat(max));
        this._min = min;
        this._max = max;
        return this;
    };
    /**
     * Sets the minimum and maximum value of this range from the provided Range.
     */
    Range.prototype.set = function (range) {
        this.setMinMax(range.min, range.max);
        return this;
    };
    Range.prototype.addValue = function (n) {
        this._min = Math.min(this._min, n);
        this._max = Math.max(this._max, n);
    };
    Range.prototype.withValue = function (n) {
        return new Range(Math.min(this._min, n), Math.max(this._max, n));
    };
    /**
     * Makes a copy of this range
     */
    Range.prototype.copy = function () {
        return new Range(this._min, this._max);
    };
    /**
     * Gets the length of this range, that is the difference between the maximum and minimum value of this range
     */
    Range.prototype.getLength = function () {
        return this._max - this._min;
    };
    /**
     * Gets the center of this range, that is the average value of the maximum and minimum value of this range
     */
    Range.prototype.getCenter = function () {
        return (this._max + this._min) / 2;
    };
    /**
     * Determines if this range contains the value
     */
    Range.prototype.contains = function (value) {
        return (value >= this._min) && (value <= this._max);
    };
    /**
     * Does this range contain the specified range?
     */
    Range.prototype.containsRange = function (range) {
        return (this._min <= range.min) && (this._max >= range.max);
    };
    /**
     * Determine if this range overlaps (intersects) with another range
     */
    Range.prototype.intersects = function (range) {
        return (this._max >= range.min) && (range.max >= this._min);
    };
    /**
     * Do the two ranges overlap with one another?  Note that this assumes that
     * This is a open interval.
     */
    Range.prototype.intersectsExclusive = function (range) {
        return (this._max > range.min) && (range.max > this._min);
    };
    /**
     *
     * REVIEW: The naming is not helping me understand that this function is just the immutable version of includeRange().
     *
     * The smallest range that contains both this range and the input range, returned as a copy.
     *
     * The method below is the immutable form of the function includeRange(). The method will return a new range, and will not modify
     * this range.
     */
    Range.prototype.union = function (range) {
        return new Range(Math.min(this.min, range.min), Math.max(this.max, range.max));
    };
    /**
     * REVIEW: The naming is not helping me understand that this function is just the immutable version of constrainRange().
     *
     * The smallest range that is contained by both this range and the input range, returned as a copy.
     *
     * The method below the immutable form of the function constrainRange(). The method below will return a new range, and will not modify
     * this range.
     */
    Range.prototype.intersection = function (range) {
        return new Range(Math.max(this.min, range.min), Math.min(this.max, range.max));
    };
    /**
     * Modifies this range so that it contains both its original range and the input range.
     *
     * This is the mutable form of the function union(). This will mutate (change) this range, in addition to returning
     * this range itself.
     */
    Range.prototype.includeRange = function (range) {
        return this.setMinMax(Math.min(this.min, range.min), Math.max(this.max, range.max));
    };
    /**
     * Modifies this range so that it is the largest range contained both in its original range and in the input range.
     *
     * This is the mutable form of the function intersection(). This will mutate (change) this range, in addition to returning
     * this range itself.
     */
    Range.prototype.constrainRange = function (range) {
        return this.setMinMax(Math.max(this.min, range.min), Math.min(this.max, range.max));
    };
    /**
     * REVIEW: do we also need a mutable form of shifted?
     *
     * Returns a new range that is the same as this range, but shifted by the specified amount.
     */
    Range.prototype.shifted = function (n) {
        return new Range(this.min + n, this.max + n);
    };
    /**
     * Converts the attributes of this range to a string
     */
    Range.prototype.toString = function () {
        return "[Range (min:".concat(this._min, " max:").concat(this._max, ")]");
    };
    /**
     * Constrains a value to the range.
     */
    Range.prototype.constrainValue = function (value) {
        return Math.min(Math.max(value, this._min), this._max);
    };
    /**
     * Multiply the min and max by the provided value, immutable
     */
    Range.prototype.times = function (value) {
        return new Range(this._min * value, this._max * value);
    };
    /**
     * Multiply the min and max by the provided value, mutable
     */
    Range.prototype.multiply = function (value) {
        this.setMinMax(this._min * value, this._max * value);
        return this;
    };
    /**
     * Determines if this Range is equal to some object.
     */
    Range.prototype.equals = function (object) {
        return (this.constructor === object.constructor) &&
            (this._min === object.min) &&
            (this._max === object.max);
    };
    /**
     * Determines if this Range is approximately equal to some object.
     */
    Range.prototype.equalsEpsilon = function (object, epsilon) {
        return (this.constructor === object.constructor) &&
            (Math.abs(this._min - object.min) <= epsilon) &&
            (Math.abs(this._max - object.max) <= epsilon);
    };
    /**
     * Given a value, normalize it to this Range's length, returning a value between 0 and 1 for values contained in
     * the Range. If the value is not contained in Range, then the return value will not be between 0 and 1.
     */
    Range.prototype.getNormalizedValue = function (value) {
        assert && assert(this.getLength() !== 0, 'cannot get normalized value without a range length');
        return (value - this.min) / this.getLength();
    };
    /**
     * Compute the opposite of a normalized value. Given a normalized value (between 0 and 1). Worked with any number
     * though, (even outside of the range). It is the client's responsibility to clamp if that is important to the
     * usage.
     */
    Range.prototype.expandNormalizedValue = function (normalizedValue) {
        assert && assert(this.getLength() !== 0, 'cannot get expand normalized value without a range length');
        return normalizedValue * this.getLength() + this.min;
    };
    Object.defineProperty(Range.prototype, "defaultValue", {
        /**
         * In https://github.com/phetsims/dot/issues/57, defaultValue was moved to RangeWithValue.
         * This ES5 getter catches programming errors where defaultValue is still used with Range.
         */
        get: function () {
            throw new Error('defaultValue is undefined, did you mean to use RangeWithValue?');
        },
        enumerable: false,
        configurable: true
    });
    Range.prototype.toStateObject = function () {
        return {
            min: InfiniteNumberIO_js_1.default.toStateObject(this.min),
            max: InfiniteNumberIO_js_1.default.toStateObject(this.max)
        };
    };
    // Given a value and a delta to change that value, clamp the delta to make sure the value stays within range.
    Range.prototype.clampDelta = function (value, delta) {
        assert && assert(this.contains(value));
        return value + delta < this.min ? this.min - value :
            value + delta > this.max ? this.max - value :
                delta;
    };
    Range.fromStateObject = function (stateObject) {
        return new Range(InfiniteNumberIO_js_1.default.fromStateObject(stateObject.min), InfiniteNumberIO_js_1.default.fromStateObject(stateObject.max));
    };
    Range.RangeIO = new IOType_js_1.default('RangeIO', {
        valueType: Range,
        documentation: 'A range with "min" and "max" members.',
        stateSchema: STATE_SCHEMA,
        toStateObject: function (range) { return range.toStateObject(); },
        fromStateObject: function (stateObject) { return Range.fromStateObject(stateObject); }
    });
    Range.EVERYTHING = new Range(Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    Range.NOTHING = new Range(Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY);
    return Range;
}());
dot_js_1.default.register('Range', Range);
exports.default = Range;
