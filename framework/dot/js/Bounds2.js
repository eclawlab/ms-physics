"use strict";
// Copyright 2013-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A 2D rectangle-shaped bounded area (bounding box).
 *
 * There are a number of convenience functions to get positions and points on the Bounds. Currently we do not
 * store these with the Bounds2 instance, since we want to lower the memory footprint.
 *
 * minX, minY, maxX, and maxY are actually stored. We don't do x,y,width,height because this can't properly express
 * semi-infinite bounds (like a half-plane), or easily handle what Bounds2.NOTHING and Bounds2.EVERYTHING do with
 * the constructive solid areas.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var Orientation_js_1 = require("../../phet-core/js/Orientation.js");
var Pool_js_1 = require("../../phet-core/js/Pool.js");
var InfiniteNumberIO_js_1 = require("../../tandem/js/types/InfiniteNumberIO.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var dot_js_1 = require("./dot.js");
var Range_js_1 = require("./Range.js");
var Vector2_js_1 = require("./Vector2.js");
// Temporary instances to be used in the transform method.
var scratchVector2 = new Vector2_js_1.default(0, 0);
var Bounds2 = /** @class */ (function () {
    /**
     * Creates a 2-dimensional bounds (bounding box).
     *
     * @param minX - The initial minimum X coordinate of the bounds.
     * @param minY - The initial minimum Y coordinate of the bounds.
     * @param maxX - The initial maximum X coordinate of the bounds.
     * @param maxY - The initial maximum Y coordinate of the bounds.
     */
    function Bounds2(minX, minY, maxX, maxY) {
        assert && assert(maxY !== undefined, 'Bounds2 requires 4 parameters');
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }
    /*---------------------------------------------------------------------------*
     * Properties
     *---------------------------------------------------------------------------*/
    /**
     * The width of the bounds, defined as maxX - minX.
     */
    Bounds2.prototype.getWidth = function () { return this.maxX - this.minX; };
    Object.defineProperty(Bounds2.prototype, "width", {
        get: function () { return this.getWidth(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The height of the bounds, defined as maxY - minY.
     */
    Bounds2.prototype.getHeight = function () { return this.maxY - this.minY; };
    Object.defineProperty(Bounds2.prototype, "height", {
        get: function () { return this.getHeight(); },
        enumerable: false,
        configurable: true
    });
    /*
     * Convenience positions
     * upper is in terms of the visual layout in Scenery and other programs, so the minY is the "upper", and minY is the "lower"
     *
     *             minX (x)     centerX        maxX
     *          ---------------------------------------
     * minY (y) | leftTop     centerTop     rightTop
     * centerY  | leftCenter  center        rightCenter
     * maxY     | leftBottom  centerBottom  rightBottom
     */
    /**
     * Alias for minX, when thinking of the bounds as an (x,y,width,height) rectangle.
     */
    Bounds2.prototype.getX = function () { return this.minX; };
    Object.defineProperty(Bounds2.prototype, "x", {
        get: function () { return this.getX(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Alias for minY, when thinking of the bounds as an (x,y,width,height) rectangle.
     */
    Bounds2.prototype.getY = function () { return this.minY; };
    Object.defineProperty(Bounds2.prototype, "y", {
        get: function () { return this.getY(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Alias for minX, supporting the explicit getter function style.
     */
    Bounds2.prototype.getMinX = function () { return this.minX; };
    /**
     * Alias for minY, supporting the explicit getter function style.
     */
    Bounds2.prototype.getMinY = function () { return this.minY; };
    /**
     * Alias for maxX, supporting the explicit getter function style.
     */
    Bounds2.prototype.getMaxX = function () { return this.maxX; };
    /**
     * Alias for maxY, supporting the explicit getter function style.
     */
    Bounds2.prototype.getMaxY = function () { return this.maxY; };
    /**
     * Alias for minX, when thinking in the UI-layout manner.
     */
    Bounds2.prototype.getLeft = function () { return this.minX; };
    Object.defineProperty(Bounds2.prototype, "left", {
        get: function () { return this.minX; },
        enumerable: false,
        configurable: true
    });
    /**
     * Alias for minY, when thinking in the UI-layout manner.
     */
    Bounds2.prototype.getTop = function () { return this.minY; };
    Object.defineProperty(Bounds2.prototype, "top", {
        get: function () { return this.minY; },
        enumerable: false,
        configurable: true
    });
    /**
     * Alias for maxX, when thinking in the UI-layout manner.
     */
    Bounds2.prototype.getRight = function () { return this.maxX; };
    Object.defineProperty(Bounds2.prototype, "right", {
        get: function () { return this.maxX; },
        enumerable: false,
        configurable: true
    });
    /**
     * Alias for maxY, when thinking in the UI-layout manner.
     */
    Bounds2.prototype.getBottom = function () { return this.maxY; };
    Object.defineProperty(Bounds2.prototype, "bottom", {
        get: function () { return this.maxY; },
        enumerable: false,
        configurable: true
    });
    /**
     * The horizontal (X-coordinate) center of the bounds, averaging the minX and maxX.
     */
    Bounds2.prototype.getCenterX = function () { return (this.maxX + this.minX) / 2; };
    Object.defineProperty(Bounds2.prototype, "centerX", {
        get: function () { return this.getCenterX(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The vertical (Y-coordinate) center of the bounds, averaging the minY and maxY.
     */
    Bounds2.prototype.getCenterY = function () { return (this.maxY + this.minY) / 2; };
    Object.defineProperty(Bounds2.prototype, "centerY", {
        get: function () { return this.getCenterY(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (minX, minY), in the UI-coordinate upper-left.
     */
    Bounds2.prototype.getLeftTop = function () { return new Vector2_js_1.default(this.minX, this.minY); };
    Object.defineProperty(Bounds2.prototype, "leftTop", {
        get: function () { return this.getLeftTop(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (centerX, minY), in the UI-coordinate upper-center.
     */
    Bounds2.prototype.getCenterTop = function () { return new Vector2_js_1.default(this.getCenterX(), this.minY); };
    Object.defineProperty(Bounds2.prototype, "centerTop", {
        get: function () { return this.getCenterTop(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (right, minY), in the UI-coordinate upper-right.
     */
    Bounds2.prototype.getRightTop = function () { return new Vector2_js_1.default(this.maxX, this.minY); };
    Object.defineProperty(Bounds2.prototype, "rightTop", {
        get: function () { return this.getRightTop(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (left, centerY), in the UI-coordinate center-left.
     */
    Bounds2.prototype.getLeftCenter = function () { return new Vector2_js_1.default(this.minX, this.getCenterY()); };
    Object.defineProperty(Bounds2.prototype, "leftCenter", {
        get: function () { return this.getLeftCenter(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (centerX, centerY), in the center of the bounds.
     */
    Bounds2.prototype.getCenter = function () { return new Vector2_js_1.default(this.getCenterX(), this.getCenterY()); };
    Object.defineProperty(Bounds2.prototype, "center", {
        get: function () { return this.getCenter(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (maxX, centerY), in the UI-coordinate center-right
     */
    Bounds2.prototype.getRightCenter = function () { return new Vector2_js_1.default(this.maxX, this.getCenterY()); };
    Object.defineProperty(Bounds2.prototype, "rightCenter", {
        get: function () { return this.getRightCenter(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (minX, maxY), in the UI-coordinate lower-left
     */
    Bounds2.prototype.getLeftBottom = function () { return new Vector2_js_1.default(this.minX, this.maxY); };
    Object.defineProperty(Bounds2.prototype, "leftBottom", {
        get: function () { return this.getLeftBottom(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (centerX, maxY), in the UI-coordinate lower-center
     */
    Bounds2.prototype.getCenterBottom = function () { return new Vector2_js_1.default(this.getCenterX(), this.maxY); };
    Object.defineProperty(Bounds2.prototype, "centerBottom", {
        get: function () { return this.getCenterBottom(); },
        enumerable: false,
        configurable: true
    });
    /**
     * The point (maxX, maxY), in the UI-coordinate lower-right
     */
    Bounds2.prototype.getRightBottom = function () { return new Vector2_js_1.default(this.maxX, this.maxY); };
    Object.defineProperty(Bounds2.prototype, "rightBottom", {
        get: function () { return this.getRightBottom(); },
        enumerable: false,
        configurable: true
    });
    /**
     * Whether we have negative width or height. Bounds2.NOTHING is a prime example of an empty Bounds2.
     * Bounds with width = height = 0 are considered not empty, since they include the single (0,0) point.
     */
    Bounds2.prototype.isEmpty = function () { return this.getWidth() < 0 || this.getHeight() < 0; };
    /**
     * Whether our minimums and maximums are all finite numbers. This will exclude Bounds2.NOTHING and Bounds2.EVERYTHING.
     */
    Bounds2.prototype.isFinite = function () {
        return isFinite(this.minX) && isFinite(this.minY) && isFinite(this.maxX) && isFinite(this.maxY);
    };
    /**
     * Whether this bounds has a non-zero area (non-zero positive width and height).
     */
    Bounds2.prototype.hasNonzeroArea = function () {
        return this.getWidth() > 0 && this.getHeight() > 0;
    };
    /**
     * Whether this bounds has a finite and non-negative width and height.
     */
    Bounds2.prototype.isValid = function () {
        return !this.isEmpty() && this.isFinite();
    };
    /**
     * If the point is inside the bounds, the point will be returned. Otherwise, this will return a new point
     * on the edge of the bounds that is the closest to the provided point.
     */
    Bounds2.prototype.closestPointTo = function (point) {
        if (this.containsCoordinates(point.x, point.y)) {
            return point;
        }
        else {
            return this.getConstrainedPoint(point);
        }
    };
    /**
     * Find the point on the boundary of the Bounds2 that is closest to the provided point.
     */
    Bounds2.prototype.closestBoundaryPointTo = function (point) {
        if (this.containsCoordinates(point.x, point.y)) {
            var closestXEdge = point.x < this.centerX ? this.minX : this.maxX;
            var closestYEdge = point.y < this.centerY ? this.minY : this.maxY;
            // Decide which cardinal direction to go based on simple distance.
            if (Math.abs(closestXEdge - point.x) < Math.abs(closestYEdge - point.y)) {
                return new Vector2_js_1.default(closestXEdge, point.y);
            }
            else {
                return new Vector2_js_1.default(point.x, closestYEdge);
            }
        }
        else {
            return this.getConstrainedPoint(point);
        }
    };
    /**
     * Give a point outside of this Bounds2, constrain it to a point on the boundary of this Bounds2.
     */
    Bounds2.prototype.getConstrainedPoint = function (point) {
        var xConstrained = Math.max(Math.min(point.x, this.maxX), this.x);
        var yConstrained = Math.max(Math.min(point.y, this.maxY), this.y);
        return new Vector2_js_1.default(xConstrained, yConstrained);
    };
    /**
     * Whether the coordinates are contained inside the bounding box, or are on the boundary.
     *
     * @param x - X coordinate of the point to check
     * @param y - Y coordinate of the point to check
     */
    Bounds2.prototype.containsCoordinates = function (x, y) {
        return this.minX <= x && x <= this.maxX && this.minY <= y && y <= this.maxY;
    };
    /**
     * Whether the point is contained inside the bounding box, or is on the boundary.
     */
    Bounds2.prototype.containsPoint = function (point) {
        return this.containsCoordinates(point.x, point.y);
    };
    /**
     * Whether this bounding box completely contains the bounding box passed as a parameter. The boundary of a box is
     * considered to be "contained".
     */
    Bounds2.prototype.containsBounds = function (bounds) {
        return this.minX <= bounds.minX && this.maxX >= bounds.maxX && this.minY <= bounds.minY && this.maxY >= bounds.maxY;
    };
    /**
     * Whether this and another bounding box have any points of intersection (including touching boundaries).
     */
    Bounds2.prototype.intersectsBounds = function (bounds) {
        var minX = Math.max(this.minX, bounds.minX);
        var minY = Math.max(this.minY, bounds.minY);
        var maxX = Math.min(this.maxX, bounds.maxX);
        var maxY = Math.min(this.maxY, bounds.maxY);
        return (maxX - minX) >= 0 && (maxY - minY >= 0);
    };
    /**
     * The squared distance from the input point to the point closest to it inside the bounding box.
     */
    Bounds2.prototype.minimumDistanceToPointSquared = function (point) {
        var closeX = point.x < this.minX ? this.minX : (point.x > this.maxX ? this.maxX : null);
        var closeY = point.y < this.minY ? this.minY : (point.y > this.maxY ? this.maxY : null);
        var d;
        if (closeX === null && closeY === null) {
            // inside, or on the boundary
            return 0;
        }
        else if (closeX === null) {
            // vertically directly above/below
            d = closeY - point.y;
            return d * d;
        }
        else if (closeY === null) {
            // horizontally directly to the left/right
            d = closeX - point.x;
            return d * d;
        }
        else {
            // corner case
            var dx = closeX - point.x;
            var dy = closeY - point.y;
            return dx * dx + dy * dy;
        }
    };
    /**
     * The squared distance from the input point to the point furthest from it inside the bounding box.
     */
    Bounds2.prototype.maximumDistanceToPointSquared = function (point) {
        var x = point.x > this.getCenterX() ? this.minX : this.maxX;
        var y = point.y > this.getCenterY() ? this.minY : this.maxY;
        x -= point.x;
        y -= point.y;
        return x * x + y * y;
    };
    /**
     * Debugging string for the bounds.
     */
    Bounds2.prototype.toString = function () {
        return "[x:(".concat(this.minX, ",").concat(this.maxX, "),y:(").concat(this.minY, ",").concat(this.maxY, ")]");
    };
    /**
     * Exact equality comparison between this bounds and another bounds.
     *
     * @returns - Whether the two bounds are equal
     */
    Bounds2.prototype.equals = function (other) {
        return this.minX === other.minX && this.minY === other.minY && this.maxX === other.maxX && this.maxY === other.maxY;
    };
    /**
     * Approximate equality comparison between this bounds and another bounds.
     *
     * @returns - Whether difference between the two bounds has no min/max with an absolute value greater
     *            than epsilon.
     */
    Bounds2.prototype.equalsEpsilon = function (other, epsilon) {
        epsilon = epsilon !== undefined ? epsilon : 0;
        var thisFinite = this.isFinite();
        var otherFinite = other.isFinite();
        if (thisFinite && otherFinite) {
            // both are finite, so we can use Math.abs() - it would fail with non-finite values like Infinity
            return Math.abs(this.minX - other.minX) < epsilon &&
                Math.abs(this.minY - other.minY) < epsilon &&
                Math.abs(this.maxX - other.maxX) < epsilon &&
                Math.abs(this.maxY - other.maxY) < epsilon;
        }
        else if (thisFinite !== otherFinite) {
            return false; // one is finite, the other is not. definitely not equal
        }
        else if (this === other) {
            return true; // exact same instance, must be equal
        }
        else {
            // epsilon only applies on finite dimensions. due to JS's handling of isFinite(), it's faster to check the sum of both
            return (isFinite(this.minX + other.minX) ? (Math.abs(this.minX - other.minX) < epsilon) : (this.minX === other.minX)) &&
                (isFinite(this.minY + other.minY) ? (Math.abs(this.minY - other.minY) < epsilon) : (this.minY === other.minY)) &&
                (isFinite(this.maxX + other.maxX) ? (Math.abs(this.maxX - other.maxX) < epsilon) : (this.maxX === other.maxX)) &&
                (isFinite(this.maxY + other.maxY) ? (Math.abs(this.maxY - other.maxY) < epsilon) : (this.maxY === other.maxY));
        }
    };
    /*---------------------------------------------------------------------------*
     * Immutable operations
     *---------------------------------------------------------------------------*/
    /**
     * Creates a copy of this bounds, or if a bounds is passed in, set that bounds's values to ours.
     *
     * This is the immutable form of the function set(), if a bounds is provided. This will return a new bounds, and
     * will not modify this bounds.
     *
     * @param [bounds] - If not provided, creates a new Bounds2 with filled in values. Otherwise, fills in the
     *                   values of the provided bounds so that it equals this bounds.
     */
    Bounds2.prototype.copy = function (bounds) {
        if (bounds) {
            return bounds.set(this);
        }
        else {
            return b2(this.minX, this.minY, this.maxX, this.maxY);
        }
    };
    /**
     * Static factory method
     */
    Bounds2.create = function (bounds) {
        return b2(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    };
    /**
     * The smallest bounds that contains both this bounds and the input bounds, returned as a copy.
     *
     * This is the immutable form of the function includeBounds(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.union = function (bounds) {
        return b2(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY));
    };
    /**
     * The smallest bounds that is contained by both this bounds and the input bounds, returned as a copy.
     *
     * This is the immutable form of the function constrainBounds(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.intersection = function (bounds) {
        return b2(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY));
    };
    // TODO: difference should be well-defined, but more logic is needed to compute https://github.com/phetsims/dot/issues/96
    /**
     * The smallest bounds that contains this bounds and the point (x,y), returned as a copy.
     *
     * This is the immutable form of the function addCoordinates(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withCoordinates = function (x, y) {
        return b2(Math.min(this.minX, x), Math.min(this.minY, y), Math.max(this.maxX, x), Math.max(this.maxY, y));
    };
    /**
     * The smallest bounds that contains this bounds and the input point, returned as a copy.
     *
     * This is the immutable form of the function addPoint(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withPoint = function (point) {
        return this.withCoordinates(point.x, point.y);
    };
    /**
     * Returns the smallest bounds that contains both this bounds and the x value provided.
     *
     * This is the immutable form of the function addX(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withX = function (x) {
        return this.copy().addX(x);
    };
    /**
     * Returns the smallest bounds that contains both this bounds and the y value provided.
     *
     * This is the immutable form of the function addY(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withY = function (y) {
        return this.copy().addY(y);
    };
    /**
     * A copy of this bounds, with minX replaced with the input.
     *
     * This is the immutable form of the function setMinX(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withMinX = function (minX) {
        return b2(minX, this.minY, this.maxX, this.maxY);
    };
    /**
     * A copy of this bounds, with minY replaced with the input.
     *
     * This is the immutable form of the function setMinY(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withMinY = function (minY) {
        return b2(this.minX, minY, this.maxX, this.maxY);
    };
    /**
     * A copy of this bounds, with maxX replaced with the input.
     *
     * This is the immutable form of the function setMaxX(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withMaxX = function (maxX) {
        return b2(this.minX, this.minY, maxX, this.maxY);
    };
    /**
     * A copy of this bounds, with maxY replaced with the input.
     *
     * This is the immutable form of the function setMaxY(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.withMaxY = function (maxY) {
        return b2(this.minX, this.minY, this.maxX, maxY);
    };
    /**
     * A copy of this bounds, with the minimum values rounded down to the nearest integer, and the maximum values
     * rounded up to the nearest integer. This causes the bounds to expand as necessary so that its boundaries
     * are integer-aligned.
     *
     * This is the immutable form of the function roundOut(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.roundedOut = function () {
        return b2(Math.floor(this.minX), Math.floor(this.minY), Math.ceil(this.maxX), Math.ceil(this.maxY));
    };
    /**
     * A copy of this bounds, with the minimum values rounded up to the nearest integer, and the maximum values
     * rounded down to the nearest integer. This causes the bounds to contract as necessary so that its boundaries
     * are integer-aligned.
     *
     * This is the immutable form of the function roundIn(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.roundedIn = function () {
        return b2(Math.ceil(this.minX), Math.ceil(this.minY), Math.floor(this.maxX), Math.floor(this.maxY));
    };
    /**
     * A bounding box (still axis-aligned) that contains the transformed shape of this bounds, applying the matrix as
     * an affine transformation.
     *
     * NOTE: bounds.transformed( matrix ).transformed( inverse ) may be larger than the original box, if it includes
     * a rotation that isn't a multiple of $\pi/2$. This is because the returned bounds may expand in area to cover
     * ALL of the corners of the transformed bounding box.
     *
     * This is the immutable form of the function transform(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.transformed = function (matrix) {
        return this.copy().transform(matrix);
    };
    /**
     * A bounding box that is expanded on all sides by the specified amount.)
     *
     * This is the immutable form of the function dilate(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.dilated = function (d) {
        return this.dilatedXY(d, d);
    };
    /**
     * A bounding box that is expanded horizontally (on the left and right) by the specified amount.
     *
     * This is the immutable form of the function dilateX(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.dilatedX = function (x) {
        return b2(this.minX - x, this.minY, this.maxX + x, this.maxY);
    };
    /**
     * A bounding box that is expanded vertically (on the top and bottom) by the specified amount.
     *
     * This is the immutable form of the function dilateY(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.dilatedY = function (y) {
        return b2(this.minX, this.minY - y, this.maxX, this.maxY + y);
    };
    /**
     * A bounding box that is expanded on all sides, with different amounts of expansion horizontally and vertically.
     * Will be identical to the bounds returned by calling bounds.dilatedX( x ).dilatedY( y ).
     *
     * This is the immutable form of the function dilateXY(). This will return a new bounds, and will not modify
     * this bounds.
     *
     * @param x - Amount to dilate horizontally (for each side)
     * @param y - Amount to dilate vertically (for each side)
     */
    Bounds2.prototype.dilatedXY = function (x, y) {
        return b2(this.minX - x, this.minY - y, this.maxX + x, this.maxY + y);
    };
    /**
     * A bounding box that is contracted on all sides by the specified amount.
     *
     * This is the immutable form of the function erode(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.eroded = function (amount) { return this.dilated(-amount); };
    /**
     * A bounding box that is contracted horizontally (on the left and right) by the specified amount.
     *
     * This is the immutable form of the function erodeX(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.erodedX = function (x) { return this.dilatedX(-x); };
    /**
     * A bounding box that is contracted vertically (on the top and bottom) by the specified amount.
     *
     * This is the immutable form of the function erodeY(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.erodedY = function (y) { return this.dilatedY(-y); };
    /**
     * A bounding box that is contracted on all sides, with different amounts of contraction horizontally and vertically.
     *
     * This is the immutable form of the function erodeXY(). This will return a new bounds, and will not modify
     * this bounds.
     *
     * @param x - Amount to erode horizontally (for each side)
     * @param y - Amount to erode vertically (for each side)
     */
    Bounds2.prototype.erodedXY = function (x, y) { return this.dilatedXY(-x, -y); };
    /**
     * A bounding box that is expanded by a specific amount on all sides (or if some offsets are negative, will contract
     * those sides).
     *
     * This is the immutable form of the function offset(). This will return a new bounds, and will not modify
     * this bounds.
     *
     * @param left - Amount to expand to the left (subtracts from minX)
     * @param top - Amount to expand to the top (subtracts from minY)
     * @param right - Amount to expand to the right (adds to maxX)
     * @param bottom - Amount to expand to the bottom (adds to maxY)
     */
    Bounds2.prototype.withOffsets = function (left, top, right, bottom) {
        return b2(this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom);
    };
    /**
     * Our bounds, translated horizontally by x, returned as a copy.
     *
     * This is the immutable form of the function shiftX(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.shiftedX = function (x) {
        return b2(this.minX + x, this.minY, this.maxX + x, this.maxY);
    };
    /**
     * Our bounds, translated vertically by y, returned as a copy.
     *
     * This is the immutable form of the function shiftY(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.shiftedY = function (y) {
        return b2(this.minX, this.minY + y, this.maxX, this.maxY + y);
    };
    /**
     * Our bounds, translated by (x,y), returned as a copy.
     *
     * This is the immutable form of the function shift(). This will return a new bounds, and will not modify
     * this bounds.
     */
    Bounds2.prototype.shiftedXY = function (x, y) {
        return b2(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
    };
    /**
     * Returns our bounds, translated by a vector, returned as a copy.
     */
    Bounds2.prototype.shifted = function (v) {
        return this.shiftedXY(v.x, v.y);
    };
    /**
     * Returns an interpolated value of this bounds and the argument.
     *
     * @param bounds
     * @param ratio - 0 will result in a copy of `this`, 1 will result in bounds, and in-between controls the
     *                         amount of each.
     */
    Bounds2.prototype.blend = function (bounds, ratio) {
        var t = 1 - ratio;
        return b2(t * this.minX + ratio * bounds.minX, t * this.minY + ratio * bounds.minY, t * this.maxX + ratio * bounds.maxX, t * this.maxY + ratio * bounds.maxY);
    };
    /*---------------------------------------------------------------------------*
     * Mutable operations
     *
     * All mutable operations should call one of the following:
     *   setMinMax, setMinX, setMinY, setMaxX, setMaxY
     *---------------------------------------------------------------------------*/
    /**
     * Sets each value for this bounds, and returns itself.
     */
    Bounds2.prototype.setMinMax = function (minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
        return this;
    };
    /**
     * Sets the value of minX.
     *
     * This is the mutable form of the function withMinX(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.setMinX = function (minX) {
        this.minX = minX;
        return this;
    };
    /**
     * Sets the value of minY.
     *
     * This is the mutable form of the function withMinY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.setMinY = function (minY) {
        this.minY = minY;
        return this;
    };
    /**
     * Sets the value of maxX.
     *
     * This is the mutable form of the function withMaxX(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.setMaxX = function (maxX) {
        this.maxX = maxX;
        return this;
    };
    /**
     * Sets the value of maxY.
     *
     * This is the mutable form of the function withMaxY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.setMaxY = function (maxY) {
        this.maxY = maxY;
        return this;
    };
    /**
     * Sets the values of this bounds to be equal to the input bounds.
     *
     * This is the mutable form of the function copy(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.set = function (bounds) {
        return this.setMinMax(bounds.minX, bounds.minY, bounds.maxX, bounds.maxY);
    };
    /**
     * Modifies this bounds so that it contains both its original bounds and the input bounds.
     *
     * This is the mutable form of the function union(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.includeBounds = function (bounds) {
        return this.setMinMax(Math.min(this.minX, bounds.minX), Math.min(this.minY, bounds.minY), Math.max(this.maxX, bounds.maxX), Math.max(this.maxY, bounds.maxY));
    };
    /**
     * Modifies this bounds so that it is the largest bounds contained both in its original bounds and in the input bounds.
     *
     * This is the mutable form of the function intersection(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.constrainBounds = function (bounds) {
        return this.setMinMax(Math.max(this.minX, bounds.minX), Math.max(this.minY, bounds.minY), Math.min(this.maxX, bounds.maxX), Math.min(this.maxY, bounds.maxY));
    };
    /**
     * Modifies this bounds so that it contains both its original bounds and the input point (x,y).
     *
     * This is the mutable form of the function withCoordinates(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.addCoordinates = function (x, y) {
        return this.setMinMax(Math.min(this.minX, x), Math.min(this.minY, y), Math.max(this.maxX, x), Math.max(this.maxY, y));
    };
    /**
     * Modifies this bounds so that it contains both its original bounds and the input point.
     *
     * This is the mutable form of the function withPoint(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.addPoint = function (point) {
        return this.addCoordinates(point.x, point.y);
    };
    /**
     * Modifies this bounds so that it is guaranteed to include the given x value (if it didn't already). If the x value
     * was already contained, nothing will be done.
     *
     * This is the mutable form of the function withX(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.addX = function (x) {
        this.minX = Math.min(x, this.minX);
        this.maxX = Math.max(x, this.maxX);
        return this;
    };
    /**
     * Modifies this bounds so that it is guaranteed to include the given y value (if it didn't already). If the y value
     * was already contained, nothing will be done.
     *
     * This is the mutable form of the function withY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.addY = function (y) {
        this.minY = Math.min(y, this.minY);
        this.maxY = Math.max(y, this.maxY);
        return this;
    };
    /**
     * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries down and the
     * maximum boundaries up (expanding as necessary).
     *
     * This is the mutable form of the function roundedOut(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.roundOut = function () {
        return this.setMinMax(Math.floor(this.minX), Math.floor(this.minY), Math.ceil(this.maxX), Math.ceil(this.maxY));
    };
    /**
     * Modifies this bounds so that its boundaries are integer-aligned, rounding the minimum boundaries up and the
     * maximum boundaries down (contracting as necessary).
     *
     * This is the mutable form of the function roundedIn(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.roundIn = function () {
        return this.setMinMax(Math.ceil(this.minX), Math.ceil(this.minY), Math.floor(this.maxX), Math.floor(this.maxY));
    };
    /**
     * Modifies this bounds so that it would fully contain a transformed version if its previous value, applying the
     * matrix as an affine transformation.
     *
     * NOTE: bounds.transform( matrix ).transform( inverse ) may be larger than the original box, if it includes
     * a rotation that isn't a multiple of $\pi/2$. This is because the bounds may expand in area to cover
     * ALL of the corners of the transformed bounding box.
     *
     * This is the mutable form of the function transformed(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.transform = function (matrix) {
        // if we contain no area, no change is needed
        if (this.isEmpty()) {
            return this;
        }
        // optimization to bail for identity matrices
        if (matrix.isIdentity()) {
            return this;
        }
        var minX = this.minX;
        var minY = this.minY;
        var maxX = this.maxX;
        var maxY = this.maxY;
        this.set(Bounds2.NOTHING);
        // using mutable vector so we don't create excessive instances of Vector2 during this
        // make sure all 4 corners are inside this transformed bounding box
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(minX, minY)));
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(minX, maxY)));
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(maxX, minY)));
        this.addPoint(matrix.multiplyVector2(scratchVector2.setXY(maxX, maxY)));
        return this;
    };
    /**
     * Expands this bounds on all sides by the specified amount.
     *
     * This is the mutable form of the function dilated(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.dilate = function (d) {
        return this.dilateXY(d, d);
    };
    /**
     * Expands this bounds horizontally (left and right) by the specified amount.
     *
     * This is the mutable form of the function dilatedX(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.dilateX = function (x) {
        return this.setMinMax(this.minX - x, this.minY, this.maxX + x, this.maxY);
    };
    /**
     * Expands this bounds vertically (top and bottom) by the specified amount.
     *
     * This is the mutable form of the function dilatedY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.dilateY = function (y) {
        return this.setMinMax(this.minX, this.minY - y, this.maxX, this.maxY + y);
    };
    /**
     * Expands this bounds independently in the horizontal and vertical directions. Will be equal to calling
     * bounds.dilateX( x ).dilateY( y ).
     *
     * This is the mutable form of the function dilatedXY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.dilateXY = function (x, y) {
        return this.setMinMax(this.minX - x, this.minY - y, this.maxX + x, this.maxY + y);
    };
    /**
     * Contracts this bounds on all sides by the specified amount.
     *
     * This is the mutable form of the function eroded(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.erode = function (d) { return this.dilate(-d); };
    /**
     * Contracts this bounds horizontally (left and right) by the specified amount.
     *
     * This is the mutable form of the function erodedX(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.erodeX = function (x) { return this.dilateX(-x); };
    /**
     * Contracts this bounds vertically (top and bottom) by the specified amount.
     *
     * This is the mutable form of the function erodedY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.erodeY = function (y) { return this.dilateY(-y); };
    /**
     * Contracts this bounds independently in the horizontal and vertical directions. Will be equal to calling
     * bounds.erodeX( x ).erodeY( y ).
     *
     * This is the mutable form of the function erodedXY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.erodeXY = function (x, y) { return this.dilateXY(-x, -y); };
    /**
     * Expands this bounds independently for each side (or if some offsets are negative, will contract those sides).
     *
     * This is the mutable form of the function withOffsets(). This will mutate (change) this bounds, in addition to
     * returning this bounds itself.
     *
     * @param left - Amount to expand to the left (subtracts from minX)
     * @param top - Amount to expand to the top (subtracts from minY)
     * @param right - Amount to expand to the right (adds to maxX)
     * @param bottom - Amount to expand to the bottom (adds to maxY)
     */
    Bounds2.prototype.offset = function (left, top, right, bottom) {
        return b2(this.minX - left, this.minY - top, this.maxX + right, this.maxY + bottom);
    };
    /**
     * Translates our bounds horizontally by x.
     *
     * This is the mutable form of the function shiftedX(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.shiftX = function (x) {
        return this.setMinMax(this.minX + x, this.minY, this.maxX + x, this.maxY);
    };
    /**
     * Translates our bounds vertically by y.
     *
     * This is the mutable form of the function shiftedY(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.shiftY = function (y) {
        return this.setMinMax(this.minX, this.minY + y, this.maxX, this.maxY + y);
    };
    /**
     * Translates our bounds by (x,y).
     *
     * This is the mutable form of the function shifted(). This will mutate (change) this bounds, in addition to returning
     * this bounds itself.
     */
    Bounds2.prototype.shiftXY = function (x, y) {
        return this.setMinMax(this.minX + x, this.minY + y, this.maxX + x, this.maxY + y);
    };
    /**
     * Translates our bounds by the given vector.
     */
    Bounds2.prototype.shift = function (v) {
        return this.shiftXY(v.x, v.y);
    };
    /**
     * Returns the range of the x-values of this bounds.
     */
    Bounds2.prototype.getXRange = function () {
        return new Range_js_1.default(this.minX, this.maxX);
    };
    /**
     * Sets the x-range of this bounds.
     */
    Bounds2.prototype.setXRange = function (range) {
        return this.setMinMax(range.min, this.minY, range.max, this.maxY);
    };
    Object.defineProperty(Bounds2.prototype, "xRange", {
        get: function () { return this.getXRange(); },
        set: function (range) { this.setXRange(range); },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the range of the y-values of this bounds.
     */
    Bounds2.prototype.getYRange = function () {
        return new Range_js_1.default(this.minY, this.maxY);
    };
    /**
     * Sets the y-range of this bounds.
     */
    Bounds2.prototype.setYRange = function (range) {
        return this.setMinMax(this.minX, range.min, this.maxX, range.max);
    };
    Object.defineProperty(Bounds2.prototype, "yRange", {
        get: function () { return this.getYRange(); },
        set: function (range) { this.setYRange(range); },
        enumerable: false,
        configurable: true
    });
    /**
     * Find a point in the bounds closest to the specified point.
     *
     * @param x - X coordinate of the point to test.
     * @param y - Y coordinate of the point to test.
     * @param [result] - Vector2 that can store the return value to avoid allocations.
     */
    Bounds2.prototype.getClosestPoint = function (x, y, result) {
        if (result) {
            result.setXY(x, y);
        }
        else {
            result = new Vector2_js_1.default(x, y);
        }
        if (result.x < this.minX) {
            result.x = this.minX;
        }
        if (result.x > this.maxX) {
            result.x = this.maxX;
        }
        if (result.y < this.minY) {
            result.y = this.minY;
        }
        if (result.y > this.maxY) {
            result.y = this.maxY;
        }
        return result;
    };
    Bounds2.prototype.freeToPool = function () {
        Bounds2.pool.freeToPool(this);
    };
    /**
     * Returns a new Bounds2 object, with the familiar rectangle construction with x, y, width, and height.
     *
     * @param x - The minimum value of X for the bounds.
     * @param y - The minimum value of Y for the bounds.
     * @param width - The width (maxX - minX) of the bounds.
     * @param height - The height (maxY - minY) of the bounds.
     */
    Bounds2.rect = function (x, y, width, height) {
        return b2(x, y, x + width, y + height);
    };
    /**
     * Returns a new Bounds2 object with a given orientation (min/max specified for both the given (primary) orientation,
     * and also the secondary orientation).
     */
    Bounds2.oriented = function (orientation, minPrimary, minSecondary, maxPrimary, maxSecondary) {
        return orientation === Orientation_js_1.default.HORIZONTAL ? new Bounds2(minPrimary, minSecondary, maxPrimary, maxSecondary) : new Bounds2(minSecondary, minPrimary, maxSecondary, maxPrimary);
    };
    Bounds2.point = function (x, y) {
        if (x instanceof Vector2_js_1.default) {
            var p = x;
            return b2(p.x, p.y, p.x, p.y);
        }
        else {
            return b2(x, y, x, y);
        }
    };
    Bounds2.pool = new Pool_js_1.default(Bounds2, {
        maxSize: 1000,
        initialize: Bounds2.prototype.setMinMax,
        defaultArguments: [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
    });
    /**
     * A constant Bounds2 with minimums = $\infty$, maximums = $-\infty$, so that it represents "no bounds whatsoever".
     *
     * This allows us to take the union (union/includeBounds) of this and any other Bounds2 to get the other bounds back,
     * e.g. Bounds2.NOTHING.union( bounds ).equals( bounds ). This object naturally serves as the base case as a union of
     * zero bounds objects.
     *
     * Additionally, intersections with NOTHING will always return a Bounds2 equivalent to NOTHING.
     */
    Bounds2.NOTHING = new Bounds2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    /**
     * A constant Bounds2 with minimums = $-\infty$, maximums = $\infty$, so that it represents "all bounds".
     *
     * This allows us to take the intersection (intersection/constrainBounds) of this and any other Bounds2 to get the
     * other bounds back, e.g. Bounds2.EVERYTHING.intersection( bounds ).equals( bounds ). This object naturally serves as
     * the base case as an intersection of zero bounds objects.
     *
     * Additionally, unions with EVERYTHING will always return a Bounds2 equivalent to EVERYTHING.
     */
    Bounds2.EVERYTHING = new Bounds2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    Bounds2.Bounds2IO = new IOType_js_1.default('Bounds2IO', {
        valueType: Bounds2,
        documentation: 'a 2-dimensional bounds rectangle',
        toStateObject: function (bounds2) { return ({ minX: bounds2.minX, minY: bounds2.minY, maxX: bounds2.maxX, maxY: bounds2.maxY }); },
        fromStateObject: function (stateObject) {
            return new Bounds2(InfiniteNumberIO_js_1.default.fromStateObject(stateObject.minX), InfiniteNumberIO_js_1.default.fromStateObject(stateObject.minY), InfiniteNumberIO_js_1.default.fromStateObject(stateObject.maxX), InfiniteNumberIO_js_1.default.fromStateObject(stateObject.maxY));
        },
        stateSchema: {
            minX: InfiniteNumberIO_js_1.default,
            maxX: InfiniteNumberIO_js_1.default,
            minY: InfiniteNumberIO_js_1.default,
            maxY: InfiniteNumberIO_js_1.default
        }
    });
    return Bounds2;
}());
exports.default = Bounds2;
dot_js_1.default.register('Bounds2', Bounds2);
var b2 = Bounds2.pool.create.bind(Bounds2.pool);
dot_js_1.default.register('b2', b2);
Bounds2.prototype.isBounds = true;
Bounds2.prototype.dimension = 2;
function catchImmutableSetterLowHangingFruit(bounds) {
    bounds.setMinMax = function () { throw new Error('Attempt to set "setMinMax" of an immutable Bounds2 object'); };
    bounds.set = function () { throw new Error('Attempt to set "set" of an immutable Bounds2 object'); };
    bounds.includeBounds = function () { throw new Error('Attempt to set "includeBounds" of an immutable Bounds2 object'); };
    bounds.constrainBounds = function () { throw new Error('Attempt to set "constrainBounds" of an immutable Bounds2 object'); };
    bounds.addCoordinates = function () { throw new Error('Attempt to set "addCoordinates" of an immutable Bounds2 object'); };
    bounds.transform = function () { throw new Error('Attempt to set "transform" of an immutable Bounds2 object'); };
}
if (assert) {
    catchImmutableSetterLowHangingFruit(Bounds2.EVERYTHING);
    catchImmutableSetterLowHangingFruit(Bounds2.NOTHING);
}
