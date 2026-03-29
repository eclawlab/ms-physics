"use strict";
// Copyright 2013-2024, University of Colorado Boulder
// @author Michael Kauzmann (PhET Interactive Simulations)
Object.defineProperty(exports, "__esModule", { value: true });
var Namespace_js_1 = require("./Namespace.js");
var phetCore = new Namespace_js_1.default('phetCore');
// Namespace can't require this file, so we register it as a special case.
phetCore.register('Namespace', Namespace_js_1.default);
exports.default = phetCore;
