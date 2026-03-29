"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Given inheritance using inherit, this will give the full prototype chain.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
/*
 * @param type - Constructor for the type in question.
 * @returns - a list of the prototypes
 */
function inheritance(type) {
    var types = [type];
    var proto = type.prototype;
    while (proto && (proto = Object.getPrototypeOf(proto))) {
        if (proto.constructor) {
            types.push(proto.constructor);
        }
    }
    return types;
}
phetCore_js_1.default.register('inheritance', inheritance);
exports.default = inheritance;
