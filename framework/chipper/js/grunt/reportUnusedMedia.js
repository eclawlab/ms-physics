"use strict";
// Copyright 2015-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Report which media files (such as images and sounds) from a sim were not used in the simulation with a require
 * statement.
 *
 * Each time a resource is loaded by a plugin (image, sounds, mipmap,...) its license info is added to this global by
 * the plugin.  After all resources are loaded, the global will contain the list of all resources that are actually used
 * by the sim.  Comparing what's in the filesystem to this list identifies resources that are unused.
 *
 * See https://github.com/phetsims/chipper/issues/172
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (Phet Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
// modules
var ChipperConstants_js_1 = require("../../../chipper/js/common/ChipperConstants.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
/**
 * @param usedModules - Used modules within the repo
 * @param repo - Name of the repo
 */
exports.default = (function (repo, usedModules) {
    // on Windows, paths are reported with a backslash, normalize to forward slashes so this works everywhere
    var normalizedUsedModules = usedModules.map(function (module) { return module.split('\\').join('/'); });
    ChipperConstants_js_1.default.MEDIA_TYPES.forEach(function (mediaType) {
        // Iterate over media directories and sub-directories
        var subdirectory = "../".concat(repo, "/").concat(mediaType);
        if (grunt_js_1.default.file.isDir(subdirectory)) {
            grunt_js_1.default.file.recurse(subdirectory, function (abspath, rootdir, subdir, filename) {
                if (filename !== 'license.json' && filename !== 'README.md' && filename.includes('.js')) {
                    var module_1 = subdir ?
                        "".concat(repo, "/").concat(mediaType, "/").concat(subdir, "/").concat(filename) :
                        "".concat(repo, "/").concat(mediaType, "/").concat(filename);
                    // If no licenseEntries were registered, or some were registered but not one corresponding to this file
                    if (!normalizedUsedModules.includes("chipper/dist/js/".concat(module_1))) {
                        grunt_js_1.default.log.warn("Unused ".concat(mediaType, " module: ").concat(module_1));
                    }
                }
            });
        }
    });
});
