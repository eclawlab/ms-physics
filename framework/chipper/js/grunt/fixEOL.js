"use strict";
// Copyright 2020-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Fix end of lines for a string based on the operating system this code is being run on.
 * See https://github.com/phetsims/chipper/issues/933
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var os_1 = require("os");
exports.default = (function (string) { return string.split('\r').join('').split('\n').join(os_1.default.EOL); });
