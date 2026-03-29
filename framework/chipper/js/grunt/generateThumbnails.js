"use strict";
// Copyright 2017-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateThumbnails;
/**
 * This grunt task generates 128x84 and 600x394 thumbnails of the sim's screenshot in assets.
 * Thumbnails are put in the build directory of the sim. If the directory doesn't exist, it is created.
 * New grunt tasks can easily be created to generate different sized images by passing this function
 * different heights and widths.
 *
 * @author Aaron Davis
 */
var jimp_1 = require("jimp");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
/**
 * @param repo - name of the repository
 * @param width of the resized image
 * @param height of the resized image
 * @param quality - percent quality, in the range [0..100]
 * @param mime - Mime type - one of jimp.MIME_PNG, jimp.MIME_JPEG, jimp.MIME_BMP
 * @param altSuffix - ending for the filename e.g. -alt1
 * @returns Resolves to a {Buffer} with the image data
 */
function generateThumbnails(repo, width, height, quality, mime, altSuffix) {
    if (altSuffix === void 0) { altSuffix = undefined; }
    return new Promise(function (resolve, reject) {
        var fullResImageName = "../".concat(repo, "/assets/").concat(repo, "-screenshot").concat(altSuffix || '', ".png");
        if (!grunt_js_1.default.file.exists(fullResImageName)) {
            grunt_js_1.default.log.writeln("no image file exists: ".concat(fullResImageName, ". Aborting generateThumbnails"));
            return;
        }
        new jimp_1.default(fullResImageName, function () {
            if (mime === jimp_1.default.MIME_JPEG) {
                this.quality(quality);
            }
            this.resize(width, height).getBuffer(mime, function (error, buffer) {
                if (error) {
                    reject(new Error(error));
                }
                else {
                    resolve(buffer);
                }
            });
        });
    });
}
