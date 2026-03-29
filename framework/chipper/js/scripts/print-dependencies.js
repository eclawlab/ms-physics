"use strict";
// Copyright 2020-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Prints out a comma-separated list of repos that this repository depends on (used by things like CT)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var getPhetLibs_js_1 = require("../grunt/getPhetLibs.js");
(0, assert_1.default)(typeof process.argv[2] === 'string', 'Provide the repo name as the first parameter');
var repo = process.argv[2];
var dependencies = (0, getPhetLibs_js_1.default)(repo).filter(function (dependency) { return dependency !== 'babel'; }).sort();
console.log(dependencies.join(','));
