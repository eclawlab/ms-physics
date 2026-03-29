"use strict";
// Copyright 2014-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Partitions an array into two arrays: the first contains all elements that satisfy the predicate, and the second
 * contains all the (other) elements that do not satisfy the predicate.
 *
 * e.g. partition( [1,2,3,4], function( n ) { return n % 2 === 0; } ) will return [[2,4],[1,3]]
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
function partition(array, predicate) {
    (0, affirm_js_1.default)(Array.isArray(array));
    var satisfied = [];
    var unsatisfied = [];
    var length = array.length;
    for (var i = 0; i < length; i++) {
        if (predicate(array[i])) {
            satisfied.push(array[i]);
        }
        else {
            unsatisfied.push(array[i]);
        }
    }
    return [satisfied, unsatisfied];
}
phetCore_js_1.default.register('partition', partition);
exports.default = partition;
