"use strict";
// Copyright 2020-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Caches the results of previous single-argument function applications to the same object.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
/**
 * @param func - Should take one argument
 * @returns - Returns a function that is equivalent, but caches values from previous keys
 */
function memoize(func) {
    var map = new Map();
    return function (key) {
        if (map.has(key)) {
            return map.get(key);
        }
        else {
            var value = func(key);
            map.set(key, value);
            return value;
        }
    };
}
phetCore_js_1.default.register('memoize', memoize);
exports.default = memoize;
