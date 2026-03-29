"use strict";
// Copyright 2018-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
/**
 * We sometimes use VoidIO as a workaround to indicate that an argument is passed in the simulation side, but
 * that it shouldn't be leaked to the PhET-iO client.
 */
var VoidIO = new IOType_js_1.default('VoidIO', {
    isValidValue: function () { return true; },
    documentation: 'Type for which there is no instance, usually to mark functions without a return value',
    toStateObject: function () { return undefined; }
});
tandemNamespace_js_1.default.register('VoidIO', VoidIO);
exports.default = VoidIO;
