"use strict";
// Copyright 2018-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Parametric IOType that adds support for null values in toStateObject/fromStateObject. This type is to
 * prevent the propagation of null handling, mainly in to/fromStateObject, in each type. This also makes null
 * explicit for phet-io.
 *
 * Sample usage:
 *
 *  this.ageProperty = new Property( null, {
 *    tandem: tandem.createTandem( 'ageProperty' ),
 *    phetioValueType: NullableIO( NumberIO ) // signifies that the Property can be Number or null
 * } );
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var Validation_js_1 = require("../../../axon/js/Validation.js");
var IOTypeCache_js_1 = require("../IOTypeCache.js");
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
// Cache each parameterized IOType so that it is only created once
var cache = new IOTypeCache_js_1.default();
var NullableIO = function (parameterType) {
    assert && assert(parameterType, 'NullableIO needs parameterType');
    if (!cache.has(parameterType)) {
        cache.set(parameterType, new IOType_js_1.default("NullableIO<".concat(parameterType.typeName, ">"), {
            documentation: 'A PhET-iO Type adding support for null in addition to the behavior of its parameter.',
            isValidValue: function (instance) { return instance === null || Validation_js_1.default.isValueValid(instance, parameterType.validator); },
            parameterTypes: [parameterType],
            // If the argument is null, returns null. Otherwise, converts the instance to a state object for serialization.
            toStateObject: function (instance) { return instance === null ? null : parameterType.toStateObject(instance); },
            // If the argument is null, returns null. Otherwise, converts a state object to an instance of the underlying type.
            fromStateObject: function (stateObject) { return stateObject === null ? null : parameterType.fromStateObject(stateObject); },
            stateSchema: StateSchema_js_1.default.asValue("null|<".concat(parameterType.typeName, ">"), {
                isValidValue: function (value) { return value === null || parameterType.isStateObjectValid(value); }
            })
        }));
    }
    return cache.get(parameterType);
};
tandemNamespace_js_1.default.register('NullableIO', NullableIO);
exports.default = NullableIO;
