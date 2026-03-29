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
exports.v3 = void 0;
/**
 * Basic 3-dimensional vector, represented as (x,y,z).
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var Pool_js_1 = require("../../phet-core/js/Pool.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var NumberIO_js_1 = require("../../tandem/js/types/NumberIO.js");
var dot_js_1 = require("./dot.js");
var clamp_js_1 = require("./util/clamp.js");
var roundSymmetric_js_1 = require("./util/roundSymmetric.js");
var ADDING_ACCUMULATOR = function (vector, nextVector) {
    return vector.add(nextVector);
};
var Vector3 = /** @class */ (function () {
    /**
     * Creates a 3-dimensional vector with the specified X, Y and Z values.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     * @param z - Z coordinate
     */
    function Vector3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    /**
     * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2+z^2}$.
     */
    Vector3.prototype.getMagnitude = function () {
        return Math.sqrt(this.magnitudeSquared);
    };
    Object.defineProperty(Vector3.prototype, "magnitude", {
        get: function () {
            return this.getMagnitude();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * T squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2+z^2$.
     */
    Vector3.prototype.getMagnitudeSquared = function () {
        return this.dot(this);
    };
    Object.defineProperty(Vector3.prototype, "magnitudeSquared", {
        get: function () {
            return this.getMagnitudeSquared();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The Euclidean distance between this vector (treated as a point) and another point.
     */
    Vector3.prototype.distance = function (point) {
        return Math.sqrt(this.distanceSquared(point));
    };
    /**
     * The Euclidean distance between this vector (treated as a point) and another point (x,y,z).
     */
    Vector3.prototype.distanceXYZ = function (x, y, z) {
        var dx = this.x - x;
        var dy = this.y - y;
        var dz = this.z - z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    /**
     * The squared Euclidean distance between this vector (treated as a point) and another point.
     */
    Vector3.prototype.distanceSquared = function (point) {
        var dx = this.x - point.x;
        var dy = this.y - point.y;
        var dz = this.z - point.z;
        return dx * dx + dy * dy + dz * dz;
    };
    /**
     * The squared Euclidean distance between this vector (treated as a point) and another point (x,y,z).
     */
    Vector3.prototype.distanceSquaredXYZ = function (x, y, z) {
        var dx = this.x - x;
        var dy = this.y - y;
        var dz = this.z - z;
        return dx * dx + dy * dy + dz * dz;
    };
    /**
     * The dot-product (Euclidean inner product) between this vector and another vector v.
     */
    Vector3.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    };
    /**
     * The dot-product (Euclidean inner product) between this vector and another vector (x,y,z).
     */
    Vector3.prototype.dotXYZ = function (x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    };
    /**
     * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
     *
     * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
     * is the input vector (normalized).
     */
    Vector3.prototype.angleBetween = function (v) {
        return Math.acos((0, clamp_js_1.clamp)(this.normalized().dot(v.normalized()), -1, 1));
    };
    /**
     * Exact equality comparison between this vector and another vector.
     *
     * @returns - Whether the two vectors have equal components
     */
    Vector3.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y && this.z === other.z;
    };
    /**
     * Approximate equality comparison between this vector and another vector.
     *
     * @returns - Whether difference between the two vectors has no component with an absolute value greater
     *                      than epsilon.
     */
    Vector3.prototype.equalsEpsilon = function (other, epsilon) {
        if (!epsilon) {
            epsilon = 0;
        }
        return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z) <= epsilon;
    };
    /**
     * Returns false if any component is NaN, infinity, or -infinity. Otherwise returns true.
     */
    Vector3.prototype.isFinite = function () {
        return isFinite(this.x) && isFinite(this.y) && isFinite(this.z);
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
     * @param [vector] - If not provided, creates a new Vector3 with filled in values. Otherwise, fills in the
     *                   values of the provided vector so that it equals this vector.
     */
    Vector3.prototype.copy = function (vector) {
        if (vector) {
            return vector.set(this);
        }
        else {
            return v3(this.x, this.y, this.z);
        }
    };
    /**
     * The Euclidean 3-dimensional cross-product of this vector by the passed-in vector.
     */
    Vector3.prototype.cross = function (v) {
        return v3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    };
    /**
     * Normalized (re-scaled) copy of this vector such that its magnitude is 1. If its initial magnitude is zero, an
     * error is thrown.
     *
     * This is the immutable form of the function normalize(). This will return a new vector, and will not modify this
     * vector.
     */
    Vector3.prototype.normalized = function () {
        var mag = this.magnitude;
        if (mag === 0) {
            throw new Error('Cannot normalize a zero-magnitude vector');
        }
        else {
            return v3(this.x / mag, this.y / mag, this.z / mag);
        }
    };
    /**
     *
     * This is the immutable form of the function roundSymmetric(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.roundedSymmetric = function () {
        return this.copy().roundSymmetric();
    };
    /**
     * Re-scaled copy of this vector such that it has the desired magnitude. If its initial magnitude is zero, an error
     * is thrown. If the passed-in magnitude is negative, the direction of the resulting vector will be reversed.
     *
     * This is the immutable form of the function setMagnitude(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.withMagnitude = function (magnitude) {
        return this.copy().setMagnitude(magnitude);
    };
    /**
     * Copy of this vector, scaled by the desired scalar value.
     *
     * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.timesScalar = function (scalar) {
        return v3(this.x * scalar, this.y * scalar, this.z * scalar);
    };
    /**
     * Same as timesScalar.
     *
     * This is the immutable form of the function multiply(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.times = function (scalar) {
        return this.timesScalar(scalar);
    };
    /**
     * Copy of this vector, multiplied component-wise by the passed-in vector v.
     *
     * This is the immutable form of the function componentMultiply(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.componentTimes = function (v) {
        return v3(this.x * v.x, this.y * v.y, this.z * v.z);
    };
    /**
     * Addition of this vector and another vector, returning a copy.
     *
     * This is the immutable form of the function add(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.plus = function (v) {
        return v3(this.x + v.x, this.y + v.y, this.z + v.z);
    };
    /**
     * Addition of this vector and another vector (x,y,z), returning a copy.
     *
     * This is the immutable form of the function addXYZ(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.plusXYZ = function (x, y, z) {
        return v3(this.x + x, this.y + y, this.z + z);
    };
    /**
     * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
     *
     * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.plusScalar = function (scalar) {
        return v3(this.x + scalar, this.y + scalar, this.z + scalar);
    };
    /**
     * Subtraction of this vector by another vector v, returning a copy.
     *
     * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.minus = function (v) {
        return v3(this.x - v.x, this.y - v.y, this.z - v.z);
    };
    /**
     * Subtraction of this vector by another vector (x,y,z), returning a copy.
     *
     * This is the immutable form of the function subtractXYZ(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.minusXYZ = function (x, y, z) {
        return v3(this.x - x, this.y - y, this.z - z);
    };
    /**
     * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
     *
     * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.minusScalar = function (scalar) {
        return v3(this.x - scalar, this.y - scalar, this.z - scalar);
    };
    /**
     * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
     *
     * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector3.prototype.dividedScalar = function (scalar) {
        return v3(this.x / scalar, this.y / scalar, this.z / scalar);
    };
    /**
     * Negated copy of this vector (multiplies every component by -1).
     *
     * This is the immutable form of the function negate(). This will return a new vector, and will not modify
     * this vector.
     *
     */
    Vector3.prototype.negated = function () {
        return v3(-this.x, -this.y, -this.z);
    };
    /**
     * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
     *
     * @param vector
     * @param ratio - Not necessarily constrained in [0, 1]
     */
    Vector3.prototype.blend = function (vector, ratio) {
        return this.plus(vector.minus(this).times(ratio));
    };
    /**
     * The average (midpoint) between this vector and another vector.
     */
    Vector3.prototype.average = function (vector) {
        return this.blend(vector, 0.5);
    };
    /**
     * Take a component-based mean of all vectors provided.
     */
    Vector3.average = function (vectors) {
        var added = _.reduce(vectors, ADDING_ACCUMULATOR, new Vector3(0, 0, 0));
        return added.divideScalar(vectors.length);
    };
    /**
     * Debugging string for the vector.
     */
    Vector3.prototype.toString = function () {
        return "Vector3(".concat(this.x, ", ").concat(this.y, ", ").concat(this.z, ")");
    };
    /*---------------------------------------------------------------------------*
     * Mutables
     * - all mutation should go through setXYZ / setX / setY / setZ
     *---------------------------------------------------------------------------*/
    /**
     * Sets all of the components of this vector, returning this.
     */
    Vector3.prototype.setXYZ = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    };
    /**
     * Sets the x-component of this vector, returning this.
     */
    Vector3.prototype.setX = function (x) {
        this.x = x;
        return this;
    };
    /**
     * Sets the y-component of this vector, returning this.
     */
    Vector3.prototype.setY = function (y) {
        this.y = y;
        return this;
    };
    /**
     * Sets the z-component of this vector, returning this.
     */
    Vector3.prototype.setZ = function (z) {
        this.z = z;
        return this;
    };
    /**
     * Sets this vector to be a copy of another vector.
     *
     * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
     * this vector itself.
     */
    Vector3.prototype.set = function (v) {
        return this.setXYZ(v.x, v.y, v.z);
    };
    /**
     * Sets the magnitude of this vector. If the passed-in magnitude is negative, this flips the vector and sets its
     * magnitude to abs( magnitude ).
     *
     * This is the mutable form of the function withMagnitude(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.setMagnitude = function (magnitude) {
        var scale = magnitude / this.magnitude;
        return this.multiplyScalar(scale);
    };
    /**
     * Adds another vector to this vector, changing this vector.
     *
     * This is the mutable form of the function plus(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.add = function (v) {
        return this.setXYZ(this.x + v.x, this.y + v.y, this.z + v.z);
    };
    /**
     * Adds another vector (x,y,z) to this vector, changing this vector.
     *
     * This is the mutable form of the function plusXYZ(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.addXYZ = function (x, y, z) {
        return this.setXYZ(this.x + x, this.y + y, this.z + z);
    };
    /**
     * Adds a scalar to this vector (added to every component), changing this vector.
     *
     * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.addScalar = function (scalar) {
        return this.setXYZ(this.x + scalar, this.y + scalar, this.z + scalar);
    };
    /**
     * Subtracts this vector by another vector, changing this vector.
     *
     * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.subtract = function (v) {
        return this.setXYZ(this.x - v.x, this.y - v.y, this.z - v.z);
    };
    /**
     * Subtracts this vector by another vector (x,y,z), changing this vector.
     *
     * This is the mutable form of the function minusXYZ(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.subtractXYZ = function (x, y, z) {
        return this.setXYZ(this.x - x, this.y - y, this.z - z);
    };
    /**
     * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.subtractScalar = function (scalar) {
        return this.setXYZ(this.x - scalar, this.y - scalar, this.z - scalar);
    };
    /**
     * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.multiplyScalar = function (scalar) {
        return this.setXYZ(this.x * scalar, this.y * scalar, this.z * scalar);
    };
    /**
     * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
     * Same as multiplyScalar.
     *
     * This is the mutable form of the function times(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.multiply = function (scalar) {
        return this.multiplyScalar(scalar);
    };
    /**
     * Multiplies this vector by another vector component-wise, changing this vector.
     *
     * This is the mutable form of the function componentTimes(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.componentMultiply = function (v) {
        return this.setXYZ(this.x * v.x, this.y * v.y, this.z * v.z);
    };
    /**
     * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.divideScalar = function (scalar) {
        return this.setXYZ(this.x / scalar, this.y / scalar, this.z / scalar);
    };
    /**
     * Negates this vector (multiplies each component by -1), changing this vector.
     *
     * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.negate = function () {
        return this.setXYZ(-this.x, -this.y, -this.z);
    };
    /**
     * Sets our value to the Euclidean 3-dimensional cross-product of this vector by the passed-in vector.
     */
    Vector3.prototype.setCross = function (v) {
        return this.setXYZ(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
    };
    /**
     * Normalizes this vector (rescales to where the magnitude is 1), changing this vector.
     *
     * This is the mutable form of the function normalized(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector3.prototype.normalize = function () {
        var mag = this.magnitude;
        if (mag === 0) {
            throw new Error('Cannot normalize a zero-magnitude vector');
        }
        else {
            return this.divideScalar(mag);
        }
    };
    /**
     * Rounds each component of this vector with roundSymmetric.
     *
     * This is the mutable form of the function roundedSymmetric(). This will mutate (change) this vector, in addition
     * to returning the vector itself.
     */
    Vector3.prototype.roundSymmetric = function () {
        return this.setXYZ((0, roundSymmetric_js_1.roundSymmetric)(this.x), (0, roundSymmetric_js_1.roundSymmetric)(this.y), (0, roundSymmetric_js_1.roundSymmetric)(this.z));
    };
    /**
     * Returns a duck-typed object meant for use with tandem/phet-io serialization.
     */
    Vector3.prototype.toStateObject = function () {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        };
    };
    Vector3.prototype.freeToPool = function () {
        Vector3.pool.freeToPool(this);
    };
    // static methods
    /**
     * Spherical linear interpolation between two unit vectors.
     *
     * @param start - Start unit vector
     * @param end - End unit vector
     * @param ratio  - Between 0 (at start vector) and 1 (at end vector)
     * @returns Spherical linear interpolation between the start and end
     */
    Vector3.slerp = function (start, end, ratio) {
        // @ts-expect-error TODO: import with circular protection https://github.com/phetsims/dot/issues/96
        return dot_js_1.default.Quaternion.slerp(new dot_js_1.default.Quaternion(), dot_js_1.default.Quaternion.getRotationQuaternion(start, end), ratio).timesVector3(start);
    };
    /**
     * Constructs a Vector3 from a duck-typed object, for use with tandem/phet-io deserialization.
     */
    Vector3.fromStateObject = function (stateObject) {
        return Vector3.from(stateObject);
    };
    /**
     * Constructs a Vector3 from any object as best as it can, if a component of the v3 is not provided, it will default to 0.
     */
    Vector3.from = function (vector3Like) {
        return v3(vector3Like.x || 0, vector3Like.y || 0, vector3Like.z || 0);
    };
    Vector3.pool = new Pool_js_1.default(Vector3, {
        maxSize: 1000,
        initialize: Vector3.prototype.setXYZ,
        defaultArguments: [0, 0, 0]
    });
    Vector3.ZERO = new Vector3(0, 0, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector3.X_UNIT = new Vector3(1, 0, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector3.Y_UNIT = new Vector3(0, 1, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    Vector3.Z_UNIT = new Vector3(0, 0, 1); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    return Vector3;
}());
exports.default = Vector3;
// (read-only) - Helps to identify the dimension of the vector
Vector3.prototype.isVector3 = true;
Vector3.prototype.dimension = 3;
dot_js_1.default.register('Vector3', Vector3);
var v3 = Vector3.pool.create.bind(Vector3.pool);
exports.v3 = v3;
dot_js_1.default.register('v3', v3);
var ImmutableVector3 = /** @class */ (function (_super) {
    __extends(ImmutableVector3, _super);
    function ImmutableVector3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Throw errors whenever a mutable method is called on our immutable vector
     */
    ImmutableVector3.mutableOverrideHelper = function (mutableFunctionName) {
        ImmutableVector3.prototype[mutableFunctionName] = function () {
            throw new Error("Cannot call mutable method '".concat(mutableFunctionName, "' on immutable Vector3"));
        };
    };
    return ImmutableVector3;
}(Vector3));
ImmutableVector3.mutableOverrideHelper('setXYZ');
ImmutableVector3.mutableOverrideHelper('setX');
ImmutableVector3.mutableOverrideHelper('setY');
ImmutableVector3.mutableOverrideHelper('setZ');
if (assert) {
    Vector3.ZERO = new ImmutableVector3(0, 0, 0);
    Vector3.X_UNIT = new ImmutableVector3(1, 0, 0);
    Vector3.Y_UNIT = new ImmutableVector3(0, 1, 0);
    Vector3.Z_UNIT = new ImmutableVector3(0, 0, 1);
}
Vector3.Vector3IO = new IOType_js_1.default('Vector3IO', {
    valueType: Vector3,
    documentation: 'Basic 3-dimensional vector, represented as (x,y,z)',
    toStateObject: function (vector3) { return vector3.toStateObject(); },
    fromStateObject: function (x) { return Vector3.fromStateObject(x); },
    stateSchema: {
        x: NumberIO_js_1.default,
        y: NumberIO_js_1.default,
        z: NumberIO_js_1.default
    }
});
