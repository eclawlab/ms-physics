"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getLocalesFromRepository;
/**
 * Gets the locales from a repository, by inspecting the names of the string files in babel for that repository.
 *
 * @param repo - name of the repository to get locales from
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
function getLocalesFromRepository(repo) {
    // confirm that the repository has a strings directory
    var stringsDirectory = "../babel/".concat(repo);
    // Get names of string files.
    var stringFiles = grunt_js_1.default.file.expand("".concat(stringsDirectory, "/").concat(repo, "-strings_*.json"));
    // Don't fail out if there are no string files, as this is a normal condition when building new simulations
    if (stringFiles.length === 0) {
        grunt_js_1.default.log.verbose.writeln("No string files found in ".concat(stringsDirectory, " for repository ").concat(repo));
        return [];
    }
    // Extract the locales from the file names.
    // File names must have a form like 'graphing-lines-strings_ar_SA.json', where no '_' appear in the repo name.
    var locales = stringFiles.map(function (filename) {
        return filename.substring(filename.indexOf('_') + 1, filename.lastIndexOf('.'));
    });
    (0, assert_1.default)(locales.length > 0, "no locales found in ".concat(stringsDirectory));
    return locales;
}
