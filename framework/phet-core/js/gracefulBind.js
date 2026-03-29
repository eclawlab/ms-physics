"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Support gracefully binding a global function to itself. Returns null if the global doesn't exist.
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
/**
 * If the path exists on the window global, return it as a bound function, otherwise returns null
 * @param path a path to a method, dot-separated, including the method, such as 'phet.joist.sim.showPopup'
 */
var gracefulBind = function (path) {
    (0, affirm_js_1.default)(path.split('.').length > 1, 'path must have multiple parts');
    (0, affirm_js_1.default)(path.trim() === path, 'path must be trimmed');
    var terms = path.split('.');
    var method = terms.pop(); // mutates terms to become the method container
    var object = lodash_js_1.default.get(window, terms);
    return object ? object[method].bind(object) : null;
};
phetCore_js_1.default.register('gracefulBind', gracefulBind);
exports.default = gracefulBind;
