"use strict";
// Copyright 2022-2026, University of Colorado Boulder
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
 * Adds initial value and reset, and a mutable interface.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var axon_js_1 = require("./axon.js");
var ReadOnlyProperty_js_1 = require("./ReadOnlyProperty.js");
var Property = /** @class */ (function (_super) {
    __extends(Property, _super);
    function Property(value, providedOptions) {
        var _this = _super.call(this, value, providedOptions) || this;
        _this._initialValue = value;
        return _this;
    }
    /**
     * Returns the initial value of this Property.
     */
    Property.prototype.getInitialValue = function () {
        return this._initialValue;
    };
    Object.defineProperty(Property.prototype, "initialValue", {
        get: function () {
            return this.getInitialValue();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stores the specified value as the initial value, which will be taken on reset. Sims should use this sparingly,
     * typically only in situations where the initial value is unknowable at instantiation.
     */
    Property.prototype.setInitialValue = function (initialValue) {
        this._initialValue = initialValue;
    };
    Object.defineProperty(Property.prototype, "value", {
        /**
         * Overridden to make public
         */
        get: function () {
            return _super.prototype.value;
        },
        /**
         * Overridden to make public
         * We ran performance tests on Chrome, and determined that calling super.value = newValue is statistically significantly
         * slower at the p = 0.10 level( looping over 10,000 value calls). Therefore, we prefer this optimization.
         */
        set: function (newValue) {
            _super.prototype.set.call(this, newValue);
        },
        enumerable: false,
        configurable: true
    });
    Property.prototype.reset = function () {
        this.set(this._initialValue);
    };
    /**
     * Overridden to make public
     */
    Property.prototype.set = function (value) {
        _super.prototype.set.call(this, value);
    };
    Property.prototype.isSettable = function () {
        return true;
    };
    return Property;
}(ReadOnlyProperty_js_1.default));
exports.default = Property;
axon_js_1.default.register('Property', Property);
