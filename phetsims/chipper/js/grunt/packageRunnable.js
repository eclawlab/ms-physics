"use strict";
// Copyright 2017-2026, University of Colorado Boulder
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
exports.default = packageRunnable;
/**
 * Combines all parts of a runnable's built file into one HTML file.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
// modules
var assert_1 = require("assert");
var fs_1 = require("fs");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var getTitleStringKey_js_1 = require("./getTitleStringKey.js");
var pako = require('pako');
var nodeHtmlEncoder = require('node-html-encoder');
var localeData = JSON.parse(fs_1.default.readFileSync('../babel/localeData.json', 'utf-8'));
/**
 * From a given set of config (including the JS and other required things), it creates an HTML file for a runnable.
 */
function packageRunnable(config) {
    var encoder = new nodeHtmlEncoder.Encoder('entity');
    var repo = config.repo, // {string}
    stringMap = config.stringMap, // {Object}, map[ locale ][ stringKey ] => {string}
    licenseScript = config.licenseScript, // {string}
    scripts = config.scripts, // {Array.<string>}
    locale = config.locale, // {string}
    htmlHeader = config.htmlHeader, // {string}
    _a = config.compressScripts, // {string}
    compressScripts = _a === void 0 ? false : _a;
    (0, assert_1.default)(stringMap, 'Requires stringMap');
    (0, assert_1.default)(scripts, 'Requires scripts');
    (0, assert_1.default)(licenseScript, 'Requires license script');
    var localizedTitle = stringMap[locale][(0, getTitleStringKey_js_1.default)(repo)];
    // Directory on the PhET website where the latest version of the sim lives
    var latestDir = "https://phet.colorado.edu/sims/html/".concat(repo, "/latest/");
    // Converts a Uint8Array to a base64-encoded string (the usual String.fromCharCode.apply trick doesn't work for large arrays)
    var encodeBytes = function (uint8Array) {
        var binary = '';
        var len = uint8Array.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    };
    // Converts from a JS string to a base64-encoded string
    var toEncodedString = function (string) { return encodeBytes(pako.deflate(string)); };
    // Converts from a JS string to a compressed JS string that can be run
    var toRunString = function (string) { return "_C('".concat(toEncodedString(string), "')"); };
    var scriptSection;
    if (compressScripts) {
        scriptSection = "<script>\n".concat(licenseScript, "\n</script>") +
            "<script>".concat(fs_1.default.readFileSync('../sherpa/lib/pako_inflate-2.0.3.min.js', 'utf-8'), "</script>\n") +
            '<script>let _R=q=>{var s=document.createElement("script");s.type=\'text/javascript\';s.async=false;var c=document.createTextNode(q);s.appendChild(c);document.body.appendChild(s);};let _D=s=>{const ar=new Uint8Array(s.length);for (let i=0;i<s.length;i++){ar[i]=s.charCodeAt(i);}return ar;};let _F=s=>pako.inflate(_D(atob(s)),{to:\'string\'});let _C=string=>_R(_F(string));' +
            scripts.map(function (script) { return "".concat(toRunString(script)); }).join('\n') + '</script>';
    }
    else {
        scriptSection = __spreadArray([licenseScript], scripts, true).map(function (script) { return "<script>".concat(script, "</script>"); }).join('\n');
    }
    var bcp47Lang = localeData[locale].bcp47;
    (0, assert_1.default)(bcp47Lang, 'Requires bcp47 language');
    return ChipperStringUtils_js_1.default.replacePlaceholders(grunt_js_1.default.file.read('../chipper/templates/sim.html'), {
        PHET_CARRIAGE_RETURN: '\r',
        PHET_SIM_TITLE: encoder.htmlEncode(localizedTitle),
        PHET_HTML_HEADER: htmlHeader,
        // Provide an initial value for the HTML lang attribute, see https://github.com/phetsims/chipper/issues/1332
        // The actual value may be changed on startup (e.g. if a locale query parameter is provided, or locale is
        // dynamically changed.
        PHET_LANG: bcp47Lang,
        // wrap scripts in global check for IE
        PHET_SIM_SCRIPTS: scriptSection,
        // metadata for Open Graph protocol, see phet-edmodo#2
        OG_TITLE: encoder.htmlEncode(localizedTitle),
        OG_URL: "".concat(latestDir).concat(repo, "_").concat(locale, ".html"),
        OG_IMAGE: "".concat(latestDir).concat(repo, "-600.png")
    });
}
