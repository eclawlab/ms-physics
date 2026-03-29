"use strict";
// Copyright 2014-2026, University of Colorado Boulder
/* eslint-disable no-useless-concat */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Scans through potential event properties on an object to detect prefixed forms, and returns the first match.
 *
 * E.g. currently:
 * phet.phetCore.detectPrefixEvent( document, 'fullscreenchange' ) === 'webkitfullscreenchange'
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
// @returns the best String str where obj['on'+str] !== undefined, or returns undefined if that is not available
function detectPrefixEvent(obj, name) {
    // @ts-expect-error
    if (obj["on".concat(name)] !== undefined) {
        return name;
    }
    // Chrome planning to not introduce prefixes in the future, hopefully we will be safe
    // @ts-expect-error
    if (obj["".concat('on' + 'moz').concat(name)] !== undefined) {
        return "moz".concat(name);
    }
    // @ts-expect-error
    if (obj["".concat('on' + 'Moz').concat(name)] !== undefined) {
        return "Moz".concat(name);
    } // some prefixes seem to have all-caps?
    // @ts-expect-error
    if (obj["".concat('on' + 'webkit').concat(name)] !== undefined) {
        return "webkit".concat(name);
    }
    // @ts-expect-error
    if (obj["".concat('on' + 'ms').concat(name)] !== undefined) {
        return "ms".concat(name);
    }
    // @ts-expect-error
    if (obj["".concat('on' + 'o').concat(name)] !== undefined) {
        return "o".concat(name);
    }
    // @ts-expect-error
    return undefined;
}
phetCore_js_1.default.register('detectPrefixEvent', detectPrefixEvent);
exports.default = detectPrefixEvent;
