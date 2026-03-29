"use strict";
// Copyright 2018-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * PhET-iO Type for JS's built-in string type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
var ValueIO_js_1 = require("./ValueIO.js");
var StringIO = new IOType_js_1.default('StringIO', {
    supertype: ValueIO_js_1.default,
    valueType: 'string',
    documentation: 'PhET-iO Type for Javascript\'s string primitive type',
    stateSchema: StateSchema_js_1.default.asValue('string', { valueType: 'string' }),
    toStateObject: _.identity
});
tandemNamespace_js_1.default.register('StringIO', StringIO);
exports.default = StringIO;
