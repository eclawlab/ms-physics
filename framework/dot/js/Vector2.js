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
exports.v2 = void 0;
/**
 * Basic 2-dimensional vector, represented as (x,y).  Values can be numeric, or NaN or infinite.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var Pool_js_1 = require("../../phet-core/js/Pool.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var NumberIO_js_1 = require("../../tandem/js/types/NumberIO.js");
var dot_js_1 = require("./dot.js");
var roundSymmetric_js_1 = require("./util/roundSymmetric.js");
var clamp_js_1 = require("./util/clamp.js");
var ADDING_ACCUMULATOR = function (vector, nextVector) {
    return vector.add(nextVector);
};
var Vector2 = /** @class */ (function () {
    /**
     * Creates a 2-dimensional vector with the specified X and Y values.
     *
     * @param x - X coordinate
     * @param y - Y coordinate
     */
    function Vector2(x, y) {
        this.x = x;
        this.y = y;
    }
    /**
     * The magnitude (Euclidean/L2 Norm) of this vector, i.e. $\sqrt{x^2+y^2}$.
     */
    Vector2.prototype.getMagnitude = function () {
        return Math.sqrt(this.magnitudeSquared);
    };
    Object.defineProperty(Vector2.prototype, "magnitude", {
        get: function () { return this.getMagnitude(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The squared magnitude (square of the Euclidean/L2 Norm) of this vector, i.e. $x^2+y^2$.
     */
    Vector2.prototype.getMagnitudeSquared = function () {
        return this.x * this.x + this.y * this.y;
    };
    Object.defineProperty(Vector2.prototype, "magnitudeSquared", {
        get: function () { return this.getMagnitudeSquared(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The Euclidean distance between this vector (treated as a point) and another point.
     */
    Vector2.prototype.distance = function (point) {
        return Math.sqrt(this.distanceSquared(point));
    };
    /**
     * The Euclidean distance between this vector (treated as a point) and another point (x,y).
     */
    Vector2.prototype.distanceXY = function (x, y) {
        var dx = this.x - x;
        var dy = this.y - y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    /**
     * The squared Euclidean distance between this vector (treated as a point) and another point.
     */
    Vector2.prototype.distanceSquared = function (point) {
        var dx = this.x - point.x;
        var dy = this.y - point.y;
        return dx * dx + dy * dy;
    };
    /**
     * The squared Euclidean distance between this vector (treated as a point) and another point with coordinates (x,y).
     */
    Vector2.prototype.distanceSquaredXY = function (x, y) {
        var dx = this.x - x;
        var dy = this.y - y;
        return dx * dx + dy * dy;
    };
    /**
     * The dot-product (Euclidean inner product) between this vector and another vector v.
     */
    Vector2.prototype.dot = function (v) {
        return this.x * v.x + this.y * v.y;
    };
    /**
     * The dot-product (Euclidean inner product) between this vector and another vector (x,y).
     */
    Vector2.prototype.dotXY = function (x, y) {
        return this.x * x + this.y * y;
    };
    /**
     * The angle $\theta$ of this vector, such that this vector is equal to
     *
     * $$
     * u = \begin{bmatrix} r\cos\theta \\ r\sin\theta \end{bmatrix}
     * $$
     *
     * for the magnitude $r \ge 0$ of the vector, with $\theta\in(-\pi,\pi]$
     */
    Vector2.prototype.getAngle = function () {
        return Math.atan2(this.y, this.x);
    };
    Object.defineProperty(Vector2.prototype, "angle", {
        get: function () {
            return this.getAngle();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * The angle between this vector and another vector, in the range $\theta\in[0, \pi]$.
     *
     * Equal to $\theta = \cos^{-1}( \hat{u} \cdot \hat{v} )$ where $\hat{u}$ is this vector (normalized) and $\hat{v}$
     * is the input vector (normalized).
     */
    Vector2.prototype.angleBetween = function (v) {
        var thisMagnitude = this.magnitude;
        var vMagnitude = v.magnitude;
        return Math.acos((0, clamp_js_1.clamp)((this.x * v.x + this.y * v.y) / (thisMagnitude * vMagnitude), -1, 1));
    };
    /**
     * Exact equality comparison between this vector and another vector.
  
     * @returns - Whether the two vectors have equal components
     */
    Vector2.prototype.equals = function (other) {
        return this.x === other.x && this.y === other.y;
    };
    /**
     * Approximate equality comparison between this vector and another vector.
     *
     * @returns - Whether difference between the two vectors has no component with an absolute value greater than epsilon.
     */
    Vector2.prototype.equalsEpsilon = function (other, epsilon) {
        if (!epsilon) {
            epsilon = 0;
        }
        return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y)) <= epsilon;
    };
    /**
     * Returns false if either component is NaN, infinity, or -infinity. Otherwise returns true.
     */
    Vector2.prototype.isFinite = function () {
        return isFinite(this.x) && isFinite(this.y);
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
     * @param [vector] - If not provided, creates a new Vector2 with filled in values. Otherwise, fills in the
     *                   values of the provided vector so that it equals this vector.
     */
    Vector2.prototype.copy = function (vector) {
        if (vector) {
            return vector.set(this);
        }
        else {
            return v2(this.x, this.y);
        }
    };
    /**
     * The scalar value of the z-component of the equivalent 3-dimensional cross product:
     *
     * $$
     * f( u, v ) = \left( \begin{bmatrix} u_x \\ u_y \\ 0 \end{bmatrix} \times \begin{bmatrix} v_x \\ v_y \\ 0 \end{bmatrix} \right)_z = u_x v_y - u_y v_x
     * $$
     */
    Vector2.prototype.crossScalar = function (v) {
        return this.x * v.y - this.y * v.x;
    };
    /**
     * Normalized (re-scaled) copy of this vector such that its magnitude is 1. If its initial magnitude is zero, an
     * error is thrown.
     *
     * This is the immutable form of the function normalize(). This will return a new vector, and will not modify this
     * vector.
     */
    Vector2.prototype.normalized = function () {
        var mag = this.magnitude;
        if (mag === 0) {
            throw new Error('Cannot normalize a zero-magnitude vector');
        }
        else {
            return v2(this.x / mag, this.y / mag);
        }
    };
    /**
     * Returns a copy of this vector with each component rounded by roundSymmetric.
     *
     * This is the immutable form of the function roundSymmetric(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.roundedSymmetric = function () {
        return this.copy().roundSymmetric();
    };
    /**
     * Re-scaled copy of this vector such that it has the desired magnitude. If its initial magnitude is zero, an error
     * is thrown. If the passed-in magnitude is negative, the direction of the resulting vector will be reversed.
     *
     * This is the immutable form of the function setMagnitude(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.withMagnitude = function (magnitude) {
        return this.copy().setMagnitude(magnitude);
    };
    /**
     * Copy of this vector, scaled by the desired scalar value.
     *
     * This is the immutable form of the function multiplyScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.timesScalar = function (scalar) {
        return v2(this.x * scalar, this.y * scalar);
    };
    /**
     * Same as timesScalar.
     *
     * This is the immutable form of the function multiply(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.times = function (scalar) {
        return this.timesScalar(scalar);
    };
    /**
     * Copy of this vector, multiplied component-wise by the passed-in vector v.
     *
     * This is the immutable form of the function componentMultiply(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.componentTimes = function (v) {
        return v2(this.x * v.x, this.y * v.y);
    };
    /**
     * Addition of this vector and another vector, returning a copy.
     *
     * This is the immutable form of the function add(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.plus = function (v) {
        return v2(this.x + v.x, this.y + v.y);
    };
    /**
     * Addition of this vector and another vector (x,y), returning a copy.
     *
     * This is the immutable form of the function addXY(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.plusXY = function (x, y) {
        return v2(this.x + x, this.y + y);
    };
    /**
     * Addition of this vector with a scalar (adds the scalar to every component), returning a copy.
     *
     * This is the immutable form of the function addScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.plusScalar = function (scalar) {
        return v2(this.x + scalar, this.y + scalar);
    };
    /**
     * Subtraction of this vector by another vector v, returning a copy.
     *
     * This is the immutable form of the function subtract(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.minus = function (v) {
        return v2(this.x - v.x, this.y - v.y);
    };
    /**
     * Subtraction of this vector by another vector (x,y), returning a copy.
     *
     * This is the immutable form of the function subtractXY(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.minusXY = function (x, y) {
        return v2(this.x - x, this.y - y);
    };
    /**
     * Subtraction of this vector by a scalar (subtracts the scalar from every component), returning a copy.
     *
     * This is the immutable form of the function subtractScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.minusScalar = function (scalar) {
        return v2(this.x - scalar, this.y - scalar);
    };
    /**
     * Division of this vector by a scalar (divides every component by the scalar), returning a copy.
     *
     * This is the immutable form of the function divideScalar(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.dividedScalar = function (scalar) {
        return v2(this.x / scalar, this.y / scalar);
    };
    /**
     * Negated copy of this vector (multiplies every component by -1).
     *
     * This is the immutable form of the function negate(). This will return a new vector, and will not modify
     * this vector.
     */
    Vector2.prototype.negated = function () {
        return v2(-this.x, -this.y);
    };
    /**
     * Rotated by -pi/2 (perpendicular to this vector), returned as a copy.
     */
    Vector2.prototype.getPerpendicular = function () {
        return v2(this.y, -this.x);
    };
    Object.defineProperty(Vector2.prototype, "perpendicular", {
        get: function () {
            return this.getPerpendicular();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Rotated by an arbitrary angle, in radians. Returned as a copy.
     *
     * This is the immutable form of the function rotate(). This will return a new vector, and will not modify
     * this vector.
     *
     * @param angle - In radians
     */
    Vector2.prototype.rotated = function (angle) {
        var newAngle = this.angle + angle;
        var mag = this.magnitude;
        return v2(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
    };
    /**
     * Mutable method that rotates this vector about an x,y point.
     *
     * @param x - origin of rotation in x
     * @param y - origin of rotation in y
     * @param angle - radians to rotate
     * @returns this for chaining
     */
    Vector2.prototype.rotateAboutXY = function (x, y, angle) {
        var dx = this.x - x;
        var dy = this.y - y;
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        this.x = x + dx * cos - dy * sin;
        this.y = y + dx * sin + dy * cos;
        return this;
    };
    /**
     * Same as rotateAboutXY but with a point argument.
     */
    Vector2.prototype.rotateAboutPoint = function (point, angle) {
        return this.rotateAboutXY(point.x, point.y, angle);
    };
    /**
     * Immutable method that returns a new Vector2 that is rotated about the given point.
     *
     * @param x - origin for rotation in x
     * @param y - origin for rotation in y
     * @param angle - radians to rotate
     */
    Vector2.prototype.rotatedAboutXY = function (x, y, angle) {
        return v2(this.x, this.y).rotateAboutXY(x, y, angle);
    };
    /**
     * Immutable method that returns a new Vector2 rotated about the given point.
     */
    Vector2.prototype.rotatedAboutPoint = function (point, angle) {
        return this.rotatedAboutXY(point.x, point.y, angle);
    };
    /**
     * A linear interpolation between this vector (ratio=0) and another vector (ratio=1).
     *
     * @param vector
     * @param ratio - Not necessarily constrained in [0, 1]
     */
    Vector2.prototype.blend = function (vector, ratio) {
        return v2(this.x + (vector.x - this.x) * ratio, this.y + (vector.y - this.y) * ratio);
    };
    /**
     * The average (midpoint) between this vector and another vector.
     */
    Vector2.prototype.average = function (vector) {
        return this.blend(vector, 0.5);
    };
    /**
     * Take a component-based mean of all vectors provided.
     */
    Vector2.average = function (vectors) {
        var added = _.reduce(vectors, ADDING_ACCUMULATOR, new Vector2(0, 0));
        return added.divideScalar(vectors.length);
    };
    /**
     * Debugging string for the vector.
     */
    Vector2.prototype.toString = function () {
        return "Vector2(".concat(this.x, ", ").concat(this.y, ")");
    };
    /*---------------------------------------------------------------------------*
     * Mutables
     * - all mutation should go through setXY / setX / setY
     *---------------------------------------------------------------------------*/
    /**
     * Sets all of the components of this vector, returning this.
     */
    Vector2.prototype.setXY = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    /**
     * Sets the x-component of this vector, returning this.
     */
    Vector2.prototype.setX = function (x) {
        this.x = x;
        return this;
    };
    /**
     * Sets the y-component of this vector, returning this.
     */
    Vector2.prototype.setY = function (y) {
        this.y = y;
        return this;
    };
    /**
     * Sets this vector to be a copy of another vector.
     *
     * This is the mutable form of the function copy(). This will mutate (change) this vector, in addition to returning
     * this vector itself.
     */
    Vector2.prototype.set = function (v) {
        return this.setXY(v.x, v.y);
    };
    /**
     * Sets the magnitude of this vector. If the passed-in magnitude is negative, this flips the vector and sets its
     * magnitude to abs( magnitude ).
     *
     * This is the mutable form of the function withMagnitude(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.setMagnitude = function (magnitude) {
        var scale = magnitude / this.magnitude;
        return this.multiplyScalar(scale);
    };
    /**
     * Adds another vector to this vector, changing this vector.
     *
     * This is the mutable form of the function plus(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.add = function (v) {
        return this.setXY(this.x + v.x, this.y + v.y);
    };
    /**
     * Adds another vector (x,y) to this vector, changing this vector.
     *
     * This is the mutable form of the function plusXY(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.addXY = function (x, y) {
        return this.setXY(this.x + x, this.y + y);
    };
    /**
     * Adds a scalar to this vector (added to every component), changing this vector.
     *
     * This is the mutable form of the function plusScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.addScalar = function (scalar) {
        return this.setXY(this.x + scalar, this.y + scalar);
    };
    /**
     * Subtracts this vector by another vector, changing this vector.
     *
     * This is the mutable form of the function minus(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.subtract = function (v) {
        return this.setXY(this.x - v.x, this.y - v.y);
    };
    /**
     * Subtracts this vector by another vector (x,y), changing this vector.
     *
     * This is the mutable form of the function minusXY(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.subtractXY = function (x, y) {
        return this.setXY(this.x - x, this.y - y);
    };
    /**
     * Subtracts this vector by a scalar (subtracts each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function minusScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.subtractScalar = function (scalar) {
        return this.setXY(this.x - scalar, this.y - scalar);
    };
    /**
     * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function timesScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.multiplyScalar = function (scalar) {
        return this.setXY(this.x * scalar, this.y * scalar);
    };
    /**
     * Multiplies this vector by a scalar (multiplies each component by the scalar), changing this vector.
     * Same as multiplyScalar.
     *
     * This is the mutable form of the function times(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.multiply = function (scalar) {
        return this.multiplyScalar(scalar);
    };
    /**
     * Multiplies this vector by another vector component-wise, changing this vector.
     *
     * This is the mutable form of the function componentTimes(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.componentMultiply = function (v) {
        return this.setXY(this.x * v.x, this.y * v.y);
    };
    /**
     * Divides this vector by a scalar (divides each component by the scalar), changing this vector.
     *
     * This is the mutable form of the function dividedScalar(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.divideScalar = function (scalar) {
        return this.setXY(this.x / scalar, this.y / scalar);
    };
    /**
     * Negates this vector (multiplies each component by -1), changing this vector.
     *
     * This is the mutable form of the function negated(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.negate = function () {
        return this.setXY(-this.x, -this.y);
    };
    /**
     * Normalizes this vector (rescales to where the magnitude is 1), changing this vector.
     *
     * This is the mutable form of the function normalized(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     */
    Vector2.prototype.normalize = function () {
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
    Vector2.prototype.roundSymmetric = function () {
        return this.setXY((0, roundSymmetric_js_1.roundSymmetric)(this.x), (0, roundSymmetric_js_1.roundSymmetric)(this.y));
    };
    /**
     * Rotates this vector by the angle (in radians), changing this vector.
     *
     * This is the mutable form of the function rotated(). This will mutate (change) this vector, in addition to
     * returning this vector itself.
     *
     * @param angle - In radians
     */
    Vector2.prototype.rotate = function (angle) {
        var newAngle = this.angle + angle;
        var mag = this.magnitude;
        return this.setXY(mag * Math.cos(newAngle), mag * Math.sin(newAngle));
    };
    /**
     * Sets this vector's value to be the x,y values matching the given magnitude and angle (in radians), changing
     * this vector, and returning itself.
     *
     * @param magnitude
     * @param angle - In radians
     */
    Vector2.prototype.setPolar = function (magnitude, angle) {
        return this.setXY(magnitude * Math.cos(angle), magnitude * Math.sin(angle));
    };
    /**
     * Returns a duck-typed object meant for use with tandem/phet-io serialization. Although this is redundant with
     * stateSchema, it is a nice feature of such a heavily-used type to be able to call toStateObject directly on the type.
     *
     * @returns - see stateSchema for schema
     */
    Vector2.prototype.toStateObject = function () {
        return {
            x: this.x,
            y: this.y
        };
    };
    Vector2.prototype.freeToPool = function () {
        Vector2.pool.freeToPool(this);
    };
    // static methods
    /**
     * Returns a Vector2 with the specified magnitude $r$ and angle $\theta$ (in radians), with the formula:
     *
     * $$
     * f( r, \theta ) = \begin{bmatrix} r\cos\theta \\ r\sin\theta \end{bmatrix}
     * $$
     */
    Vector2.createPolar = function (magnitude, angle) {
        return new Vector2(0, 0).setPolar(magnitude, angle);
    };
    /**
     * Constructs a Vector2 from a duck-typed object, for use with tandem/phet-io deserialization.
     */
    Vector2.fromStateObject = function (stateObject) {
        return Vector2.from(stateObject);
    };
    /**
     * Constructs a Vector2 from any object as best as it can, if a component of the v2 is not provided, it will default to 0.
     */
    Vector2.from = function (vector2Like) {
        return v2(vector2Like.x || 0, vector2Like.y || 0);
    };
    /**
     * Allocation-free implementation that gets the angle between two vectors
     *
     * @returns the angle between the vectors
     */
    Vector2.getAngleBetweenVectors = function (startVector, endVector) {
        var dx = endVector.x - startVector.x;
        var dy = endVector.y - startVector.y;
        return Math.atan2(dy, dx);
    };
    /**
     * Allocation-free way to get the distance between vectors.
     *
     * @returns the angle between the vectors
     */
    Vector2.getDistanceBetweenVectors = function (startVector, endVector) {
        var dx = endVector.x - startVector.x;
        var dy = endVector.y - startVector.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Vector2.pool = new Pool_js_1.default(Vector2, {
        maxSize: 1000,
        initialize: Vector2.prototype.setXY,
        defaultArguments: [0, 0]
    });
    /**
     * ImmutableVector2 zero vector: $\begin{bmatrix} 0\\0 \end{bmatrix}$
     */
    Vector2.ZERO = new Vector2(0, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    /**
     * ImmutableVector2 vector: $\begin{bmatrix} 1\\0 \end{bmatrix}$
     */
    Vector2.X_UNIT = new Vector2(1, 0); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    /**
     * ImmutableVector2 vector: $\begin{bmatrix} 0\\1 \end{bmatrix}$
     */
    Vector2.Y_UNIT = new Vector2(0, 1); // eslint-disable-line phet/uppercase-statics-should-be-readonly
    return Vector2;
}());
exports.default = Vector2;
// (read-only) - Helps to identify the dimension of the vector
Vector2.prototype.isVector2 = true;
Vector2.prototype.dimension = 2;
dot_js_1.default.register('Vector2', Vector2);
var v2 = Vector2.pool.create.bind(Vector2.pool);
exports.v2 = v2;
dot_js_1.default.register('v2', v2);
var ImmutableVector2 = /** @class */ (function (_super) {
    __extends(ImmutableVector2, _super);
    function ImmutableVector2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Throw errors whenever a mutable method is called on our immutable vector
     */
    ImmutableVector2.mutableOverrideHelper = function (mutableFunctionName) {
        ImmutableVector2.prototype[mutableFunctionName] = function () {
            throw new Error("Cannot call mutable method '".concat(mutableFunctionName, "' on immutable Vector2"));
        };
    };
    return ImmutableVector2;
}(Vector2));
ImmutableVector2.mutableOverrideHelper('setXY');
ImmutableVector2.mutableOverrideHelper('setX');
ImmutableVector2.mutableOverrideHelper('setY');
if (assert) {
    Vector2.ZERO = new ImmutableVector2(0, 0);
    Vector2.X_UNIT = new ImmutableVector2(1, 0);
    Vector2.Y_UNIT = new ImmutableVector2(0, 1);
}
var STATE_SCHEMA = {
    x: NumberIO_js_1.default,
    y: NumberIO_js_1.default
};
Vector2.Vector2IO = new IOType_js_1.default('Vector2IO', {
    valueType: Vector2,
    stateSchema: STATE_SCHEMA,
    toStateObject: function (vector2) { return vector2.toStateObject(); },
    fromStateObject: function (stateObject) { return Vector2.fromStateObject(stateObject); },
    documentation: 'A numerical object with x and y properties, like {x:3,y:4}'
});
