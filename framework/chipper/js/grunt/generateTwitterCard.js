"use strict";
// Copyright 2017-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateTwitterCard;
/**
 * This grunt task generates the 800x400 letter-boxed version of the sim screenshot for use in
 * twitter cards (metadata) on the website simulation pages.
 *
 * @author Matt Pennington
 */
var jimp_1 = require("jimp");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
/**
 * @param repo - name of the repository
 * @returns - Resolves with a PNG {Buffer}
 */
function generateTwitterCard(repo) {
    return new Promise(function (resolve, reject) {
        var fullResImageName = "../".concat(repo, "/assets/").concat(repo, "-screenshot.png");
        if (!grunt_js_1.default.file.exists(fullResImageName)) {
            grunt_js_1.default.log.writeln("no image file exists: ".concat(fullResImageName, ". Not running task: generate-thumbnails"));
            return;
        }
        // The following creates an 800x400 image that is a letter-boxed version of the original size image and
        // has transparent padding, potentially on all sides.
        new jimp_1.default(fullResImageName, function () {
            this.resize(600, 394) // Preserve original dimensions
                .contain(585, 400) // Resize to allow padding on top/bottom
                .contain(800, 400) // Add padding on right/left
                .getBuffer(jimp_1.default.MIME_PNG, function (error, pngBuffer) {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(pngBuffer);
                }
            });
        });
    });
}
