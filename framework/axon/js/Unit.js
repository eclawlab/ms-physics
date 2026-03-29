"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitToStringOrNull = exports.unitToString = void 0;
// Convert a unit to a string - useful for phet-io
var unitToString = function (unit) {
    if (typeof unit === 'string') {
        return unit;
    }
    else {
        return unit.name;
    }
};
exports.unitToString = unitToString;
// Convert a unit (or null) to a string (or null) - useful for phet-io
var unitToStringOrNull = function (unit) {
    return unit === null ? null : (0, exports.unitToString)(unit);
};
exports.unitToStringOrNull = unitToStringOrNull;
