"use strict";
// Copyright 2018-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = packageXHTML;
/**
 * Combines all parts of a runnable's built file into an XHTML structure (with separate files)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
// modules
var assert_1 = require("assert");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var getTitleStringKey_js_1 = require("./getTitleStringKey.js");
var nodeHtmlEncoder = require('node-html-encoder');
/**
 * From a given set of config (including the JS and other required things), it creates an XHTML structure and writes it to disk.
 */
function packageXHTML(xhtmlDir, config) {
    var encoder = new nodeHtmlEncoder.Encoder('entity');
    var repo = config.repo, // {string}
    brand = config.brand, // {string}
    stringMap = config.stringMap, // {Object}, map[ locale ][ stringKey ] => {string}
    initializationScript = config.initializationScript, // {string} - separate from the rest of the scripts since it needs to be able to run in IE.
    licenseScript = config.licenseScript, // {string}
    scripts = config.scripts, // {Array.<string>}
    htmlHeader = config.htmlHeader // {string}
    ;
    (0, assert_1.default)(stringMap, 'Requires stringMap');
    (0, assert_1.default)(scripts, 'Requires scripts');
    var localizedTitle = stringMap[ChipperConstants_js_1.default.FALLBACK_LOCALE][(0, getTitleStringKey_js_1.default)(repo)];
    var licenseScriptFilename = "".concat(repo, "_license_").concat(brand, ".js");
    var initializationScriptFilename = "".concat(repo, "_initialization_").concat(brand, ".js");
    var script = scripts.join('\n');
    var scriptFilename = "".concat(repo, "_").concat(brand, ".js");
    var xhtml = ChipperStringUtils_js_1.default.replacePlaceholders(grunt_js_1.default.file.read('../chipper/templates/sim.xhtml'), {
        PHET_SIM_TITLE: encoder.htmlEncode(localizedTitle),
        PHET_HTML_HEADER: htmlHeader,
        PHET_INITIALIZATION_SCRIPT: "<script type=\"text/javascript\" src=\"".concat(licenseScriptFilename, "\" charset=\"utf-8\"></script><script type=\"text/javascript\" src=\"").concat(initializationScriptFilename, "\" charset=\"utf-8\"></script>"),
        PHET_SIM_SCRIPTS: "<script type=\"text/javascript\" src=\"".concat(scriptFilename, "\" charset=\"utf-8\"></script>")
    });
    grunt_js_1.default.file.write("".concat(xhtmlDir, "/").concat(repo, "_all").concat(brand === 'phet' ? '' : "_".concat(brand), ".xhtml"), xhtml);
    grunt_js_1.default.file.write("".concat(xhtmlDir, "/").concat(licenseScriptFilename), licenseScript);
    grunt_js_1.default.file.write("".concat(xhtmlDir, "/").concat(initializationScriptFilename), initializationScript);
    grunt_js_1.default.file.write("".concat(xhtmlDir, "/").concat(scriptFilename), script);
}
