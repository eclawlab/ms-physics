"use strict";
// Copyright 2015-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getThirdPartyLibEntries;
/**
 * This function returns an object literal that describes the third-party libraries that are included in the html deliverable.
 * License info is read from sherpa/lib/license.json, and the format of the object literal is similar to that syntax.
 *
 * See getLicenseEntry.js for a description & syntax of the license entries
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var getLicenseKeys_js_1 = require("./getLicenseKeys.js");
var THIRD_PARTY_LICENSES_FILENAME = '../sherpa/lib/license.json'; // contains third-party license info
var LICENSES_DIRECTORY = '../sherpa/licenses/'; // contains third-party licenses themselves.
function getThirdPartyLibEntries(repo, brand) {
    // Read license info
    var licenseInfo = JSON.parse((0, fs_1.readFileSync)(THIRD_PARTY_LICENSES_FILENAME, 'utf8'));
    var licenseKeys = (0, getLicenseKeys_js_1.default)(repo, brand);
    // Add all dependencies. Duplicates will be removed later.
    for (var i = 0; i < licenseKeys.length; i++) {
        var license = licenseInfo[licenseKeys[i]];
        (0, assert_1.default)(license, "".concat(THIRD_PARTY_LICENSES_FILENAME, ": no entry for key = ").concat(licenseKeys[i]));
        var dependencies = license.dependencies;
        if (typeof dependencies === 'object') {
            licenseKeys = licenseKeys.concat(dependencies);
        }
    }
    // Sort keys and remove duplicates
    licenseKeys = lodash_1.default.uniq(lodash_1.default.sortBy(licenseKeys, function (key) { return key.toUpperCase(); }));
    grunt_js_1.default.log.verbose.writeln("licenseKeys = ".concat(licenseKeys.toString()));
    // Combine all licenses into 1 object literal
    var libEntries = {};
    licenseKeys.forEach(function (key) {
        var license = licenseInfo[key];
        // verify required keys
        (0, assert_1.default)(license, "".concat(THIRD_PARTY_LICENSES_FILENAME, ": no entry for key = ").concat(key));
        (0, assert_1.default)(license.text, "".concat(THIRD_PARTY_LICENSES_FILENAME, ": no text field for key = ").concat(key));
        (0, assert_1.default)(license.license, "".concat(THIRD_PARTY_LICENSES_FILENAME, ": no license field for key = ").concat(key));
        (0, assert_1.default)(license.projectURL, "".concat(THIRD_PARTY_LICENSES_FILENAME, ": no projectURL field for key = ").concat(key));
        (0, assert_1.default)(license.notes, "".concat(THIRD_PARTY_LICENSES_FILENAME, ": no notes field for key = ").concat(key));
        // read the license file
        var licenseText = grunt_js_1.default.file.read("".concat(LICENSES_DIRECTORY + key, ".txt"));
        license.licenseText = licenseText.split(/\r?\n/);
        libEntries[key] = license;
    });
    return libEntries;
}
