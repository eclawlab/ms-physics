"use strict";
// Copyright 2020-2026, University of Colorado Boulder
// @author Sam Reid (PhET Interactive Simulations)
Object.defineProperty(exports, "__esModule", { value: true });
var axon_js_1 = require("./axon.js");
var Timer_js_1 = require("./Timer.js");
// Like stepTimer but runs every frame whether the sim is active or not.
var animationFrameTimer = new Timer_js_1.default();
axon_js_1.default.register('animationFrameTimer', animationFrameTimer);
exports.default = animationFrameTimer;
