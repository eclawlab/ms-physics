"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Prints out a JSON map from repo name => list of all dependencies (used by e.g. phettest), for a comma-separated list of repos.
 * Babel is excluded (should be included as a dependency on everything).
 *
 * This is done for efficiency (so we don't need to launch multiple scripts)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var getPhetLibs_js_1 = require("../grunt/getPhetLibs.js");
(0, assert_1.default)(typeof process.argv[2] === 'string', 'Provide the repo name as the first parameter');
var repos = process.argv[2].split(',');
var result = {};
for (var _i = 0, repos_1 = repos; _i < repos_1.length; _i++) {
    var repo = repos_1[_i];
    result[repo] = (0, getPhetLibs_js_1.default)(repo).filter(function (dependency) { return dependency !== 'babel'; }).sort();
}
console.log(JSON.stringify(result, null, 2));
