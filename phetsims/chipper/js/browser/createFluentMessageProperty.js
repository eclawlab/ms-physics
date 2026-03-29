"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createFluentMessageProperty;
/**
 * A Fluent message that updates with the FluentBundle.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var DerivedProperty_js_1 = require("../../../axon/js/DerivedProperty.js");
var TReadOnlyProperty_js_1 = require("../../../axon/js/TReadOnlyProperty.js");
var affirm_js_1 = require("../../../perennial-alias/js/browser-and-node/affirm.js");
var FluentUtils_js_1 = require("./FluentUtils.js");
function createFluentMessageProperty(bundleProperty, messageKey, values) {
    if (values === void 0) { values = {}; }
    var dependencies = [bundleProperty];
    var keys = Object.keys(values);
    keys.forEach(function (key) {
        if ((0, TReadOnlyProperty_js_1.isTReadOnlyProperty)(values[key])) {
            dependencies.push(values[key]);
        }
    });
    // @ts-expect-error This is a prototype so I am not going to worry about this complicated TS for now.
    return new DerivedProperty_js_1.default(dependencies, function (bundle) {
        var unusedValues = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            unusedValues[_i - 1] = arguments[_i];
        }
        var message = bundle.getMessage(messageKey);
        (0, affirm_js_1.default)(message, 'A message is required to format.');
        (0, affirm_js_1.default)(message.value, 'A message value is required to format.');
        return FluentUtils_js_1.default.formatMessageWithBundle(message.value, bundle, values);
    });
}
