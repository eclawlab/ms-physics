"use strict";
// Copyright 2023-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.writableIsSettingPhetioStateProperty = void 0;
/**
 * Property that is set to true when the PhET-iO State Engine is setting the state of a simulation. This Property
 * is valuable for checking is PhET-iO state-setting is occurring in your listeners. It is not advised to listen
 * to this Property for sim-specific state logic. Instead, use TANDEM/phetioStateSetEmitter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var TinyProperty_js_1 = require("../../axon/js/TinyProperty.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
// This one is for specialized usage in the PhetioStateEngine, which changes the value. DO NOT USE in sim code.
exports.writableIsSettingPhetioStateProperty = new TinyProperty_js_1.default(false);
// Simulations can use this one to observe the value
var isSettingPhetioStateProperty = exports.writableIsSettingPhetioStateProperty;
tandemNamespace_js_1.default.register('isSettingPhetioStateProperty', isSettingPhetioStateProperty);
exports.default = isSettingPhetioStateProperty;
