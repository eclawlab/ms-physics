"use strict";
// Copyright 2022-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = pascalCase;
/**
 * Convert a string to PascalCase
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var lodash_1 = require("lodash");
function pascalCase(string) {
    return "".concat(lodash_1.default.startCase(lodash_1.default.camelCase(string)).split(' ').join(''));
}
