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
 * A Property whose value is a message from a Fluent bundle with arguments. Each argument can be a Property,
 * and the message will be updated either the message or the argument changes.
 *
 * A similar idea as PatternStringProperty, but for Fluent messages.
 *
 * For values that are being used in a message with CLDR plural category, the value needs be a number.
 * Otherwise, the string will be used and always hit the "other" category.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var DerivedProperty_js_1 = require("../../../axon/js/DerivedProperty.js");
var TReadOnlyProperty_js_1 = require("../../../axon/js/TReadOnlyProperty.js");
var FluentUtils_js_1 = require("./FluentUtils.js");
var PatternMessageProperty = /** @class */ (function (_super) {
    __extends(PatternMessageProperty, _super);
    function PatternMessageProperty(messageProperty, values) {
        var dependencies = [messageProperty];
        var keys = Object.keys(values);
        keys.forEach(function (key) {
            if ((0, TReadOnlyProperty_js_1.isTReadOnlyProperty)(values[key])) {
                dependencies.push(values[key]);
            }
        });
        // @ts-expect-error This is a prototype so I am not going to worry about this complicated TS for now.
        return _super.call(this, dependencies, function (message) {
            var unusedArgs = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                unusedArgs[_i - 1] = arguments[_i];
            }
            return FluentUtils_js_1.default.formatMessage(messageProperty, values);
        }) || this;
    }
    return PatternMessageProperty;
}(DerivedProperty_js_1.DerivedProperty1));
exports.default = PatternMessageProperty;
