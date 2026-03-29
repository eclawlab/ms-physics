"use strict";
// Copyright 2022, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = identity;
/**
 * Function that returns its input. This was added as an alternative to _.identity because WebStorm did
 * not provide as good navigation for _.identity.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
function identity(t) {
    return t;
}
phetCore_js_1.default.register('identity', identity);
