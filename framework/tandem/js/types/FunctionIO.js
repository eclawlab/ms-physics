"use strict";
// Copyright 2018-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var IOTypeCache_js_1 = require("../IOTypeCache.js");
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var IOType_js_1 = require("./IOType.js");
// cache each parameterized IOType so that it is only created once
var cache = new IOTypeCache_js_1.default();
/**
 * Parametric IOType constructor--given return type and parameter types, this function returns a type wrapped IOType for
 * that "class" of functions. "Class" here refers to the supported parameter and return IOTypes.
 * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
 * @param returnType - IOType of the return type of the function that can support cross-frame serialization
 * @param functionParameterTypes - IOTypes for the individual arguments of the function.
 */
var FunctionIO = function (returnType, functionParameterTypes) {
    for (var i = 0; i < functionParameterTypes.length; i++) {
        assert && assert(functionParameterTypes[i], 'parameter type was not truthy');
    }
    assert && assert(returnType, 'return type was not truthy');
    // REVIEW https://github.com/phetsims/tandem/issues/169 Why is this different than the typeName later in this file?
    var cacheKey = "".concat(returnType.typeName, ".").concat(functionParameterTypes.map(function (type) { return type.typeName; }).join(','));
    if (!cache.has(cacheKey)) {
        // gather a list of argument names for the documentation string
        var argsString = functionParameterTypes.map(function (parameterType) { return parameterType.typeName; }).join(', ');
        if (argsString === '') {
            argsString = 'none';
        }
        var parameterTypesString = functionParameterTypes.map(function (parameterType) { return parameterType.typeName; }).join(',');
        cache.set(cacheKey, new IOType_js_1.default("FunctionIO(".concat(parameterTypesString, ")=>").concat(returnType.typeName), {
            valueType: 'function',
            isFunctionType: true,
            // These are the parameters to this FunctionIO, not to the function it wraps. That is why it includes the return type.
            // NOTE: the order is very important, for instance phetioCommandProcessor relies on the parameters being before
            // the return type.  If we decide this is too brittle, perhaps we should subclass IOType to FunctionIOType, and it
            // can track its functionParameterTypes separately from the returnType.
            parameterTypes: functionParameterTypes.concat([returnType]),
            documentation: "".concat('Wrapper for the built-in JS function type.<br>' +
                '<strong>Arguments:</strong> ').concat(argsString, "<br>") +
                "<strong>Return Type:</strong> ".concat(returnType.typeName)
        }));
    }
    return cache.get(cacheKey);
};
tandemNamespace_js_1.default.register('FunctionIO', FunctionIO);
exports.default = FunctionIO;
