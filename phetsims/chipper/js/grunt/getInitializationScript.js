"use strict";
// Copyright 2018-2026, University of Colorado Boulder
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getInitializationScript;
/**
 * Fills in values for the chipper initialization script script.
 *
 * NOTE: This should not be minified! It contains licenses that should be human readable as well as important formatting
 * for rosetta translation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var stringEncoding_js_1 = require("../common/stringEncoding.js");
var transpileForBuild_js_1 = require("./transpileForBuild.js");
/**
 * Returns a string for the JS of the initialization script.
 */
function getInitializationScript(config) {
    var brand = config.brand, // {string}, e.g. 'phet', 'phet-io'
    repo = config.repo, // {string}
    localeData = config.localeData, // {Object}, map[ locale ] => {Object}
    stringMap = config.stringMap, // {Object}, map[ locale ][ stringKey ] => {string}
    stringMetadata = config.stringMetadata, // {Object}, map[ stringKey ] => {Object}
    version = config.version, // {string}
    dependencies = config.dependencies, // {Object} - From getDependencies
    timestamp = config.timestamp, // {string}
    locale = config.locale, // {string}
    includeAllLocales = config.includeAllLocales, // {boolean}
    isDebugBuild = config.isDebugBuild, // {boolean}
    allowLocaleSwitching = config.allowLocaleSwitching, // {boolean}
    encodeStringMap = config.encodeStringMap, // {boolean}
    profileFileSize = config.profileFileSize, // {boolean}
    packageObject = config.packageObject;
    (0, assert_1.default)(stringMap, 'Requires stringMap');
    (0, assert_1.default)(dependencies, 'Requires dependencies');
    // Load localeData
    var fullLocaleData = JSON.parse(fs_1.default.readFileSync('../babel/localeData.json', 'utf8'));
    // Include a subset of locales' translated strings
    var phetStrings = stringMap;
    if (!includeAllLocales) {
        phetStrings = {};
        // Go through all of the potential fallback locales, and include the strings for each of them
        var requiredLocales = __spreadArray(__spreadArray([
            // duplicates OK
            locale
        ], (fullLocaleData[locale].fallbackLocales || []), true), [
            ChipperConstants_js_1.default.FALLBACK_LOCALE
        ], false);
        for (var _i = 0, requiredLocales_1 = requiredLocales; _i < requiredLocales_1.length; _i++) {
            var locale_1 = requiredLocales_1[_i];
            phetStrings[locale_1] = stringMap[locale_1];
        }
    }
    return ChipperStringUtils_js_1.default.replacePlaceholders(grunt_js_1.default.file.read('../chipper/templates/chipper-initialization.js'), {
        PHET_PROJECT: repo,
        PHET_VERSION: version,
        PHET_BUILD_TIMESTAMP: timestamp,
        PHET_BRAND: brand,
        PHET_LOCALE: locale,
        PHET_LOCALE_DATA: JSON.stringify(localeData),
        PHET_DEPENDENCIES: JSON.stringify(dependencies, null, 2),
        // If it's a debug build, don't encode the strings, so that they are easier to inspect
        PHET_STRINGS: (isDebugBuild || !encodeStringMap) ? JSON.stringify(phetStrings, null, isDebugBuild ? 2 : '') : stringEncoding_js_1.default.encodeStringMapToJS(phetStrings),
        PHET_BEFORE_STRINGS: profileFileSize ? 'console.log("START_STRINGS");' : '',
        PHET_AFTER_STRINGS: profileFileSize ? 'console.log("END_STRINGS");' : '',
        PHET_STRING_METADATA: JSON.stringify(stringMetadata, null, isDebugBuild ? 2 : ''),
        PHET_IS_DEBUG_BUILD: !!isDebugBuild,
        PHET_ALLOW_LOCALE_SWITCHING: !!allowLocaleSwitching,
        PHET_PACKAGE_OBJECT: JSON.stringify(packageObject),
        IE_DETECTION_SCRIPT: (0, transpileForBuild_js_1.default)(grunt_js_1.default.file.read('../chipper/js/browser/ie-detection.js'), true)
    });
}
