"use strict";
// Copyright 2024-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
var lodash_js_1 = require("../../sherpa/js/lodash.js");
var isPhetioEnabled = lodash_js_1.default.hasIn(window, 'phet.preloads.phetio');
exports.default = isPhetioEnabled;
