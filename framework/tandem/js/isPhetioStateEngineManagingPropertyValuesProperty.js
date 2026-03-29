"use strict";
// Copyright 2023-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Property that is set to true when the PhET-iO State Engine is managing Property values, see ReadOnlyProperty.set()
 *
 * phet-io internal, do not use in sims.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var TinyProperty_js_1 = require("../../axon/js/TinyProperty.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var isPhetioStateEngineManagingPropertyValuesProperty = new TinyProperty_js_1.default(false);
tandemNamespace_js_1.default.register('isPhetioStateEngineManagingPropertyValuesProperty', isPhetioStateEngineManagingPropertyValuesProperty);
exports.default = isPhetioStateEngineManagingPropertyValuesProperty;
