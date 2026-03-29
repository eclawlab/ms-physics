"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getLicenseKeys;
/**
 * Gets the license keys for sherpa (third-party) libs that are used.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var webpackGlobalLibraries_js_1 = require("../common/webpackGlobalLibraries.js");
var getPreloads_js_1 = require("./getPreloads.js");
/**
 * Gets the license keys for sherpa (third-party) libs that are used.
 */
function getLicenseKeys(repo, brand) {
    var packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
    var buildObject;
    try {
        buildObject = JSON.parse((0, fs_1.readFileSync)('../chipper/build.json', 'utf8'));
    }
    catch (e) {
        buildObject = {};
    }
    var preload = (0, getPreloads_js_1.default)(repo, brand, false);
    // start with package.json
    var licenseKeys = packageObject.phet.licenseKeys || [];
    // add common and brand-specific entries from build.json
    ['common', brand].forEach(function (id) {
        if (buildObject[id] && buildObject[id].licenseKeys) {
            licenseKeys = licenseKeys.concat(buildObject[id].licenseKeys);
        }
    });
    // Extract keys from preloads and webpack-supported imports for
    // sherpa (third-party) dependencies.
    var allPaths = preload.concat(Object.values(webpackGlobalLibraries_js_1.default).map(function (path) { return "../".concat(path); }));
    allPaths.forEach(function (path) {
        if (path.includes('/sherpa/')) {
            var lastSlash = path.lastIndexOf('/');
            var key = path.substring(lastSlash + 1);
            licenseKeys.push(key);
        }
    });
    // sort and remove duplicates
    return lodash_1.default.uniq(lodash_1.default.sortBy(licenseKeys, function (key) { return key.toUpperCase(); }));
}
