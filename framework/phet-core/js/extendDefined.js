"use strict";
// Copyright 2016-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Like phet-core's extend, but does not overwrite properties with undefined values.
 *
 * For example:
 *
 * extendDefined( { a: 5 }, { a: undefined } ) will return { a: 5 }
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
function extendDefined(obj) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    lodash_js_1.default.each(sources, function (source) {
        if (source) {
            for (var prop in source) {
                var descriptor = Object.getOwnPropertyDescriptor(source, prop);
                if (descriptor && (typeof descriptor.get === 'function' || source[prop] !== undefined)) {
                    Object.defineProperty(obj, prop, descriptor);
                }
            }
        }
    });
    return obj;
}
phetCore_js_1.default.register('extendDefined', extendDefined);
exports.default = extendDefined;
