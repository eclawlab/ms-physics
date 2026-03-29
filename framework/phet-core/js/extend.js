"use strict";
// Copyright 2013-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Like Underscore's _.extend and PHET_CORE/merge, but with hardcoded support for ES5 getters/setters. In general this
 * type shouldn't be used for phet's options pattern, and instead was designed to support extension for defining
 * mixins and object prototypes.
 *
 * See https://github.com/documentcloud/underscore/pull/986.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
function extend(obj) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    lodash_js_1.default.each(sources, function (source) {
        if (source) {
            for (var prop in source) {
                Object.defineProperty(obj, prop, Object.getOwnPropertyDescriptor(source, prop));
            }
        }
    });
    return obj;
}
phetCore_js_1.default.register('extend', extend);
exports.default = extend;
