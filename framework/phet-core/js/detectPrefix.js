"use strict";
// Copyright 2014-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Scans through potential properties on an object to detect prefixed forms, and returns the first match.
 *
 * E.g. currently:
 * phet.phetCore.detectPrefix( document.createElement( 'div' ).style, 'transform' ) === 'webkitTransform'
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
// @returns the best String str where obj[str] !== undefined, or returns undefined if that is not available
function detectPrefix(obj, name) {
    // @ts-expect-error
    if (obj[name] !== undefined) {
        return name;
    }
    // prepare for camelCase
    name = name.charAt(0).toUpperCase() + name.slice(1);
    // Chrome planning to not introduce prefixes in the future, hopefully we will be safe
    // @ts-expect-error
    if (obj["moz".concat(name)] !== undefined) {
        return "moz".concat(name);
    }
    // @ts-expect-error
    if (obj["Moz".concat(name)] !== undefined) {
        return "Moz".concat(name);
    } // some prefixes seem to have all-caps?
    // @ts-expect-error
    if (obj["webkit".concat(name)] !== undefined) {
        return "webkit".concat(name);
    }
    // @ts-expect-error
    if (obj["ms".concat(name)] !== undefined) {
        return "ms".concat(name);
    }
    // @ts-expect-error
    if (obj["o".concat(name)] !== undefined) {
        return "o".concat(name);
    }
    // @ts-expect-error
    return undefined;
}
phetCore_js_1.default.register('detectPrefix', detectPrefix);
exports.default = detectPrefix;
