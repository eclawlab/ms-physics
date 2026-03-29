"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPreloads;
/**
 * Gets preload, the set of scripts to be preloaded in the .html file.
 * NOTE! Order of the return value is significant, since it corresponds to the order in which scripts will be preloaded.
 *
 * @param repo
 * @param brand
 * @param [forSim] - if the preloads are specifically for a simulation
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var getPhetLibs_js_1 = require("./getPhetLibs.js");
function getPreloads(repo, brand, forSim) {
    var packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
    var buildObject;
    try {
        var buildString = grunt_js_1.default.file.read('../chipper/build.json');
        var filledInBuildString = ChipperStringUtils_js_1.default.replaceAll(buildString, '{{REPO}}', repo);
        buildObject = JSON.parse(filledInBuildString);
    }
    catch (e) {
        buildObject = {};
    }
    var preload = [];
    // add preloads that are common to all sims, from build.json
    if (buildObject.common && buildObject.common.preload) {
        (0, assert_1.default)(Array.isArray(buildObject.common.preload), 'preload should be an array');
        preload = preload.concat(buildObject.common.preload);
    }
    // add sim-specific preloads from package.json
    if (packageObject.phet.preload) {
        (0, assert_1.default)(Array.isArray(packageObject.phet.preload), 'preload should be an array');
        preload = preload.concat(packageObject.phet.preload);
    }
    // add brand-specific preloads from build.json
    if (buildObject[brand] && buildObject[brand].preload) {
        (0, assert_1.default)(Array.isArray(buildObject[brand].preload), 'preload should be an array');
        preload = preload.concat(buildObject[brand].preload);
    }
    // simulationSpecificPreload are not needed for any other runtimes, like tests
    // No need to support this for package.json, just in chipper for now.
    if (forSim && buildObject[brand] && buildObject[brand].simulationSpecificPreload) {
        preload = preload.concat(buildObject[brand].simulationSpecificPreload);
    }
    // add brand-specific preloads from package.json
    if (packageObject.phet[brand] && packageObject.phet[brand].preload) {
        (0, assert_1.default)(Array.isArray(packageObject.phet[brand].preload), 'preload should be an array');
        preload = preload.concat(packageObject.phet[brand].preload);
    }
    // remove duplicates (do NOT sort, order is significant!)
    preload = lodash_1.default.uniq(preload);
    // Verifies that preload repositories are included in phetLib.
    var phetLibs = (0, getPhetLibs_js_1.default)(repo, brand);
    var missingRepositories = [];
    preload.forEach(function (entry) {
        // preload entries should start with '..', e.g. "../assert/js/assert.js"
        (0, assert_1.default)(entry.split('/')[0] === '..', "malformed preload entry: ".concat(entry));
        // the preload's repository should be in phetLib
        var repositoryName = entry.split('/')[1];
        if (!phetLibs.includes(repositoryName) && !missingRepositories.includes(repositoryName)) {
            missingRepositories.push(repositoryName);
        }
    });
    (0, assert_1.default)(missingRepositories.length === 0, "phetLib is missing repositories required by preload: ".concat(missingRepositories.toString()));
    return preload;
}
