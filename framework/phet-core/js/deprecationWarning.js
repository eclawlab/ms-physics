"use strict";
// Copyright 2020-2023, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Output deprecation warnings to console.warn when ?deprecationWarnings is specified
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
// contains all messages printed for deprecation warnings so that we do not print the same message multiple times
var deprecatedMessages = {};
var deprecationWarning = function (message, showDeprecationWarnings) {
    if (showDeprecationWarnings === void 0) { showDeprecationWarnings = window.phet && window.phet.chipper &&
        window.phet.chipper.queryParameters &&
        phet.chipper.queryParameters.deprecationWarnings; }
    if (showDeprecationWarnings && !deprecatedMessages.hasOwnProperty(message)) {
        deprecatedMessages[message] = true;
        console.warn("Deprecation warning: ".concat(message));
    }
};
phetCore_js_1.default.register('deprecationWarning', deprecationWarning);
exports.default = deprecationWarning;
