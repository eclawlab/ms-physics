"use strict";
// Copyright 2016-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = copyDirectory;
/**
 * Copy a directory and all of its contents recursively
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * @param src - the source directory
 * @param dst - the destination directory
 * @param [filter] - rules for filtering files.  If returns falsy, then the file will be copied directly (helps with images)
 * @param [options]
 */
var assert_1 = require("assert");
var lodash_1 = require("lodash");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var minify_js_1 = require("./minify.js");
function copyDirectory(src, dst, filter, options) {
    options = lodash_1.default.assignIn({
        failOnExistingFiles: false,
        exclude: [], // list to exclude
        minifyJS: false,
        minifyOptions: {},
        licenseToPrepend: ''
    }, options);
    // Copy built sim files (assuming they exist from a prior grunt command)
    grunt_js_1.default.file.recurse(src, function (abspath, rootdir, subdir, filename) {
        var isExcludedDir = false;
        subdir && subdir.split('/').forEach(function (pathPart) {
            // Exclude all directories that are in the excluded list
            if (options.exclude.indexOf(pathPart) >= 0) {
                isExcludedDir = true;
            }
        });
        // Exit out if the file is excluded or if it is in a excluded dir.
        if (isExcludedDir || options.exclude.indexOf(filename) >= 0) {
            return;
        }
        var contents = grunt_js_1.default.file.read(abspath);
        var dstPath = subdir ? ("".concat(dst, "/").concat(subdir, "/").concat(filename)) : ("".concat(dst, "/").concat(filename));
        if (options.failOnExistingFiles && grunt_js_1.default.file.exists(dstPath)) {
            assert_1.default && (0, assert_1.default)(false, 'file existed already');
        }
        var filteredContents = filter && filter(abspath, contents);
        // Minify the file if it is javascript code
        if (options.minifyJS && filename.endsWith('.js') && !abspath.includes('chipper/templates/')) {
            var toBeMinified = filteredContents ? filteredContents : contents;
            filteredContents = (0, minify_js_1.default)(toBeMinified, options.minifyOptions);
            // Only add the license to the javascript code
            filteredContents = options.licenseToPrepend + filteredContents;
        }
        if (filteredContents) {
            grunt_js_1.default.file.write(dstPath, filteredContents);
        }
        else {
            grunt_js_1.default.file.copy(abspath, dstPath);
        }
    });
}
