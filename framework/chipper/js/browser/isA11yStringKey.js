"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isA11yStringKey;
/**
 * Returns true if a key is an accessibility string key. Often used to skip tests or other features where accessibility strings
 * are not supported yet.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
function isA11yStringKey(key) {
    return key.includes('/a11y.');
}
