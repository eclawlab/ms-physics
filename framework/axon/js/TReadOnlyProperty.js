"use strict";
// Copyright 2021-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTReadOnlyProperty = isTReadOnlyProperty;
var ReadOnlyProperty_js_1 = require("./ReadOnlyProperty.js");
var TinyProperty_js_1 = require("./TinyProperty.js");
function isTReadOnlyProperty(something) {
    return something instanceof ReadOnlyProperty_js_1.default || something instanceof TinyProperty_js_1.default;
}
