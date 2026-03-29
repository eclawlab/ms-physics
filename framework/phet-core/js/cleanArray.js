"use strict";
// Copyright 2014-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * If given an Array, removes all of its elements and returns it. Otherwise, if given a falsy value
 * (null/undefined/etc.), it will create and return a fresh Array.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
function cleanArray(arr) {
    (0, affirm_js_1.default)(!arr || (Array.isArray(arr)), 'cleanArray either takes an Array');
    if (arr) {
        // fastest way to clear an array (http://stackoverflow.com/questions/1232040/how-to-empty-an-array-in-javascript, http://jsperf.com/array-destroy/32)
        // also, better than length=0, since it doesn't create significant garbage collection (like length=0), tested on Chrome 34.
        while (arr.length) {
            arr.pop();
        }
        return arr;
    }
    else {
        return [];
    }
}
phetCore_js_1.default.register('cleanArray', cleanArray);
exports.default = cleanArray;
