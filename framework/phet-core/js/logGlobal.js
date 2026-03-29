"use strict";
// Copyright 2021-2023, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Logs a global variable by converting it to JSON, then writing to phet.log. If the global is undefined,
 * the log will show 'undefined'.  This is currently used to log a collection of query parameters (which exist
 * as globals), but could be applied to other globals.  If phet.log is undefined, this is a no-op.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
var getGlobal_js_1 = require("./getGlobal.js");
var phetCore_js_1 = require("./phetCore.js");
/**
 * @param globalString - the name of the global
 */
function logGlobal(globalString) {
    phet.log && phet.log("".concat(globalString, ": ").concat(JSON.stringify((0, getGlobal_js_1.default)(globalString), null, 2)));
}
phetCore_js_1.default.register('logGlobal', logGlobal);
exports.default = logGlobal;
