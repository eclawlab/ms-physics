"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
var ValueIO_js_1 = require("./ValueIO.js");
var noExtraPrototype = function (object) { return Object.getPrototypeOf(object) === Object.prototype; };
var ObjectLiteralIO = new IOType_js_1.default('ObjectLiteralIO', {
    documentation: 'PhET-iO Type for object literals',
    isValidValue: noExtraPrototype,
    supertype: ValueIO_js_1.default,
    stateSchema: StateSchema_js_1.default.asValue('object', { valueType: Object, isValidValue: noExtraPrototype }),
    toStateObject: _.identity
});
tandemNamespace_js_1.default.register('ObjectLiteralIO', ObjectLiteralIO);
exports.default = ObjectLiteralIO;
