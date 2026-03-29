"use strict";
// Copyright 2018-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * PhET-iO Type for JS's built-in Array type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
var Validation_js_1 = require("../../../axon/js/Validation.js");
var IOTypeCache_js_1 = require("../IOTypeCache.js");
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
// Cache each parameterized IOType so that it is only created once.
var cache = new IOTypeCache_js_1.default();
/**
 * Parametric IOType constructor.  Given an element type, this function returns an appropriate array IOType.
 * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
 */
var ArrayIO = function (parameterType) {
    assert && assert(!!parameterType, 'parameterType should be defined');
    if (!cache.has(parameterType)) {
        cache.set(parameterType, new IOType_js_1.default("ArrayIO<".concat(parameterType.typeName, ">"), {
            valueType: Array,
            isValidValue: function (array) {
                return _.every(array, function (element) { return Validation_js_1.default.isValueValid(element, parameterType.validator); });
            },
            parameterTypes: [parameterType],
            toStateObject: function (array) { return array.map(function (x) { return parameterType.toStateObject(x); }); },
            fromStateObject: function (stateObject) { return stateObject.map(function (x) { return parameterType.fromStateObject(x); }); },
            documentation: 'PhET-iO Type for the built-in JS array type, with the element type specified.',
            stateSchema: StateSchema_js_1.default.asValue("Array<".concat(parameterType.typeName, ">"), {
                isValidValue: function (array) { return _.every(array, function (element) { return parameterType.isStateObjectValid(element); }); }
            })
        }));
    }
    return cache.get(parameterType);
};
tandemNamespace_js_1.default.register('ArrayIO', ArrayIO);
exports.default = ArrayIO;
