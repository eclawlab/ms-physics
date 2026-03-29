"use strict";
// Copyright 2018-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * PhET-iO Type for JS's built-in boolean type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
var ValueIO_js_1 = require("./ValueIO.js");
var BooleanIO = new IOType_js_1.default('BooleanIO', {
    supertype: ValueIO_js_1.default,
    valueType: 'boolean',
    documentation: 'PhET-iO Type for Javascript\'s boolean primitive type',
    stateSchema: StateSchema_js_1.default.asValue('boolean', { valueType: 'boolean' }),
    toStateObject: _.identity
});
tandemNamespace_js_1.default.register('BooleanIO', BooleanIO);
exports.default = BooleanIO;
