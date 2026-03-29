"use strict";
// Copyright 2020-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Throws an assertion error if specified object doesn't have all provided properties. This will also work for anything
 * defined on class prototypes (like Node.prototype.setOpacity)
 *
 * @example
 * assertHasProperties( { tree:1, flower:2 }, [ 'tree' ] ) => no error
 * assertHasProperties( { flower:2 }, [ 'tree' ] ) => error
 * assertHasProperties( { tree:1, flower:2 }, [ 'tree', 'flower' ] ) => no error
 * assertHasProperties( { tree:1 }, [ 'tree', 'flower' ] ) => error
 * assertHasProperties( new phet.scenery.Node(), [ 'getOpacity','opacity', '_opacity' ] ) => no error
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
var inheritance_js_1 = require("./inheritance.js");
var phetCore_js_1 = require("./phetCore.js");
var assertHasProperties = function (object, properties) {
    if ((0, affirm_js_1.isAffirmEnabled)() && object) {
        properties.forEach(function (property) {
            (0, affirm_js_1.default)(Object.getOwnPropertyDescriptor(object, property) || // support fields directly on the object
                // test up the class hierarchy for if the property is defined on a prototype.
                lodash_js_1.default.some((0, inheritance_js_1.default)(object.constructor).map(function (type) { return Object.getOwnPropertyDescriptor(type.prototype, property); })), "property not defined: ".concat(property));
        });
    }
};
phetCore_js_1.default.register('assertHasProperties', assertHasProperties);
exports.default = assertHasProperties;
