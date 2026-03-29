"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.fluentPatternFromStringProperty = exports.fluentConstantFromStringProperty = void 0;
var FluentContainer_js_1 = require("./FluentContainer.js");
var FluentConstant_js_1 = require("./FluentConstant.js");
var FluentPattern_js_1 = require("./FluentPattern.js");
var fluentConstantFromStringProperty = function (targetProperty, stringProperties, primaryFluentKey, fluentKeyMap // map of string Property to fluent key (e.g. dots turned to underscores)
) {
    var fluentContainer = new FluentContainer_js_1.default(function () {
        return stringProperties.map(function (stringProperty) {
            return "".concat(fluentKeyMap.get(stringProperty), " = ").concat(stringProperty.value.replace('\n', '\n '), "\n");
        }).join('\n');
    }, stringProperties);
    return new FluentConstant_js_1.default(fluentContainer.bundleProperty, primaryFluentKey, targetProperty);
};
exports.fluentConstantFromStringProperty = fluentConstantFromStringProperty;
var fluentPatternFromStringProperty = function (targetProperty, stringProperties, primaryFluentKey, fluentKeyMap, // map of string Property to fluent key (e.g. dots turned to underscores)
args) {
    var fluentContainer = new FluentContainer_js_1.default(function () {
        return stringProperties.map(function (stringProperty) {
            return "".concat(fluentKeyMap.get(stringProperty), " = ").concat(stringProperty.value.replace('\n', '\n '), "\n");
        }).join('\n');
    }, stringProperties);
    return new FluentPattern_js_1.default(fluentContainer.bundleProperty, primaryFluentKey, targetProperty, args);
};
exports.fluentPatternFromStringProperty = fluentPatternFromStringProperty;
