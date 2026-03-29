"use strict";
// Copyright 2020-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Constants used in PhET-iO. Defined in the tandem repo since they need to be accessed in non-private code, like
 * IOType.ObjectIO.
 * @author Sam Reid (PhET Interactive Simulations)
 */
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var PhetioConstants = {
    // Suffix that is required for all IOType class names
    IO_TYPE_SUFFIX: 'IO'
};
tandemNamespace_js_1.default.register('PhetioConstants', PhetioConstants);
exports.default = PhetioConstants;
