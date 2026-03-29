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
exports.m3 = exports.Matrix3Type = void 0;
/**
 * 3-dimensional Matrix
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var Enumeration_js_1 = require("../../phet-core/js/Enumeration.js");
var EnumerationValue_js_1 = require("../../phet-core/js/EnumerationValue.js");
var Pool_js_1 = require("../../phet-core/js/Pool.js");
var ArrayIO_js_1 = require("../../tandem/js/types/ArrayIO.js");
var EnumerationIO_js_1 = require("../../tandem/js/types/EnumerationIO.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var NumberIO_js_1 = require("../../tandem/js/types/NumberIO.js");
var dot_js_1 = require("./dot.js");
var Matrix4_js_1 = require("./Matrix4.js");
var toSVGNumber_js_1 = require("./util/toSVGNumber.js");
var Vector2_js_1 = require("./Vector2.js");
var Vector3_js_1 = require("./Vector3.js");
var Matrix3Type = /** @class */ (function (_super) {
    __extends(Matrix3Type, _super);
    function Matrix3Type() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Matrix3Type.OTHER = new Matrix3Type();
    Matrix3Type.IDENTITY = new Matrix3Type();
    Matrix3Type.TRANSLATION_2D = new Matrix3Type();
    Matrix3Type.SCALING = new Matrix3Type();
    Matrix3Type.AFFINE = new Matrix3Type();
    Matrix3Type.enumeration = new Enumeration_js_1.default(Matrix3Type);
    return Matrix3Type;
}(EnumerationValue_js_1.default));
exports.Matrix3Type = Matrix3Type;
var Matrix3 = /** @class */ (function () {
    /**
     * Creates an identity matrix, that can then be mutated into the proper form.
     */
    function Matrix3() {
        //Make sure no clients are expecting to create a matrix with non-identity values
        assert && assert(arguments.length === 0, 'Matrix3 constructor should not be called with any arguments.  Use m3()/Matrix3.identity()/etc.');
        this.entries = [1, 0, 0, 0, 1, 0, 0, 0, 1];
        this.type = Matrix3Type.IDENTITY;
    }
    Matrix3.prototype.initialize = function () {
        return this;
    };
    /**
     * Convenience getter for the individual 0,0 entry of the matrix.
     */
    Matrix3.prototype.m00 = function () {
        return this.entries[0];
    };
    /**
     * Convenience getter for the individual 0,1 entry of the matrix.
     */
    Matrix3.prototype.m01 = function () {
        return this.entries[3];
    };
    /**
     * Convenience getter for the individual 0,2 entry of the matrix.
     */
    Matrix3.prototype.m02 = function () {
        return this.entries[6];
    };
    /**
     * Convenience getter for the individual 1,0 entry of the matrix.
     */
    Matrix3.prototype.m10 = function () {
        return this.entries[1];
    };
    /**
     * Convenience getter for the individual 1,1 entry of the matrix.
     */
    Matrix3.prototype.m11 = function () {
        return this.entries[4];
    };
    /**
     * Convenience getter for the individual 1,2 entry of the matrix.
     */
    Matrix3.prototype.m12 = function () {
        return this.entries[7];
    };
    /**
     * Convenience getter for the individual 2,0 entry of the matrix.
     */
    Matrix3.prototype.m20 = function () {
        return this.entries[2];
    };
    /**
     * Convenience getter for the individual 2,1 entry of the matrix.
     */
    Matrix3.prototype.m21 = function () {
        return this.entries[5];
    };
    /**
     * Convenience getter for the individual 2,2 entry of the matrix.
     */
    Matrix3.prototype.m22 = function () {
        return this.entries[8];
    };
    /**
     * Returns whether this matrix is an identity matrix.
     */
    Matrix3.prototype.isIdentity = function () {
        return this.type === Matrix3Type.IDENTITY || this.equals(Matrix3.IDENTITY);
    };
    /**
     * Returns whether this matrix is likely to be an identity matrix (returning false means "inconclusive, may be
     * identity or not"), but true is guaranteed to be an identity matrix.
     */
    Matrix3.prototype.isFastIdentity = function () {
        return this.type === Matrix3Type.IDENTITY;
    };
    /**
     * Returns whether this matrix is a translation matrix.
     * By this we mean it has no shear, rotation, or scaling
     * It may be a translation of zero.
     */
    Matrix3.prototype.isTranslation = function () {
        return this.type === Matrix3Type.TRANSLATION_2D || (this.m00() === 1 && this.m11() === 1 && this.m22() === 1 && this.m01() === 0 && this.m10() === 0 && this.m20() === 0 && this.m21() === 0);
    };
    /**
     * Returns whether this matrix is an affine matrix (e.g. no shear).
     */
    Matrix3.prototype.isAffine = function () {
        return this.type === Matrix3Type.AFFINE || (this.m20() === 0 && this.m21() === 0 && this.m22() === 1);
    };
    /**
     * Returns whether it's an affine matrix where the components of transforms are independent, i.e. constructed from
     * arbitrary component scaling and translation.
     */
    Matrix3.prototype.isAligned = function () {
        // non-diagonal non-translation entries should all be zero.
        return this.isAffine() && this.m01() === 0 && this.m10() === 0;
    };
    /**
     * Returns if it's an affine matrix where the components of transforms are independent, but may be switched (unlike isAligned)
     *
     * i.e. the 2x2 rotational sub-matrix is of one of the two forms:
     * A 0  or  0  A
     * 0 B      B  0
     * This means that moving a transformed point by (x,0) or (0,y) will result in a motion along one of the axes.
     */
    Matrix3.prototype.isAxisAligned = function () {
        return this.isAffine() && ((this.m01() === 0 && this.m10() === 0) || (this.m00() === 0 && this.m11() === 0));
    };
    /**
     * Returns whether every single entry in this matrix is a finite number (non-NaN, non-infinite).
     */
    Matrix3.prototype.isFinite = function () {
        return isFinite(this.m00()) &&
            isFinite(this.m01()) &&
            isFinite(this.m02()) &&
            isFinite(this.m10()) &&
            isFinite(this.m11()) &&
            isFinite(this.m12()) &&
            isFinite(this.m20()) &&
            isFinite(this.m21()) &&
            isFinite(this.m22());
    };
    /**
     * Returns the determinant of this matrix.
     */
    Matrix3.prototype.getDeterminant = function () {
        return this.m00() * this.m11() * this.m22() + this.m01() * this.m12() * this.m20() + this.m02() * this.m10() * this.m21() - this.m02() * this.m11() * this.m20() - this.m01() * this.m10() * this.m22() - this.m00() * this.m12() * this.m21();
    };
    Object.defineProperty(Matrix3.prototype, "determinant", {
        get: function () { return this.getDeterminant(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the 2D translation, assuming multiplication with a homogeneous vector
     */
    Matrix3.prototype.getTranslation = function () {
        return new Vector2_js_1.default(this.m02(), this.m12());
    };
    Object.defineProperty(Matrix3.prototype, "translation", {
        get: function () { return this.getTranslation(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a vector that is equivalent to ( T(1,0).magnitude(), T(0,1).magnitude() ) where T is a relative transform
     */
    Matrix3.prototype.getScaleVector = function () {
        return new Vector2_js_1.default(Math.sqrt(this.m00() * this.m00() + this.m10() * this.m10()), Math.sqrt(this.m01() * this.m01() + this.m11() * this.m11()));
    };
    Object.defineProperty(Matrix3.prototype, "scaleVector", {
        get: function () { return this.getScaleVector(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the total "amount" of scaled area in this matrix (which will be negative if it flips the coordinate system).
     * For instance, Matrix3.scaling( 2 ) will return 4, since it scales the area by 4.
     */
    Matrix3.prototype.getSignedScale = function () {
        // It's the cross product of untranslated-transformed-(1,0) and untranslated-transformed-(0,1)
        return this.m00() * this.m11() - this.m10() * this.m01();
    };
    /**
     * Returns the angle in radians for the 2d rotation from this matrix, between pi, -pi
     */
    Matrix3.prototype.getRotation = function () {
        return Math.atan2(this.m10(), this.m00());
    };
    Object.defineProperty(Matrix3.prototype, "rotation", {
        get: function () { return this.getRotation(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns an identity-padded copy of this matrix with an increased dimension.
     */
    Matrix3.prototype.toMatrix4 = function () {
        return new Matrix4_js_1.default(this.m00(), this.m01(), this.m02(), 0, this.m10(), this.m11(), this.m12(), 0, this.m20(), this.m21(), this.m22(), 0, 0, 0, 0, 1);
    };
    /**
     * Returns an identity-padded copy of this matrix with an increased dimension, treating this matrix's affine
     * components only.
     */
    Matrix3.prototype.toAffineMatrix4 = function () {
        return new Matrix4_js_1.default(this.m00(), this.m01(), 0, this.m02(), this.m10(), this.m11(), 0, this.m12(), 0, 0, 1, 0, 0, 0, 0, 1);
    };
    /**
     * Returns a string form of this object
     */
    Matrix3.prototype.toString = function () {
        return "".concat(this.m00(), " ").concat(this.m01(), " ").concat(this.m02(), "\n").concat(this.m10(), " ").concat(this.m11(), " ").concat(this.m12(), "\n").concat(this.m20(), " ").concat(this.m21(), " ").concat(this.m22());
    };
    /**
     * Creates an SVG form of this matrix, for high-performance processing in SVG output.
     */
    Matrix3.prototype.toSVGMatrix = function () {
        var result = document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGMatrix();
        // top two rows
        result.a = this.m00();
        result.b = this.m10();
        result.c = this.m01();
        result.d = this.m11();
        result.e = this.m02();
        result.f = this.m12();
        return result;
    };
    /**
     * Returns the CSS form (simplified if possible) for this transformation matrix.
     */
    Matrix3.prototype.getCSSTransform = function () {
        // See http://www.w3.org/TR/css3-transforms/, particularly Section 13 that discusses the SVG compatibility
        // We need to prevent the numbers from being in an exponential toString form, since the CSS transform does not support that
        // 20 is the largest guaranteed number of digits according to https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Number/toFixed
        // See https://github.com/phetsims/dot/issues/36
        // the inner part of a CSS3 transform, but remember to add the browser-specific parts!
        // NOTE: the toFixed calls are inlined for performance reasons
        return "matrix(".concat(this.entries[0].toFixed(20), ",").concat(this.entries[1].toFixed(20), ",").concat(this.entries[3].toFixed(20), ",").concat(this.entries[4].toFixed(20), ",").concat(this.entries[6].toFixed(20), ",").concat(this.entries[7].toFixed(20), ")"); // eslint-disable-line phet/bad-sim-text
    };
    Object.defineProperty(Matrix3.prototype, "cssTransform", {
        get: function () { return this.getCSSTransform(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the CSS-like SVG matrix form for this transformation matrix.
     */
    Matrix3.prototype.getSVGTransform = function () {
        // SVG transform presentation attribute. See http://www.w3.org/TR/SVG/coords.html#TransformAttribute
        switch (this.type) {
            case Matrix3Type.IDENTITY:
                return '';
            case Matrix3Type.TRANSLATION_2D:
                return "translate(".concat((0, toSVGNumber_js_1.default)(this.entries[6]), ",").concat((0, toSVGNumber_js_1.default)(this.entries[7]), ")");
            case Matrix3Type.SCALING:
                return "scale(".concat((0, toSVGNumber_js_1.default)(this.entries[0])).concat(this.entries[0] === this.entries[4] ? '' : ",".concat((0, toSVGNumber_js_1.default)(this.entries[4])), ")");
            default:
                return "matrix(".concat((0, toSVGNumber_js_1.default)(this.entries[0]), ",").concat((0, toSVGNumber_js_1.default)(this.entries[1]), ",").concat((0, toSVGNumber_js_1.default)(this.entries[3]), ",").concat((0, toSVGNumber_js_1.default)(this.entries[4]), ",").concat((0, toSVGNumber_js_1.default)(this.entries[6]), ",").concat((0, toSVGNumber_js_1.default)(this.entries[7]), ")");
        }
    };
    Object.defineProperty(Matrix3.prototype, "svgTransform", {
        get: function () { return this.getSVGTransform(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a parameter object suitable for use with jQuery's .css()
     */
    Matrix3.prototype.getCSSTransformStyles = function () {
        var transformCSS = this.getCSSTransform();
        // notes on triggering hardware acceleration: http://creativejs.com/2011/12/day-2-gpu-accelerate-your-dom-elements/
        return {
            // force iOS hardware acceleration
            '-webkit-perspective': '1000',
            '-webkit-backface-visibility': 'hidden',
            '-webkit-transform': "".concat(transformCSS, " translateZ(0)"), // trigger hardware acceleration if possible
            '-moz-transform': "".concat(transformCSS, " translateZ(0)"), // trigger hardware acceleration if possible
            '-ms-transform': transformCSS,
            '-o-transform': transformCSS,
            transform: transformCSS,
            'transform-origin': 'top left', // at the origin of the component. consider 0px 0px instead. Critical, since otherwise this defaults to 50% 50%!!! see https://developer.mozilla.org/en-US/docs/CSS/transform-origin
            '-ms-transform-origin': 'top left' // TODO: do we need other platform-specific transform-origin styles? https://github.com/phetsims/dot/issues/96
        };
    };
    Object.defineProperty(Matrix3.prototype, "cssTransformStyles", {
        get: function () { return this.getCSSTransformStyles(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns exact equality with another matrix
     */
    Matrix3.prototype.equals = function (matrix) {
        return this.m00() === matrix.m00() && this.m01() === matrix.m01() && this.m02() === matrix.m02() &&
            this.m10() === matrix.m10() && this.m11() === matrix.m11() && this.m12() === matrix.m12() &&
            this.m20() === matrix.m20() && this.m21() === matrix.m21() && this.m22() === matrix.m22();
    };
    /**
     * Returns equality within a margin of error with another matrix
     */
    Matrix3.prototype.equalsEpsilon = function (matrix, epsilon) {
        return Math.abs(this.m00() - matrix.m00()) < epsilon &&
            Math.abs(this.m01() - matrix.m01()) < epsilon &&
            Math.abs(this.m02() - matrix.m02()) < epsilon &&
            Math.abs(this.m10() - matrix.m10()) < epsilon &&
            Math.abs(this.m11() - matrix.m11()) < epsilon &&
            Math.abs(this.m12() - matrix.m12()) < epsilon &&
            Math.abs(this.m20() - matrix.m20()) < epsilon &&
            Math.abs(this.m21() - matrix.m21()) < epsilon &&
            Math.abs(this.m22() - matrix.m22()) < epsilon;
    };
    /*---------------------------------------------------------------------------*
     * Immutable operations (returns a new matrix)
     *----------------------------------------------------------------------------*/
    /**
     * Returns a copy of this matrix
     */
    Matrix3.prototype.copy = function () {
        return m3(this.m00(), this.m01(), this.m02(), this.m10(), this.m11(), this.m12(), this.m20(), this.m21(), this.m22(), this.type);
    };
    /**
     * Returns a new matrix, defined by this matrix plus the provided matrix
     */
    Matrix3.prototype.plus = function (matrix) {
        return m3(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22());
    };
    /**
     * Returns a new matrix, defined by this matrix plus the provided matrix
     */
    Matrix3.prototype.minus = function (matrix) {
        return m3(this.m00() - matrix.m00(), this.m01() - matrix.m01(), this.m02() - matrix.m02(), this.m10() - matrix.m10(), this.m11() - matrix.m11(), this.m12() - matrix.m12(), this.m20() - matrix.m20(), this.m21() - matrix.m21(), this.m22() - matrix.m22());
    };
    /**
     * Returns a transposed copy of this matrix
     */
    Matrix3.prototype.transposed = function () {
        return m3(this.m00(), this.m10(), this.m20(), this.m01(), this.m11(), this.m21(), this.m02(), this.m12(), this.m22(), (this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.SCALING) ? this.type : undefined);
    };
    /**
     * Returns a negated copy of this matrix
     */
    Matrix3.prototype.negated = function () {
        return m3(-this.m00(), -this.m01(), -this.m02(), -this.m10(), -this.m11(), -this.m12(), -this.m20(), -this.m21(), -this.m22());
    };
    /**
     * Returns an inverted copy of this matrix
     */
    Matrix3.prototype.inverted = function () {
        var det;
        switch (this.type) {
            case Matrix3Type.IDENTITY:
                return this;
            case Matrix3Type.TRANSLATION_2D:
                return m3(1, 0, -this.m02(), 0, 1, -this.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            case Matrix3Type.SCALING:
                return m3(1 / this.m00(), 0, 0, 0, 1 / this.m11(), 0, 0, 0, 1 / this.m22(), Matrix3Type.SCALING);
            case Matrix3Type.AFFINE:
                det = this.getDeterminant();
                if (det !== 0) {
                    return m3((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, 0, 0, 1, Matrix3Type.AFFINE);
                }
                else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            case Matrix3Type.OTHER:
                det = this.getDeterminant();
                if (det !== 0) {
                    return m3((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, (-this.m11() * this.m20() + this.m10() * this.m21()) / det, (this.m01() * this.m20() - this.m00() * this.m21()) / det, (-this.m01() * this.m10() + this.m00() * this.m11()) / det, Matrix3Type.OTHER);
                }
                else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            default:
                throw new Error("Matrix3.inverted with unknown type: ".concat(this.type));
        }
    };
    /**
     * Returns a matrix, defined by the multiplication of this * matrix.
     *
     * @param matrix
     * @returns - NOTE: this may be the same matrix!
     */
    Matrix3.prototype.timesMatrix = function (matrix) {
        // I * M === M * I === M (the identity)
        if (this.type === Matrix3Type.IDENTITY || matrix.type === Matrix3Type.IDENTITY) {
            return this.type === Matrix3Type.IDENTITY ? matrix : this;
        }
        if (this.type === matrix.type) {
            // currently two matrices of the same type will result in the same result type
            if (this.type === Matrix3Type.TRANSLATION_2D) {
                // faster combination of translations
                return m3(1, 0, this.m02() + matrix.m02(), 0, 1, this.m12() + matrix.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            }
            else if (this.type === Matrix3Type.SCALING) {
                // faster combination of scaling
                return m3(this.m00() * matrix.m00(), 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 1, Matrix3Type.SCALING);
            }
        }
        if (this.type !== Matrix3Type.OTHER && matrix.type !== Matrix3Type.OTHER) {
            // currently two matrices that are anything but "other" are technically affine, and the result will be affine
            // affine case
            return m3(this.m00() * matrix.m00() + this.m01() * matrix.m10(), this.m00() * matrix.m01() + this.m01() * matrix.m11(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02(), this.m10() * matrix.m00() + this.m11() * matrix.m10(), this.m10() * matrix.m01() + this.m11() * matrix.m11(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12(), 0, 0, 1, Matrix3Type.AFFINE);
        }
        // general case
        return m3(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22());
    };
    /*---------------------------------------------------------------------------*
     * Immutable operations (returns new form of a parameter)
     *----------------------------------------------------------------------------*/
    /**
     * Returns the multiplication of this matrix times the provided vector (treating this matrix as homogeneous, so that
     * it is the technical multiplication of (x,y,1)).
     */
    Matrix3.prototype.timesVector2 = function (vector2) {
        var x = this.m00() * vector2.x + this.m01() * vector2.y + this.m02();
        var y = this.m10() * vector2.x + this.m11() * vector2.y + this.m12();
        return new Vector2_js_1.default(x, y);
    };
    /**
     * Returns the multiplication of this matrix times the provided vector
     */
    Matrix3.prototype.timesVector3 = function (vector3) {
        var x = this.m00() * vector3.x + this.m01() * vector3.y + this.m02() * vector3.z;
        var y = this.m10() * vector3.x + this.m11() * vector3.y + this.m12() * vector3.z;
        var z = this.m20() * vector3.x + this.m21() * vector3.y + this.m22() * vector3.z;
        return new Vector3_js_1.default(x, y, z);
    };
    /**
     * Returns the multiplication of the transpose of this matrix times the provided vector (assuming the 2x2 quadrant)
     */
    Matrix3.prototype.timesTransposeVector2 = function (vector2) {
        var x = this.m00() * vector2.x + this.m10() * vector2.y;
        var y = this.m01() * vector2.x + this.m11() * vector2.y;
        return new Vector2_js_1.default(x, y);
    };
    /**
     * TODO: this operation seems to not work for transformDelta2, should be vetted https://github.com/phetsims/dot/issues/96
     */
    Matrix3.prototype.timesRelativeVector2 = function (vector2) {
        var x = this.m00() * vector2.x + this.m01() * vector2.y;
        var y = this.m10() * vector2.y + this.m11() * vector2.y;
        return new Vector2_js_1.default(x, y);
    };
    /*---------------------------------------------------------------------------*
     * Mutable operations (changes this matrix)
     *----------------------------------------------------------------------------*/
    /**
     * Sets the entire state of the matrix, in row-major order.
     *
     * NOTE: Every mutable method goes through rowMajor
     */
    Matrix3.prototype.rowMajor = function (v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
        this.entries[0] = v00;
        this.entries[1] = v10;
        this.entries[2] = v20;
        this.entries[3] = v01;
        this.entries[4] = v11;
        this.entries[5] = v21;
        this.entries[6] = v02;
        this.entries[7] = v12;
        this.entries[8] = v22;
        // TODO: consider performance of the affine check here https://github.com/phetsims/dot/issues/96
        this.type = type === undefined ? ((v20 === 0 && v21 === 0 && v22 === 1) ? Matrix3Type.AFFINE : Matrix3Type.OTHER) : type;
        return this;
    };
    /**
     * Sets this matrix to be a copy of another matrix.
     */
    Matrix3.prototype.set = function (matrix) {
        return this.rowMajor(matrix.m00(), matrix.m01(), matrix.m02(), matrix.m10(), matrix.m11(), matrix.m12(), matrix.m20(), matrix.m21(), matrix.m22(), matrix.type);
    };
    /**
     * Sets this matrix to be a copy of the column-major data stored in an array (e.g. WebGL).
     */
    Matrix3.prototype.setArray = function (array) {
        return this.rowMajor(array[0], array[3], array[6], array[1], array[4], array[7], array[2], array[5], array[8]);
    };
    /**
     * Sets the individual 0,0 component of this matrix.
     */
    Matrix3.prototype.set00 = function (value) {
        this.entries[0] = value;
        return this;
    };
    /**
     * Sets the individual 0,1 component of this matrix.
     */
    Matrix3.prototype.set01 = function (value) {
        this.entries[3] = value;
        return this;
    };
    /**
     * Sets the individual 0,2 component of this matrix.
     */
    Matrix3.prototype.set02 = function (value) {
        this.entries[6] = value;
        return this;
    };
    /**
     * Sets the individual 1,0 component of this matrix.
     */
    Matrix3.prototype.set10 = function (value) {
        this.entries[1] = value;
        return this;
    };
    /**
     * Sets the individual 1,1 component of this matrix.
     */
    Matrix3.prototype.set11 = function (value) {
        this.entries[4] = value;
        return this;
    };
    /**
     * Sets the individual 1,2 component of this matrix.
     */
    Matrix3.prototype.set12 = function (value) {
        this.entries[7] = value;
        return this;
    };
    /**
     * Sets the individual 2,0 component of this matrix.
     */
    Matrix3.prototype.set20 = function (value) {
        this.entries[2] = value;
        return this;
    };
    /**
     * Sets the individual 2,1 component of this matrix.
     */
    Matrix3.prototype.set21 = function (value) {
        this.entries[5] = value;
        return this;
    };
    /**
     * Sets the individual 2,2 component of this matrix.
     */
    Matrix3.prototype.set22 = function (value) {
        this.entries[8] = value;
        return this;
    };
    /**
     * Makes this matrix effectively immutable to the normal methods (except direct setters?)
     */
    Matrix3.prototype.makeImmutable = function () {
        if (assert) {
            this.rowMajor = function () {
                throw new Error('Cannot modify immutable matrix');
            };
        }
        return this;
    };
    /**
     * Sets the entire state of the matrix, in column-major order.
     */
    Matrix3.prototype.columnMajor = function (v00, v10, v20, v01, v11, v21, v02, v12, v22, type) {
        return this.rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
    };
    /**
     * Sets this matrix to itself plus the given matrix.
     */
    Matrix3.prototype.add = function (matrix) {
        return this.rowMajor(this.m00() + matrix.m00(), this.m01() + matrix.m01(), this.m02() + matrix.m02(), this.m10() + matrix.m10(), this.m11() + matrix.m11(), this.m12() + matrix.m12(), this.m20() + matrix.m20(), this.m21() + matrix.m21(), this.m22() + matrix.m22());
    };
    /**
     * Sets this matrix to itself minus the given matrix.
     */
    Matrix3.prototype.subtract = function (m) {
        return this.rowMajor(this.m00() - m.m00(), this.m01() - m.m01(), this.m02() - m.m02(), this.m10() - m.m10(), this.m11() - m.m11(), this.m12() - m.m12(), this.m20() - m.m20(), this.m21() - m.m21(), this.m22() - m.m22());
    };
    /**
     * Sets this matrix to its own transpose.
     */
    Matrix3.prototype.transpose = function () {
        return this.rowMajor(this.m00(), this.m10(), this.m20(), this.m01(), this.m11(), this.m21(), this.m02(), this.m12(), this.m22(), (this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.SCALING) ? this.type : undefined);
    };
    /**
     * Sets this matrix to its own negation.
     */
    Matrix3.prototype.negate = function () {
        return this.rowMajor(-this.m00(), -this.m01(), -this.m02(), -this.m10(), -this.m11(), -this.m12(), -this.m20(), -this.m21(), -this.m22());
    };
    /**
     * Sets this matrix to its own inverse.
     */
    Matrix3.prototype.invert = function () {
        var det;
        switch (this.type) {
            case Matrix3Type.IDENTITY:
                return this;
            case Matrix3Type.TRANSLATION_2D:
                return this.rowMajor(1, 0, -this.m02(), 0, 1, -this.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            case Matrix3Type.SCALING:
                return this.rowMajor(1 / this.m00(), 0, 0, 0, 1 / this.m11(), 0, 0, 0, 1 / this.m22(), Matrix3Type.SCALING);
            case Matrix3Type.AFFINE:
                det = this.getDeterminant();
                if (det !== 0) {
                    return this.rowMajor((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, 0, 0, 1, Matrix3Type.AFFINE);
                }
                else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            case Matrix3Type.OTHER:
                det = this.getDeterminant();
                if (det !== 0) {
                    return this.rowMajor((-this.m12() * this.m21() + this.m11() * this.m22()) / det, (this.m02() * this.m21() - this.m01() * this.m22()) / det, (-this.m02() * this.m11() + this.m01() * this.m12()) / det, (this.m12() * this.m20() - this.m10() * this.m22()) / det, (-this.m02() * this.m20() + this.m00() * this.m22()) / det, (this.m02() * this.m10() - this.m00() * this.m12()) / det, (-this.m11() * this.m20() + this.m10() * this.m21()) / det, (this.m01() * this.m20() - this.m00() * this.m21()) / det, (-this.m01() * this.m10() + this.m00() * this.m11()) / det, Matrix3Type.OTHER);
                }
                else {
                    throw new Error('Matrix could not be inverted, determinant === 0');
                }
            default:
                throw new Error("Matrix3.inverted with unknown type: ".concat(this.type));
        }
    };
    /**
     * Sets this matrix to the value of itself times the provided matrix
     */
    Matrix3.prototype.multiplyMatrix = function (matrix) {
        // M * I === M (the identity)
        if (matrix.type === Matrix3Type.IDENTITY) {
            // no change needed
            return this;
        }
        // I * M === M (the identity)
        if (this.type === Matrix3Type.IDENTITY) {
            // copy the other matrix to us
            return this.set(matrix);
        }
        if (this.type === matrix.type) {
            // currently two matrices of the same type will result in the same result type
            if (this.type === Matrix3Type.TRANSLATION_2D) {
                // faster combination of translations
                return this.rowMajor(1, 0, this.m02() + matrix.m02(), 0, 1, this.m12() + matrix.m12(), 0, 0, 1, Matrix3Type.TRANSLATION_2D);
            }
            else if (this.type === Matrix3Type.SCALING) {
                // faster combination of scaling
                return this.rowMajor(this.m00() * matrix.m00(), 0, 0, 0, this.m11() * matrix.m11(), 0, 0, 0, 1, Matrix3Type.SCALING);
            }
        }
        if (this.type !== Matrix3Type.OTHER && matrix.type !== Matrix3Type.OTHER) {
            // currently two matrices that are anything but "other" are technically affine, and the result will be affine
            // affine case
            return this.rowMajor(this.m00() * matrix.m00() + this.m01() * matrix.m10(), this.m00() * matrix.m01() + this.m01() * matrix.m11(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02(), this.m10() * matrix.m00() + this.m11() * matrix.m10(), this.m10() * matrix.m01() + this.m11() * matrix.m11(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12(), 0, 0, 1, Matrix3Type.AFFINE);
        }
        // general case
        return this.rowMajor(this.m00() * matrix.m00() + this.m01() * matrix.m10() + this.m02() * matrix.m20(), this.m00() * matrix.m01() + this.m01() * matrix.m11() + this.m02() * matrix.m21(), this.m00() * matrix.m02() + this.m01() * matrix.m12() + this.m02() * matrix.m22(), this.m10() * matrix.m00() + this.m11() * matrix.m10() + this.m12() * matrix.m20(), this.m10() * matrix.m01() + this.m11() * matrix.m11() + this.m12() * matrix.m21(), this.m10() * matrix.m02() + this.m11() * matrix.m12() + this.m12() * matrix.m22(), this.m20() * matrix.m00() + this.m21() * matrix.m10() + this.m22() * matrix.m20(), this.m20() * matrix.m01() + this.m21() * matrix.m11() + this.m22() * matrix.m21(), this.m20() * matrix.m02() + this.m21() * matrix.m12() + this.m22() * matrix.m22());
    };
    /**
     * Mutates this matrix, equivalent to (translation * this).
     */
    Matrix3.prototype.prependTranslation = function (x, y) {
        this.set02(this.m02() + x);
        this.set12(this.m12() + y);
        if (this.type === Matrix3Type.IDENTITY || this.type === Matrix3Type.TRANSLATION_2D) {
            this.type = Matrix3Type.TRANSLATION_2D;
        }
        else if (this.type === Matrix3Type.OTHER) {
            this.type = Matrix3Type.OTHER;
        }
        else {
            this.type = Matrix3Type.AFFINE;
        }
        return this; // for chaining
    };
    /**
     * Sets this matrix to the 3x3 identity matrix.
     */
    Matrix3.prototype.setToIdentity = function () {
        return this.rowMajor(1, 0, 0, 0, 1, 0, 0, 0, 1, Matrix3Type.IDENTITY);
    };
    /**
     * Sets this matrix to the affine translation matrix.
     */
    Matrix3.prototype.setToTranslation = function (x, y) {
        return this.rowMajor(1, 0, x, 0, 1, y, 0, 0, 1, Matrix3Type.TRANSLATION_2D);
    };
    /**
     * Sets this matrix to the affine scaling matrix.
     */
    Matrix3.prototype.setToScale = function (x, y) {
        // allow using one parameter to scale everything
        y = y === undefined ? x : y;
        return this.rowMajor(x, 0, 0, 0, y, 0, 0, 0, 1, Matrix3Type.SCALING);
    };
    /**
     * Sets this matrix to an affine matrix with the specified row-major values.
     */
    Matrix3.prototype.setToAffine = function (m00, m01, m02, m10, m11, m12) {
        return this.rowMajor(m00, m01, m02, m10, m11, m12, 0, 0, 1, Matrix3Type.AFFINE);
    };
    /**
     * Sets the matrix to a rotation defined by a rotation of the specified angle around the given unit axis.
     *
     * @param axis - normalized
     * @param angle - in radians
     */
    Matrix3.prototype.setToRotationAxisAngle = function (axis, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        var C = 1 - c;
        return this.rowMajor(axis.x * axis.x * C + c, axis.x * axis.y * C - axis.z * s, axis.x * axis.z * C + axis.y * s, axis.y * axis.x * C + axis.z * s, axis.y * axis.y * C + c, axis.y * axis.z * C - axis.x * s, axis.z * axis.x * C - axis.y * s, axis.z * axis.y * C + axis.x * s, axis.z * axis.z * C + c, Matrix3Type.OTHER);
    };
    /**
     * Sets this matrix to a rotation around the x axis (in the yz plane).
     *
     * @param angle - in radians
     */
    Matrix3.prototype.setToRotationX = function (angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(1, 0, 0, 0, c, -s, 0, s, c, Matrix3Type.OTHER);
    };
    /**
     * Sets this matrix to a rotation around the y axis (in the xz plane).
     *
     * @param angle - in radians
     */
    Matrix3.prototype.setToRotationY = function (angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(c, 0, s, 0, 1, 0, -s, 0, c, Matrix3Type.OTHER);
    };
    /**
     * Sets this matrix to a rotation around the z axis (in the xy plane).
     *
     * @param angle - in radians
     */
    Matrix3.prototype.setToRotationZ = function (angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(c, -s, 0, s, c, 0, 0, 0, 1, Matrix3Type.AFFINE);
    };
    /**
     * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
     * would be translated).
     *
     * @param x
     * @param y
     * @param angle - in radians
     */
    Matrix3.prototype.setToTranslationRotation = function (x, y, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        return this.rowMajor(c, -s, x, s, c, y, 0, 0, 1, Matrix3Type.AFFINE);
    };
    /**
     * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
     * would be translated).
     *
     * @param translation
     * @param angle - in radians
     */
    Matrix3.prototype.setToTranslationRotationPoint = function (translation, angle) {
        return this.setToTranslationRotation(translation.x, translation.y, angle);
    };
    /**
     * Sets this matrix to the combined scale+translation+rotation.
     *
     * The order of operations is scale, then rotate, then translate.
     *
     * @param x
     * @param y
     * @param angle - in radians
     */
    Matrix3.prototype.setToScaleTranslationRotation = function (scale, x, y, angle) {
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        // Handle cases close to 0, since we want Math.PI/2 rotations (and the like) to be exact
        if (Math.abs(c) < 1e-15) {
            c = 0;
        }
        if (Math.abs(s) < 1e-15) {
            s = 0;
        }
        c *= scale;
        s *= scale;
        return this.rowMajor(c, -s, x, s, c, y, 0, 0, 1, Matrix3Type.AFFINE);
    };
    /**
     * Sets this matrix to the combined translation+rotation (where the rotation logically would happen first, THEN it
     * would be translated).
     *
     * @param translation
     * @param angle - in radians
     */
    Matrix3.prototype.setToScaleTranslationRotationPoint = function (scale, translation, angle) {
        return this.setToScaleTranslationRotation(scale, translation.x, translation.y, angle);
    };
    /**
     * Sets this matrix to the values contained in an SVGMatrix.
     */
    Matrix3.prototype.setToSVGMatrix = function (svgMatrix) {
        return this.rowMajor(svgMatrix.a, svgMatrix.c, svgMatrix.e, svgMatrix.b, svgMatrix.d, svgMatrix.f, 0, 0, 1, Matrix3Type.AFFINE);
    };
    /**
     * Sets this matrix to a rotation matrix that rotates A to B (Vector3 instances), by rotating about the axis
     * A.cross( B ) -- Shortest path. ideally should be unit vectors.
     */
    Matrix3.prototype.setRotationAToB = function (a, b) {
        // see http://graphics.cs.brown.edu/~jfh/papers/Moller-EBA-1999/paper.pdf for information on this implementation
        var start = a;
        var end = b;
        var epsilon = 0.0001;
        var v = start.cross(end);
        var e = start.dot(end);
        var f = (e < 0) ? -e : e;
        // if "from" and "to" vectors are nearly parallel
        if (f > 1.0 - epsilon) {
            var x = new Vector3_js_1.default((start.x > 0.0) ? start.x : -start.x, (start.y > 0.0) ? start.y : -start.y, (start.z > 0.0) ? start.z : -start.z);
            if (x.x < x.y) {
                if (x.x < x.z) {
                    x = Vector3_js_1.default.X_UNIT;
                }
                else {
                    x = Vector3_js_1.default.Z_UNIT;
                }
            }
            else {
                if (x.y < x.z) {
                    x = Vector3_js_1.default.Y_UNIT;
                }
                else {
                    x = Vector3_js_1.default.Z_UNIT;
                }
            }
            var u = x.minus(start);
            v = x.minus(end);
            var c1 = 2.0 / u.dot(u);
            var c2 = 2.0 / v.dot(v);
            var c3 = c1 * c2 * u.dot(v);
            return this.rowMajor(-c1 * u.x * u.x - c2 * v.x * v.x + c3 * v.x * u.x + 1, -c1 * u.x * u.y - c2 * v.x * v.y + c3 * v.x * u.y, -c1 * u.x * u.z - c2 * v.x * v.z + c3 * v.x * u.z, -c1 * u.y * u.x - c2 * v.y * v.x + c3 * v.y * u.x, -c1 * u.y * u.y - c2 * v.y * v.y + c3 * v.y * u.y + 1, -c1 * u.y * u.z - c2 * v.y * v.z + c3 * v.y * u.z, -c1 * u.z * u.x - c2 * v.z * v.x + c3 * v.z * u.x, -c1 * u.z * u.y - c2 * v.z * v.y + c3 * v.z * u.y, -c1 * u.z * u.z - c2 * v.z * v.z + c3 * v.z * u.z + 1);
        }
        else {
            // the most common case, unless "start"="end", or "start"=-"end"
            var h = 1.0 / (1.0 + e);
            var hvx = h * v.x;
            var hvz = h * v.z;
            var hvxy = hvx * v.y;
            var hvxz = hvx * v.z;
            var hvyz = hvz * v.y;
            return this.rowMajor(e + hvx * v.x, hvxy - v.z, hvxz + v.y, hvxy + v.z, e + h * v.y * v.y, hvyz - v.x, hvxz - v.y, hvyz + v.x, e + hvz * v.z);
        }
    };
    /*---------------------------------------------------------------------------*
     * Mutable operations (changes the parameter)
     *----------------------------------------------------------------------------*/
    /**
     * Sets the vector to the result of (matrix * vector), as a homogeneous multiplication.
     *
     * @returns - The vector that was mutated
     */
    Matrix3.prototype.multiplyVector2 = function (vector2) {
        return vector2.setXY(this.m00() * vector2.x + this.m01() * vector2.y + this.m02(), this.m10() * vector2.x + this.m11() * vector2.y + this.m12());
    };
    /**
     * Sets the vector to the result of (matrix * vector).
     *
     * @returns - The vector that was mutated
     */
    Matrix3.prototype.multiplyVector3 = function (vector3) {
        return vector3.setXYZ(this.m00() * vector3.x + this.m01() * vector3.y + this.m02() * vector3.z, this.m10() * vector3.x + this.m11() * vector3.y + this.m12() * vector3.z, this.m20() * vector3.x + this.m21() * vector3.y + this.m22() * vector3.z);
    };
    /**
     * Sets the vector to the result of (transpose(matrix) * vector), ignoring the translation parameters.
     *
     * @returns - The vector that was mutated
     */
    Matrix3.prototype.multiplyTransposeVector2 = function (v) {
        return v.setXY(this.m00() * v.x + this.m10() * v.y, this.m01() * v.x + this.m11() * v.y);
    };
    /**
     * Sets the vector to the result of (matrix * vector - matrix * zero). Since this is a homogeneous operation, it is
     * equivalent to the multiplication of (x,y,0).
     *
     * @returns - The vector that was mutated
     */
    Matrix3.prototype.multiplyRelativeVector2 = function (v) {
        return v.setXY(this.m00() * v.x + this.m01() * v.y, this.m10() * v.y + this.m11() * v.y);
    };
    /**
     * Sets the transform of a Canvas 2D rendering context to the affine part of this matrix
     */
    Matrix3.prototype.canvasSetTransform = function (context) {
        context.setTransform(
        // inlined array entries
        this.entries[0], this.entries[1], this.entries[3], this.entries[4], this.entries[6], this.entries[7]);
    };
    /**
     * Appends to the affine part of this matrix to the Canvas 2D rendering context
     */
    Matrix3.prototype.canvasAppendTransform = function (context) {
        if (this.type !== Matrix3Type.IDENTITY) {
            context.transform(
            // inlined array entries
            this.entries[0], this.entries[1], this.entries[3], this.entries[4], this.entries[6], this.entries[7]);
        }
    };
    /**
     * Copies the entries of this matrix over to an arbitrary array (typed or normal).
     */
    Matrix3.prototype.copyToArray = function (array) {
        array[0] = this.m00();
        array[1] = this.m10();
        array[2] = this.m20();
        array[3] = this.m01();
        array[4] = this.m11();
        array[5] = this.m21();
        array[6] = this.m02();
        array[7] = this.m12();
        array[8] = this.m22();
        return array;
    };
    Matrix3.prototype.freeToPool = function () {
        Matrix3.pool.freeToPool(this);
    };
    /**
     * Returns an identity matrix.
     */
    Matrix3.identity = function () {
        return fromPool().setToIdentity();
    };
    /**
     * Returns a translation matrix.
     */
    Matrix3.translation = function (x, y) {
        return fromPool().setToTranslation(x, y);
    };
    /**
     * Returns a translation matrix computed from a vector.
     */
    Matrix3.translationFromVector = function (vector) {
        return Matrix3.translation(vector.x, vector.y);
    };
    /**
     * Returns a matrix that scales things in each dimension.
     */
    Matrix3.scaling = function (x, y) {
        return fromPool().setToScale(x, y);
    };
    /**
     * Returns a matrix that scales things in each dimension.
     */
    Matrix3.scale = function (x, y) {
        return Matrix3.scaling(x, y);
    };
    /**
     * Returns an affine matrix with the given parameters.
     */
    Matrix3.affine = function (m00, m01, m02, m10, m11, m12) {
        return fromPool().setToAffine(m00, m01, m02, m10, m11, m12);
    };
    /**
     * Creates a new matrix with all entries determined in row-major order.
     */
    Matrix3.rowMajor = function (v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
        return fromPool().rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
    };
    /**
     * Returns a matrix rotation defined by a rotation of the specified angle around the given unit axis.
     *
     * @param axis - normalized
     * @param angle - in radians
     */
    Matrix3.rotationAxisAngle = function (axis, angle) {
        return fromPool().setToRotationAxisAngle(axis, angle);
    };
    /**
     * Returns a matrix that rotates around the x axis (in the yz plane).
     *
     * @param angle - in radians
     */
    Matrix3.rotationX = function (angle) {
        return fromPool().setToRotationX(angle);
    };
    /**
     * Returns a matrix that rotates around the y axis (in the xz plane).
     *
     * @param angle - in radians
     */
    Matrix3.rotationY = function (angle) {
        return fromPool().setToRotationY(angle);
    };
    /**
     * Returns a matrix that rotates around the z axis (in the xy plane).
     *
     * @param angle - in radians
     */
    Matrix3.rotationZ = function (angle) {
        return fromPool().setToRotationZ(angle);
    };
    /**
     * Returns a combined 2d translation + rotation (with the rotation effectively applied first).
     *
     * @param angle - in radians
     */
    Matrix3.translationRotation = function (x, y, angle) {
        return fromPool().setToTranslationRotation(x, y, angle);
    };
    /**
     * Standard 2d rotation matrix for a given angle.
     *
     * @param angle - in radians
     */
    Matrix3.rotation2 = function (angle) {
        return fromPool().setToRotationZ(angle);
    };
    /**
     * Returns a matrix which will be a 2d rotation around a given x,y point.
     *
     * @param angle - in radians
     * @param x
     * @param y
     */
    Matrix3.rotationAround = function (angle, x, y) {
        return Matrix3.translation(x, y).timesMatrix(Matrix3.rotation2(angle)).timesMatrix(Matrix3.translation(-x, -y));
    };
    /**
     * Returns a matrix which will be a 2d rotation around a given 2d point.
     *
     * @param angle - in radians
     * @param point
     */
    Matrix3.rotationAroundPoint = function (angle, point) {
        return Matrix3.rotationAround(angle, point.x, point.y);
    };
    /**
     * Returns a matrix equivalent to a given SVGMatrix.
     */
    Matrix3.fromSVGMatrix = function (svgMatrix) {
        return fromPool().setToSVGMatrix(svgMatrix);
    };
    /**
     * Returns a rotation matrix that rotates A to B, by rotating about the axis A.cross( B ) -- Shortest path. ideally
     * should be unit vectors.
     */
    Matrix3.rotateAToB = function (a, b) {
        return fromPool().setRotationAToB(a, b);
    };
    /**
     * Shortcut for translation times a matrix (without allocating a translation matrix), see scenery#119
     */
    Matrix3.translationTimesMatrix = function (x, y, matrix) {
        var type;
        if (matrix.type === Matrix3Type.IDENTITY || matrix.type === Matrix3Type.TRANSLATION_2D) {
            return m3(1, 0, matrix.m02() + x, 0, 1, matrix.m12() + y, 0, 0, 1, Matrix3Type.TRANSLATION_2D);
        }
        else if (matrix.type === Matrix3Type.OTHER) {
            type = Matrix3Type.OTHER;
        }
        else {
            type = Matrix3Type.AFFINE;
        }
        return m3(matrix.m00(), matrix.m01(), matrix.m02() + x, matrix.m10(), matrix.m11(), matrix.m12() + y, matrix.m20(), matrix.m21(), matrix.m22(), type);
    };
    /**
     * Serialize to an Object that can be handled by PhET-iO
     */
    Matrix3.toStateObject = function (matrix3) {
        return {
            entries: Array.from(matrix3.entries),
            type: matrix3.type.name
        };
    };
    /**
     * Convert back from a serialized Object to a Matrix3
     */
    Matrix3.fromStateObject = function (stateObject) {
        var matrix = Matrix3.identity();
        assert && assert(stateObject.entries.length === 9, 'matrix3 needs nine number');
        matrix.entries = stateObject.entries;
        matrix.type = Matrix3Type.enumeration.getValue(stateObject.type);
        return matrix;
    };
    Matrix3.pool = new Pool_js_1.default(Matrix3, {
        initialize: Matrix3.prototype.initialize,
        useDefaultConstruction: true,
        maxSize: 300
    });
    return Matrix3;
}());
exports.default = Matrix3;
dot_js_1.default.register('Matrix3', Matrix3);
var fromPool = Matrix3.pool.fetch.bind(Matrix3.pool);
var m3 = function (v00, v01, v02, v10, v11, v12, v20, v21, v22, type) {
    return fromPool().rowMajor(v00, v01, v02, v10, v11, v12, v20, v21, v22, type);
};
exports.m3 = m3;
dot_js_1.default.register('m3', m3);
Matrix3.IDENTITY = Matrix3.identity().makeImmutable();
Matrix3.X_REFLECTION = m3(-1, 0, 0, 0, 1, 0, 0, 0, 1, Matrix3Type.AFFINE).makeImmutable();
Matrix3.Y_REFLECTION = m3(1, 0, 0, 0, -1, 0, 0, 0, 1, Matrix3Type.AFFINE).makeImmutable();
Matrix3.Matrix3IO = new IOType_js_1.default('Matrix3IO', {
    valueType: Matrix3,
    documentation: 'A 3x3 matrix often used for holding transform data.',
    toStateObject: function (matrix3) { return Matrix3.toStateObject(matrix3); },
    fromStateObject: function (x) { return Matrix3.fromStateObject(x); },
    stateSchema: {
        entries: (0, ArrayIO_js_1.default)(NumberIO_js_1.default),
        type: (0, EnumerationIO_js_1.default)(Matrix3Type)
    }
});
