"use strict";
// Copyright 2018-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * PhET-iO Type for JS's built-in number type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
var NumberIO = new IOType_js_1.default('NumberIO', {
    valueType: 'number',
    documentation: 'PhET-iO Type for Javascript\'s number primitive type',
    toStateObject: _.identity,
    fromStateObject: function (stateObject) { return stateObject; },
    stateSchema: StateSchema_js_1.default.asValue('number', {
        isValidValue: function (value) { return (typeof value === 'number' && !isNaN(value) && value !== Number.POSITIVE_INFINITY && value !== Number.NEGATIVE_INFINITY); }
    })
});
tandemNamespace_js_1.default.register('NumberIO', NumberIO);
exports.default = NumberIO;
