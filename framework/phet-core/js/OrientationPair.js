"use strict";
// Copyright 2021-2026, University of Colorado Boulder
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
 * An object that contains a value for each item in an enumeration.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var EnumerationMap_js_1 = require("./EnumerationMap.js");
var Orientation_js_1 = require("./Orientation.js");
var phetCore_js_1 = require("./phetCore.js");
var OrientationPair = /** @class */ (function (_super) {
    __extends(OrientationPair, _super);
    /**
     * @param horizontal - Value for the horizontal orientation
     * @param vertical - Value for the vertical orientation
     */
    function OrientationPair(horizontal, vertical) {
        return _super.call(this, Orientation_js_1.default, function (orientation) { return orientation === Orientation_js_1.default.HORIZONTAL ? horizontal : vertical; }) || this;
    }
    Object.defineProperty(OrientationPair.prototype, "horizontal", {
        get: function () {
            return this.get(Orientation_js_1.default.HORIZONTAL);
        },
        set: function (value) {
            this.set(Orientation_js_1.default.HORIZONTAL, value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(OrientationPair.prototype, "vertical", {
        get: function () {
            return this.get(Orientation_js_1.default.VERTICAL);
        },
        set: function (value) {
            this.set(Orientation_js_1.default.VERTICAL, value);
        },
        enumerable: false,
        configurable: true
    });
    OrientationPair.prototype.with = function (orientation, value) {
        return new OrientationPair(orientation === Orientation_js_1.default.HORIZONTAL ? value : this.horizontal, orientation === Orientation_js_1.default.VERTICAL ? value : this.vertical);
    };
    /**
     * Creates an orientation pair based on a factory method.
     *
     * @param factory - called once for each orientation to determine
     *                             the value.
     */
    OrientationPair.create = function (factory) {
        return new OrientationPair(factory(Orientation_js_1.default.HORIZONTAL), factory(Orientation_js_1.default.VERTICAL));
    };
    /**
     * Returns a new EnumerationMap with mapped values.
     *
     * @param mapFunction - function( {*}, {TEnumeration.*} ): {*}
     * @returns With the mapped values
     */
    OrientationPair.prototype.map = function (mapFunction) {
        return new OrientationPair(mapFunction(this.horizontal, Orientation_js_1.default.HORIZONTAL), mapFunction(this.vertical, Orientation_js_1.default.VERTICAL));
    };
    return OrientationPair;
}(EnumerationMap_js_1.default));
phetCore_js_1.default.register('OrientationPair', OrientationPair);
exports.default = OrientationPair;
