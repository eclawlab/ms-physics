"use strict";
// Copyright 2016-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getA11yViewHTML;
/**
 * From the a11y view template file, fill in the templated values and return the html as a string.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @returns - the html string, filled in from the template.
 */
var fixEOL_js_1 = require("../../../perennial-alias/js/common/fixEOL.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
function getA11yViewHTML(repo) {
    var html = grunt_js_1.default.file.read('../chipper/wrappers/a11y-view/index.html'); // the template file is also runnable
    // Replace placeholders in the template.
    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{PHET_REPOSITORY}}', repo);
    // Remove to-dos so they don't propagate to all repo copies
    html = html.replace(/^.*\/\/[\s]?TODO.*\r?\n/mg, '');
    return (0, fixEOL_js_1.default)(html);
}
