"use strict";
// Copyright 2024-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = gruntTimingLog;
/**
 * better formatting for logging during the build.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var lodash_1 = require("lodash");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
// Align tabs to messages shorter than this number of chars.
var MAX_SUPPORTED_LENGTH = 29;
function gruntTimingLog(message, time, bytes) {
    var tabsNeeded = Math.ceil(Math.max(MAX_SUPPORTED_LENGTH - message.length, 0) / 8) + 1;
    var tabs = lodash_1.default.times(tabsNeeded).map(function () { return '\t'; }).join('');
    var bytesString = bytes ? " (".concat(bytes, " bytes)") : '';
    grunt_js_1.default.log.ok("".concat(message, ":").concat(tabs).concat(time, "ms").concat(bytesString));
}
