"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getAllThirdPartyEntries;
/**
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var getThirdPartyLibEntries_js_1 = require("./getThirdPartyLibEntries.js");
/**
 * Returns an object with information about third-party license entries.
 *
 * NOTE: This pulls entries from some of the chipper globals. Should be done only after the build
 */
// TODO: type alias for TLicenseEntry, see https://github.com/phetsims/chipper/issues/1538
function getAllThirdPartyEntries(repo, brand, licenseEntries) {
    var thirdPartyEntries = {
        lib: (0, getThirdPartyLibEntries_js_1.default)(repo, brand)
    };
    if (licenseEntries) {
        for (var mediaType in licenseEntries) {
            if (licenseEntries.hasOwnProperty(mediaType)) {
                var mediaEntry = licenseEntries[mediaType];
                // For each resource of that type
                for (var resourceName in mediaEntry) {
                    if (mediaEntry.hasOwnProperty(resourceName)) {
                        var licenseEntry = mediaEntry[resourceName];
                        // If it is not from PhET, it is from a 3rd party and we must include it in the report
                        // But lift this restriction when building a non-phet brand
                        if (!licenseEntry) {
                            // Fail if there is no license entry.  Though this error should have been caught
                            if (brand === 'phet' || brand === 'phet-io') {
                                // during plugin loading, so this is a "double check"
                                grunt_js_1.default.log.error("No license.json entry for ".concat(resourceName));
                            }
                        }
                        else if (licenseEntry.projectURL !== 'https://phet.colorado.edu' &&
                            licenseEntry.projectURL !== 'http://phet.colorado.edu') {
                            thirdPartyEntries[mediaType] = thirdPartyEntries[mediaType] || {};
                            thirdPartyEntries[mediaType][resourceName] = licenseEntry;
                        }
                    }
                }
            }
        }
    }
    return thirdPartyEntries;
}
