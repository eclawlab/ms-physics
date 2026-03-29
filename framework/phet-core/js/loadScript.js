"use strict";
// Copyright 2013-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Loads a script
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
/*
 * Load a script. The only required argument is src, and can be specified either as
 * loadScript( "<url>" ) or loadScript( { src: "<url>", ... other options ... } ).
 *
 * Arguments:
 *   src:         The source of the script to load
 *   callback:    A callback to call (with no arguments) once the script is loaded and has been executed
 *   async:       Whether the script should be loaded asynchronously. Defaults to true
 *   cacheBust: Whether the URL should have an appended query string to work around caches
 */
function loadScript(inputArgs) {
    // handle a string argument
    var args = typeof inputArgs === 'string' ? { src: inputArgs } : inputArgs;
    var src = args.src;
    var callback = args.callback;
    var async = args.async === undefined ? true : args.async;
    var cacheBust = args.cacheBust === undefined ? false : args.cacheBust;
    var called = false;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = async;
    // @ts-expect-error
    script.onload = script.onreadystatechange = function () {
        // @ts-expect-error
        var state = this.readyState;
        if (state && state !== 'complete' && state !== 'loaded') {
            return;
        }
        if (!called) {
            called = true;
            if (callback) {
                callback();
            }
        }
    };
    // make sure things aren't cached, just in case
    script.src = src + (cacheBust ? "?random=".concat(Math.random().toFixed(10)) : ''); // eslint-disable-line phet/bad-sim-text
    var other = document.getElementsByTagName('script')[0];
    other.parentNode.insertBefore(script, other);
}
phetCore_js_1.default.register('loadScript', loadScript);
exports.default = loadScript;
