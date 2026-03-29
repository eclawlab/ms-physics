"use strict";
// Copyright 2023-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Property that is set to true when the PhET-iO State Engine is clearing dynamic elements.
 *
 * Marking if we are clearing dynamic elements from instrumented containers. This information is useful because certain
 * logic depends on whether we are setting PhET-iO state but also needs to know about when clearing dynamic elements
 * to handle it separately.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var TinyProperty_js_1 = require("../../axon/js/TinyProperty.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var isClearingPhetioDynamicElementsProperty = new TinyProperty_js_1.default(false);
tandemNamespace_js_1.default.register('isClearingPhetioDynamicElementsProperty', isClearingPhetioDynamicElementsProperty);
exports.default = isClearingPhetioDynamicElementsProperty;
