"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FORMATTED_NUMBER_ACCESSIBLE_OPTIONS = exports.DEFAULT_FORMATTED_NUMBER_VISUAL_OPTIONS = void 0;
// Defaults for "visual" form of number formatting (e.g. for visual strings)
exports.DEFAULT_FORMATTED_NUMBER_VISUAL_OPTIONS = {
    decimalPlaces: null,
    showTrailingZeros: true, // We usually want fixed decimal places in visual strings
    showIntegersAsIntegers: false, // We usually want fixed decimal places in visual strings
    useScientificNotation: false,
    scientificBase: 10,
    replaceMinusWithNegative: false,
    wrapLTR: true // helps with embedding in RTL strings
};
// Defaults for "accessible" form of number formatting (e.g. for screen readers)
exports.DEFAULT_FORMATTED_NUMBER_ACCESSIBLE_OPTIONS = {
    decimalPlaces: null,
    showTrailingZeros: true,
    showIntegersAsIntegers: false,
    useScientificNotation: false,
    scientificBase: 10,
    replaceMinusWithNegative: false,
    wrapLTR: false
};
