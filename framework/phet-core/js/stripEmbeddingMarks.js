"use strict";
// Copyright 2020-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Strips embedding marks out of a string. Embedding marks are added to support directional languages and PhET i18n in
 * general.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
function stripEmbeddingMarks(string) {
    return string.replace(/\u202a|\u202b|\u202c/g, '');
}
phetCore_js_1.default.register('stripEmbeddingMarks', stripEmbeddingMarks);
exports.default = stripEmbeddingMarks;
