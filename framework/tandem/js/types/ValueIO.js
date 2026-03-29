"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
var ValueIO = new IOType_js_1.default('ValueIO', {
    isValidValue: _.stubTrue,
    supertype: IOType_js_1.default.ObjectIO,
    toStateObject: function (coreObject) { return coreObject; },
    fromStateObject: function (stateObject) { return stateObject; },
    stateSchema: StateSchema_js_1.default.asValue('*', { isValidValue: _.stubTrue })
});
tandemNamespace_js_1.default.register('ValueIO', ValueIO);
exports.default = ValueIO;
