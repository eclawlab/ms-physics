"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Support gracefully getting a global object to itself. Returns null if the global doesn't exist.
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
/**
 * If the path exists on the window global, return it, otherwise returns null
 * @param path a path to global, such as 'phet.joist.sim'
 */
var getGlobal = function (path) {
    (0, affirm_js_1.default)(path.trim() === path, 'path must be trimmed');
    var global = lodash_js_1.default.get(window, path);
    return global !== undefined ? global : null;
};
phetCore_js_1.default.register('getGlobal', getGlobal);
exports.default = getGlobal;
