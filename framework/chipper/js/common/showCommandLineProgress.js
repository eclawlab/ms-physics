"use strict";
// Copyright 2022-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = showCommandLineProgress;
/**
 * Helper function to show a progress bar on the command line.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * See https://jagascript.com/how-to-build-a-textual-progress-bar-for-cli-and-terminal-apps/
 * @param progress - decimal between 0 and 1
 * @param newline - if each new progress should give a new line, should be false during progress, and true when finally completed
 * @param providedOptions
 */
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
function showCommandLineProgress(progress, newline, providedOptions) {
    var options = (0, optionize_js_1.default)()({
        progressBarLength: 40 // in characters
    }, providedOptions);
    var dots = '.'.repeat(Math.round(progress * options.progressBarLength));
    var empty = ' '.repeat(Math.round((1 - progress) * options.progressBarLength));
    var newlineString = newline ? '\n' : '';
    process.stdout.write("\r[".concat(dots).concat(empty, "] ").concat((progress * 100).toFixed(2), "%").concat(newlineString));
}
