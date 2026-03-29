"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getTitleStringKey;
/**
 * Returns the string key for the title of a runnable.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
/**
 * Returns the string key for the title of a runnable.
 */
function getTitleStringKey(repo) {
    var packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
    return "".concat(packageObject.phet.requirejsNamespace, "/").concat(repo, ".title");
}
