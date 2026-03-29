"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Uglifies the given JS code (with phet-relevant options)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var lodash_1 = require("lodash");
var transpileForBuild_js_1 = require("./transpileForBuild.js");
var terser = require('terser');
var MINIFY_DEFAULTS = {
    minify: true,
    // Only enabled if minify is true
    babelTranspile: true,
    uglify: true,
    // Only enabled if uglify is true
    mangle: true,
    stripAssertions: true,
    stripLogging: true,
    beautify: false
};
/**
 * Minifies the given JS code (with phet-relevant options). Note that often the parameters conflict with each other. For
 * instance, during one phase of a dot standalone build, stripAssertions is true but babelTranspile is false.
 *
 * @param js
 * @param options
 */
var minify = function (js, options) {
    options = lodash_1.default.assignIn({}, MINIFY_DEFAULTS, options);
    // Promote to top level variables
    var minify = options.minify, babelTranspile = options.babelTranspile, uglify = options.uglify, mangle = options.mangle, stripAssertions = options.stripAssertions, stripLogging = options.stripLogging, beautify = options.beautify;
    if (!minify) {
        return js;
    }
    // Do transpilation before uglifying.
    if (babelTranspile) {
        js = (0, transpileForBuild_js_1.default)(js);
    }
    var uglifyOptions = {
        mangle: mangle ? {
            safari10: true // works around a safari 10 bug. currently a supported platform
        } : false,
        compress: {
            // defaults to remove dead code (dead_code option no longer required)
            dead_code: true, // remove unreachable code
            // To define globals, use global_defs inside compress options, see https://github.com/jrburke/r.js/issues/377
            global_defs: {}
        },
        // output options documented at https://github.com/mishoo/UglifyJS2#beautifier-options
        output: {
            inline_script: true, // escape </script
            beautify: beautify
        }
    };
    // global assertions (PhET-specific)
    if (stripAssertions) {
        uglifyOptions.compress.global_defs.assert = false;
        uglifyOptions.compress.global_defs.assertSlow = false;
    }
    // scenery logging (PhET-specific)
    if (stripLogging) {
        uglifyOptions.compress.global_defs.sceneryLog = false;
    }
    if (uglify) {
        var result = terser.minify(js, uglifyOptions);
        if (result.error) {
            console.log(result.error);
            throw new Error(result.error);
        }
        else {
            // workaround for Uglify2's Unicode unescaping. see https://github.com/phetsims/chipper/issues/70
            // Also, 0x7f is converted for https://github.com/phetsims/scenery/issues/1687.
            return result.code.replace('\x0B', '\\x0B').replace(/\u007f/g, '\\u007f');
        }
    }
    else {
        return js;
    }
};
minify.MINIFY_DEFAULTS = MINIFY_DEFAULTS;
/**
 * Returns a minified version of the code (with optional mangling).
 */
exports.default = minify;
