"use strict";
// Copyright 2013-2026, University of Colorado Boulder
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.v4 = void 0;
/**
 * Basic 4-dimensional vector, represented as (x,y).
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var Pool_js_1 = require("../../phet-core/js/Pool.js");
var dot_js_1 = require("./dot.js");
var clamp_js_1 = require("./util/clamp.js");
var roundSymmetric_js_1 = require("./util/roundSymmetric.js");
var Vector4 = /** @class */ (function () {
    /**
     * Creates a 4-dimensional vector with the specified X, Y, Z and W values.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     * @param w - W coordinate
     */
    function Vector4(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    /**
     * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2+z^2+w^2}$.
     */
    Vector4.prototype.getMagnitude = function () {
        return Math.sqrt(this.magnitudeSquared);
    };
    Object.defineProperty(Vector4.prototype, "magnitude", {
        get: function () {
            return this.getMagnitude();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2+z^2+w^2$.
     */
    Vector4.prototype.getMagnitudeSquared = function () {
        return this.dot(this);
    };
    Object.defineProperty(Vector4.prototype, "magnitudeSquared", {
        get: function () {
            return this.getMagnitudeSquared();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The Euclidean distance between this vector (treated as a point) and another point.
     */
    Vector4.prototype.distance = function (point) {
        return this.minus(point).magnitude;
    };
    /**
     * The Euclidean distance between this vector (treated as a point) and another point (x,y,z,w).
     */
    Vector4.prototype.distanceXYZW = function (x, y, z, w) {
        var dx = this.x - x;
        var dy = this.y - y;
        var dz = this.z - z;
        var dw = this.w - w;
        return Math.sqrt(dx * dx + dy * dy + dz * dz + dw * dw);
    };
    /**
     * The squared Euclidean distance between this vector (treated as a point) and another point.
     */
    Vector4.prototype.distanceSquared = function (point) {
        return this.minus(point).magnitudeSquared;
    };
    /**
     * The squared Euclidean distance between this vector (treated as a point) and another point (x,y,z,w).
     */
    Vector4.prototype.distanceSquaredXYZW = function (x, y, z, w) {
        var dx = this.x - x;
        var dy = this.y - y;
        var dz = this.z - z;
        var dw = this.w - w;
        return dx * dx + dy * dy + dz * dz + dw * dw;
    };
    /**
     * The dot-product (Euclidean inner product) between this vector and another vector v.
     */
    Vector4.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    };
    /**
     * The dot-product (Euclidean inner product) between this vector and another vector (x,y,z,w).
     */
    Vector4.prototype.dotXYZW = function (x, y, z, w) {
        return this.x * x + this.y * y + this.z * z + this.w * w;
    };
    /**
     * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
     *
     * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
     * is the input vector (normalized).
     */
    Vector4.prototype.angleBetween = function (v) {
        return Math.acos((0, clamp_js_1.clamp)(this.normalized().dot(v.normalized()), -1, 1));
    };
    /**
     * Exact equality comparison between this vector and another vector.
     *
     * @param other
     * @returns - Whether the two vectors have equal components
     */
    Vector4.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
    };
    /**
     * Approximate equality comparison between this vector and another vector.
     *
     * @returns - Whether difference between the two vectors has no component with an absolute value greater
     *                      than epsilon.
     */
    Vector4.prototype.equalsEpsilon = function (other, epsilon) {
        if (!epsilon) {
            epsilon = 0;
        }
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z) + Math.abs(this.w - other.w) <= epsilon;
    };
    /**
     * Returns false if any component is NaN, infinity, or -infinity. Otherwise returns true.
     */
    Vector4.prototype.isFinite = function () {
        return isFinite(this.x) && isFinite(this.y) && isFinite(this.z) && isFinite(this.w);
    };
    /*---------------------------------------------------------------------------*
     * Immutables
     *---------------------------------------------------------------------------*/
    /**
     * Creates a copy of this vector, or if a vector is passed in, set that vector's values to ours.
     *
     * This is the immutable form of the function set(), if a vector is provided. This will return a new vector, and
     * will not modify this vector.
     *
     * @param  [vector] - If not provided, creates a v4 with filled in values. Otherwise, fills in the
     *                    values of the provided vector so that it equals this vector.
     */
    Vector4.prototype.copy = function (vector) {
        if (vector) {
            return vector.set(this);
        }
        else {
            return v4(this.x, this.y, this.z, this.w);
        }
    };
    /**
     * Normalized (re-scaled) copy of this vector such that its magnitude is 1. If its initial magnitude is zero, an
     * error is thrown.
     *
     * This is the immutable form of the function normalize(). This will return a new vector, and will not modify this
     * vector.
     */
    Vector4.prototype.normalized = function () {
        var magnitude = this.magnitude;
        assert && assert(magnitude !== 0, 'Cannot normalize a zero-magnitude vector');
        return this.dividedScalar(magnitude);
    };
    /**
     * Returns a copy of this vector with each component rounded by roundSymmetric.
     *
     * This is the immutable form of the function roundSymmetric(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.roundedSymmetric = function () {
        return this.copy().roundSymmetric();
    };
    /**
     * Re-scaled copy of this vector such that it has the desired magnitude. If its initial magnitude is zero, an error
     * is thrown. If the passed-in magnitude is negative, the direction of the resulting vector will be reversed.
     *
     * This is the immutable form of the function setMagnitude(). This will return a new vector, and will not modify
     * this vector.
     *
     */
    Vector4.prototype.withMagnitude = function (magnitude) {
        return this.copy().setMagnitude(magnitude);
    };
    /**
     * Copy of this vector, scaled by the desired scalar value.
     *
     * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.timesScalar = function (scalar) {
        return v4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    };
    /**
     * Same as timesScalar.
     *
     * This is the immutable form of the function multiply(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.times = function (scalar) {
        return this.timesScalar(scalar);
    };
    /**
     * Copy of this vector, multiplied component-wise by the passed-in vector v.
     *
     * This is the immutable form of the function componentMultiply(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.componentTimes = function (v) {
        return v4(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
    };
    /**
     * Addition of this vector and another vector, returning a copy.
     *
     * This is the immutable form of the function add(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.plus = function (v) {
        return v4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    };
    /**
     * Addition of this vector and another vector (x,y,z,w), returning a copy.
     *
     * This is the immutable form of the function addXYZW(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.plusXYZW = function (x, y, z, w) {
        return v4(this.x + x, this.y + y, this.z + z, this.w + w);
    };
    /**
     * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
     *
     * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.plusScalar = function (scalar) {
        return v4(this.x + scalar, this.y + scalar, this.z + scalar, this.w + scalar);
    };
    /**
     * Subtraction of this vector by another vector v, returning a copy.
     *
     * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.minus = function (v) {
        return v4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    };
    /**
     * Subtraction of this vector by another vector (x,y,z,w), returning a copy.
     *
     * This is the immutable form of the function subtractXYZW(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.minusXYZW = function (x, y, z, w) {
        return v4(this.x - x, this.y - y, this.z - z, this.w - w);
    };
    /**
     * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
     *
     * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.minusScalar = function (scalar) {
        return v4(this.x - scalar, this.y - scalar, this.z - scalar, this.w - scalar);
    };
    /**
     * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
     *
     * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector4.prototype.dividedScalar = function (scalar) {
        return v4(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
    };
    /**
     * Negated copy of this vector (multiplies every component by -1).
     *
     * This is the immutable form of the function negate(). This will return a new vector, and will not modify
     * this vector.
     *
     */
    Vector4.prototype.negated = function () {
        return v4(-this.x, -this.y, -this.z, -this.w);
    };
    /**
     * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
     *
     * @param vector
     * @param ratio - Not necessarily constrained in [0, 1]
     */
    Vector4.prototype.blend = function (vector, ratio) {
        return this.plus(vector.minus(this).times(ratio));
    };
    /**
     * The average (midpoint) between this vector and another vector.
     */
    Vector4.prototype.average = function (vector) {
        return this.blend(vector, 0.5);
    };
    /**
     * Debugging string for the vector.
     */
    Vector4.prototype.toString = function () {
        return "Vector4(".concat(this.x, ", ").concat(this.y, ", ").concat(this.z, ", ").concat(this.w, ")");
    };
    /*---------------------------------------------------------------------------*
     * Mutables
     * - all mutation should go through setXYZW / setX / setY / setZ / setW
     *---------------------------------------------------------------------------*/
    /**
     * Sets all of the components of this vector, returning this.
     */
    Vector4.prototype.setXYZW = function (x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    };
    /**
     * Sets the x-component of this vector, returning this.
     */
    Vector4.prototype.setX = function (x) {
        this.x = x;
        return this;
    };
    /**
     * Sets the y-component of this vector, returning this.
     */
    Vector4.prototype.setY = function (y) {
        this.y = y;
        return this;
    };
    /**
     * Sets the z-component of this vector, returning this.
     */
    Vector4.prototype.setZ = function (z) {
        this.z = z;
        return this;
    };
    /**
     * Sets the w-component of this vector, returning this.
     */
    Vector4.prototype.setW = function (w) {
        this.w = w;
        return this;
    };
    /**
     * Sets this vector to be a copy of another vector.
     *
     * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
     * this vector itself.
     */
    Vector4.prototype.set = function (v) {
        return this.setXYZW(v.x, v.y, v.z, v.w);
    };
    /**
     * Sets the magnitude of this vector. If the passed-in magnitude is negative, this flips the vector and sets its
     * magnitude to abs( magnitude ).
     *
     * This is the mutable form of the function withMagnitude(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.setMagnitude = function (magnitude) {
        var scale = magnitude / this.magnitude;
        return this.multiplyScalar(scale);
    };
    /**
     * Adds another vector to this vector, changing this vector.
     *
     * This is the mutable form of the function plus(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.add = function (v) {
        return this.setXYZW(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    };
    /**
     * Adds another vector (x,y,z,w) to this vector, changing this vector.
     *
     * This is the mutable form of the function plusXYZW(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.addXYZW = function (x, y, z, w) {
        return this.setXYZW(this.x + x, this.y + y, this.z + z, this.w + w);
    };
    /**
     * Adds a scalar to this vector (added to every component), changing this vector.
     *
     * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.addScalar = function (scalar) {
        return this.setXYZW(this.x + scalar, this.y + scalar, this.z + scalar, this.w + scalar);
    };
    /**
     * Subtracts this vector by another vector, changing this vector.
     *
     * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.subtract = function (v) {
        return this.setXYZW(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    };
    /**
     * Subtracts this vector by another vector (x,y,z,w), changing this vector.
     *
     * This is the mutable form of the function minusXYZW(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.subtractXYZW = function (x, y, z, w) {
        return this.setXYZW(this.x - x, this.y - y, this.z - z, this.w - w);
    };
    /**
     * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.subtractScalar = function (scalar) {
        return this.setXYZW(this.x - scalar, this.y - scalar, this.z - scalar, this.w - scalar);
    };
    /**
     * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.multiplyScalar = function (scalar) {
        return this.setXYZW(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    };
    /**
     * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
     * Same as multiplyScalar.
     *
     * This is the mutable form of the function times(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.multiply = function (scalar) {
        return this.multiplyScalar(scalar);
    };
    /**
     * Multiplies this vector by another vector component-wise, changing this vector.
     *
     * This is the mutable form of the function componentTimes(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.componentMultiply = function (v) {
        return this.setXYZW(this.x * v.x, this.y * v.y, this.z * v.z, this.w * v.w);
    };
    /**
     * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.divideScalar = function (scalar) {
        return this.setXYZW(this.x / scalar, this.y / scalar, this.z / scalar, this.w / scalar);
    };
    /**
     * Negates this vector (multiplies each component by -1), changing this vector.
     *
     * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.negate = function () {
        return this.setXYZW(-this.x, -this.y, -this.z, -this.w);
    };
    /**
     * Normalizes this vector (rescales to where the magnitude is 1), changing this vector.
     *
     * This is the mutable form of the function normalized(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector4.prototype.normalize = function () {
        var mag = this.magnitude;
        if (mag === 0) {
            throw new Error('Cannot normalize a zero-magnitude vector');
        }
        return this.divideScalar(mag);
    };
    /**
     * Rounds each component of this vector with roundSymmetric.
     *
     * This is the mutable form of the function roundedSymmetric(). This will mutate (change) this vector, in addition
     * to returning the vector itself.
     */
    Vector4.prototype.roundSymmetric = function () {
        return this.setXYZW((0, roundSymmetric_js_1.roundSymmetric)(this.x), (0, roundSymmetric_js_1.roundSymmetric)(this.y), (0, roundSymmetric_js_1.roundSymmetric)(this.z), (0, roundSymmetric_js_1.roundSymmetric)(this.w));
    };
    /**
     * Returns a duck-typed object meant for use with tandem/phet-io serialization.
     */
    Vector4.prototype.toStateObject = function () {
        return {
            x: this.x,
            y: this.y,
            z: this.z,
            w: this.w
        };
    };
    Vector4.prototype.freeToPool = function () {
        Vector4.pool.freeToPool(this);
    };
    /**
     * Constructs a Vector3 from a duck-typed object, for use with tandem/phet-io deserialization.
     */
    Vector4.fromStateObject = function (stateObject) {
        return Vector4.from(stateObject);
    };
    /**
     * Constructs a Vector4 from any object as best as it can, if a component of the v4 is not provided, it will default to 0 (except w).
     */
    Vector4.from = function (vector4Like, defaultW) {
        if (defaultW === void 0) { defaultW = 1; }
        return v4(vector4Like.x || 0, vector4Like.y || 0, vector4Like.z || 0, vector4Like.w || defaultW);
    };
    Vector4.pool = new Pool_js_1.default(Vector4, {
        maxSize: 1000,
        initialize: Vector4.prototype.setXYZW,
        defaultArguments: [0, 0, 0, 0]
    });
    Vector4.ZERO = new Vector4(0, 0, 0, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector4.X_UNIT = new Vector4(1, 0, 0, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector4.Y_UNIT = new Vector4(0, 1, 0, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector4.Z_UNIT = new Vector4(0, 0, 1, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector4.W_UNIT = new Vector4(0, 0, 0, 1); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    return Vector4;
}());
exports.default = Vector4;
// (read-only) - Helps to identify the dimension of the vector
Vector4.prototype.isVector4 = true;
Vector4.prototype.dimension = 4;
dot_js_1.default.register('Vector4', Vector4);
var v4 = Vector4.pool.create.bind(Vector4.pool);
exports.v4 = v4;
dot_js_1.default.register('v4', v4);
var ImmutableVector4 = /** @class */ (function (_super) {
    __extends(ImmutableVector4, _super);
    function ImmutableVector4() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Throw errors whenever a mutable method is called on our immutable vector
     */
    ImmutableVector4.mutableOverrideHelper = function (mutableFunctionName) {
        ImmutableVector4.prototype[mutableFunctionName] = function () {
            throw new Error("Cannot call mutable method '".concat(mutableFunctionName, "' on immutable Vector3"));
        };
    };
    return ImmutableVector4;
}(Vector4));
ImmutableVector4.mutableOverrideHelper('setXYZW');
ImmutableVector4.mutableOverrideHelper('setX');
ImmutableVector4.mutableOverrideHelper('setY');
ImmutableVector4.mutableOverrideHelper('setZ');
ImmutableVector4.mutableOverrideHelper('setW');
if (assert) {
    Vector4.ZERO = new ImmutableVector4(0, 0, 0, 0);
    Vector4.X_UNIT = new ImmutableVector4(1, 0, 0, 0);
    Vector4.Y_UNIT = new ImmutableVector4(0, 1, 0, 0);
    Vector4.Z_UNIT = new ImmutableVector4(0, 0, 1, 0);
    Vector4.W_UNIT = new ImmutableVector4(0, 0, 0, 1);
}
