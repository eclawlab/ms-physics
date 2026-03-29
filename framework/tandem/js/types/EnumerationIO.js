"use strict";
// Copyright 2022-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var IOTypeCache_js_1 = require("../IOTypeCache.js");
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
var StateSchema_js_1 = require("./StateSchema.js");
// Cache each parameterized IOType so that it is only created once.
var cache = new IOTypeCache_js_1.default();
var joinKeys = function (keys) { return keys.join('|'); };
var EnumerationIO = function (enumerationContainer) {
    var enumeration = enumerationContainer.enumeration;
    // This caching implementation should be kept in sync with the other parametric IOType caching implementations.
    if (!cache.has(enumeration)) {
        // Enumeration supports additional documentation, so the values can be described.
        var additionalDocs = enumeration.phetioDocumentation ? " ".concat(enumeration.phetioDocumentation) : '';
        var keys_1 = enumeration.keys;
        var values = enumeration.values;
        var ioTypeName_1 = "EnumerationIO(".concat(joinKeys(keys_1), ")");
        assert && assert(!Array.from(cache.values()).find(function (ioType) { return ioType.typeName === ioTypeName_1; }), 'There was already another IOType with the same name: ' + ioTypeName_1);
        cache.set(enumeration, new IOType_js_1.default(ioTypeName_1, {
            validValues: values,
            documentation: "Possible values: ".concat(keys_1.join(', '), ".").concat(additionalDocs),
            toStateObject: function (value) { return enumeration.getKey(value); },
            fromStateObject: function (stateObject) {
                assert && assert(typeof stateObject === 'string', 'unsupported EnumerationIO value type, expected string'); // eslint-disable-line phet/no-simple-type-checking-assertions
                assert && assert(keys_1.includes(stateObject), "Unrecognized value: ".concat(stateObject));
                return enumeration.getValue(stateObject);
            },
            stateSchema: StateSchema_js_1.default.asValue("".concat(joinKeys(keys_1)), {
                isValidValue: function (key) { return keys_1.includes(key); }
            })
        }));
    }
    return cache.get(enumeration);
};
tandemNamespace_js_1.default.register('EnumerationIO', EnumerationIO);
exports.default = EnumerationIO;
