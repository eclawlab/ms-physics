"use strict";
// Copyright 2015-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = reportUnusedStrings;
/**
 * Report which translatable strings from a sim were not used in the simulation with a require statement.
 *
 * Each time a string is loaded by the plugin, it is added to a global list.  After all strings are loaded,
 * the global will contain the list of all strings that are actually used by the sim.  Comparing this list to
 * the strings in the translatable strings JSON file will identify which strings are unused.
 *
 * See https://github.com/phetsims/tasks/issues/460
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
/**
 * @param repo
 * @param requirejsNamespace
 * @param usedStringMap - Maps full keys to string values, FOR USED STRINGS ONLY
 */
function reportUnusedStrings(repo, requirejsNamespace, usedStringMap) {
    /**
     * Builds a string map recursively from a string-file-like object.
     */
    var buildStringMap = function (object) {
        var result = {};
        if (typeof object.value === 'string') {
            result[''] = object.value;
        }
        Object.keys(object).filter(function (key) { return key !== 'value'; }).forEach(function (key) {
            if (typeof object[key] === 'object') {
                var subresult_1 = buildStringMap(object[key]);
                Object.keys(subresult_1).forEach(function (subkey) {
                    result[key + (subkey.length ? ".".concat(subkey) : '')] = subresult_1[subkey];
                });
            }
        });
        return result;
    };
    var availableStringMap = buildStringMap(JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/").concat(repo, "-strings_en.json"), 'utf8')));
    Object.keys(availableStringMap).forEach(function (availableStringKey) {
        if (!usedStringMap["".concat(requirejsNamespace, "/").concat(availableStringKey)]) {
            grunt_js_1.default.log.warn("Unused string: key=".concat(availableStringKey, ", value=").concat(availableStringMap[availableStringKey]));
        }
    });
}
