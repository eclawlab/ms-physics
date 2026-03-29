"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Utility functions for working with Fluent strings.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var TReadOnlyProperty_js_1 = require("../../../axon/js/TReadOnlyProperty.js");
var FluentUtils = {
    /**
     * Changes a set of arguments for the message into a set of values that can easily be used to
     * format the message. Does things like get Property values and converts enumeration values to strings.
     */
    handleFluentArgs: function (args) {
        return _.mapValues(args, function (value) {
            return (0, TReadOnlyProperty_js_1.isTReadOnlyProperty)(value) ? value.value : value;
        });
    },
    /**
     * Directly format a fluent message. Usually, you should use a PatternMessageProperty instead so that
     * the string will update when the locale changes. This is useful when you do not want the overhead of
     * creating a new Property. For example, real-time alerts.
     */
    formatMessage: function (localizedMessageProperty, args) {
        var newArgs = FluentUtils.handleFluentArgs(args);
        var errors = [];
        var bundle = localizedMessageProperty.bundleProperty.value;
        assert && assert(bundle, 'Fluent bundle is not available.');
        var messageValue = localizedMessageProperty.value;
        assert && assert(messageValue, 'Fluent message is undefined.');
        var value = bundle.formatPattern(messageValue, newArgs, errors);
        assert && assert(errors.length === 0, "Fluent errors found when formatting message: ".concat(errors));
        return value;
    },
    formatMessageWithBundle: function (message, bundle, args) {
        var newArgs = FluentUtils.handleFluentArgs(args);
        var errors = [];
        var value = bundle.formatPattern(message, newArgs, errors);
        assert && assert(errors.length === 0, "Fluent errors found when formatting message: ".concat(errors));
        return value;
    },
    /**
     * For our "simple" fluent messages with no arguments, they are essentially just
     * string properties, so we can treat them as such.
     */
    asStringProperty: function (localizedMessageProperty) {
        assert && assert(typeof localizedMessageProperty.value === 'string');
        return localizedMessageProperty;
    }
};
exports.default = FluentUtils;
