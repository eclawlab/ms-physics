"use strict";
// Copyright 2025-2026, University of Colorado Boulder
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
 * A Property for the Fluent module that will recompute the value when the FluentBundle
 * changes. The fluent bundle is dependent on the locale, so this Property will also
 * recompute when the locale changes.
 *
 * A reference to the bundle is available so that it can be used to format the message with arguments.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var DerivedProperty_js_1 = require("../../../axon/js/DerivedProperty.js");
var LocalizedMessageProperty = /** @class */ (function (_super) {
    __extends(LocalizedMessageProperty, _super);
    function LocalizedMessageProperty(bundleProperty, derivation) {
        var _this = _super.call(this, [bundleProperty], derivation) || this;
        _this.bundleProperty = bundleProperty;
        return _this;
    }
    return LocalizedMessageProperty;
}(DerivedProperty_js_1.DerivedProperty1));
exports.default = LocalizedMessageProperty;
