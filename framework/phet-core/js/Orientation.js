"use strict";
// Copyright 2019-2026, University of Colorado Boulder
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
/**
 * Either horizontal or vertical, with helper values.  Moved from Area Model Common on Nov 7, 2019
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var Enumeration_js_1 = require("./Enumeration.js");
var EnumerationValue_js_1 = require("./EnumerationValue.js");
var phetCore_js_1 = require("./phetCore.js");
var Orientation = /** @class */ (function (_super) {
    __extends(Orientation, _super);
    function Orientation(coordinate, centerCoordinate, minCoordinate, maxCoordinate, minSide, maxSide, minSize, maxSize, rectCoordinate, rectSize, flowBoxOrientation, size, line, preferredSize, localPreferredSize, sizable, modelToView, viewToModel, toVector) {
        var _this = _super.call(this) || this;
        _this.coordinate = coordinate;
        _this.centerCoordinate = centerCoordinate;
        _this.minCoordinate = minCoordinate;
        _this.maxCoordinate = maxCoordinate;
        _this.minSide = minSide;
        _this.maxSide = maxSide;
        _this.minSize = minSize;
        _this.maxSize = maxSize;
        _this.rectCoordinate = rectCoordinate;
        _this.rectSize = rectSize;
        _this.flowBoxOrientation = flowBoxOrientation;
        _this.size = size;
        _this.line = line;
        _this.preferredSize = preferredSize;
        _this.localPreferredSize = localPreferredSize;
        _this.sizable = sizable;
        _this.ariaOrientation = flowBoxOrientation;
        _this.modelToView = modelToView;
        _this.viewToModel = viewToModel;
        _this.toVector = toVector;
        return _this;
    }
    Orientation.fromLayoutOrientation = function (layoutOrientation) {
        return layoutOrientation === 'horizontal' ? Orientation.HORIZONTAL : Orientation.VERTICAL;
    };
    Orientation.HORIZONTAL = new Orientation('x', 'centerX', 'minX', 'maxX', 'left', 'right', 'minWidth', 'maxWidth', 'rectX', 'rectWidth', 'horizontal', 'width', 'column', 'preferredWidth', 'localPreferredWidth', 'widthSizable', function (modelViewTransform, value) { return modelViewTransform.modelToViewX(value); }, function (modelViewTransform, value) { return modelViewTransform.viewToModelX(value); }, 
    // Pad with zeros to support up to Vector4
    function (a, b, VectorType) { return new VectorType(a, b, 0, 0); });
    Orientation.VERTICAL = new Orientation('y', 'centerY', 'minY', 'maxY', 'top', 'bottom', 'minHeight', 'maxHeight', 'rectY', 'rectHeight', 'vertical', 'height', 'row', 'preferredHeight', 'localPreferredHeight', 'heightSizable', function (modelViewTransform, value) { return modelViewTransform.modelToViewY(value); }, function (modelViewTransform, value) { return modelViewTransform.viewToModelY(value); }, 
    // Pad with zeros to support up to Vector4
    function (a, b, VectorType) { return new VectorType(b, a, 0, 0); });
    Orientation.enumeration = new Enumeration_js_1.default(Orientation, {
        phetioDocumentation: 'Horizontal or vertical orientation'
    });
    return Orientation;
}(EnumerationValue_js_1.default));
// Set up opposites as object references (circular)
Orientation.HORIZONTAL.opposite = Orientation.VERTICAL;
Orientation.VERTICAL.opposite = Orientation.HORIZONTAL;
phetCore_js_1.default.register('Orientation', Orientation);
exports.default = Orientation;
