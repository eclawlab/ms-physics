"use strict";
// Copyright 2019-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Like Lodash's _.merge, this will recursively merge nested options objects provided that the keys end in 'Options'
 * (case-sensitive) and they are pure object literals.
 * That is, they must be defined by `... = { ... }` or `somePropOptions: { ... }`.
 * Non object literals (arrays, functions, and inherited types) or anything with an extra prototype will all throw
 * assertion errors if passed in as an arg or as a value to a `*Options` field.
 *
 * @author Michael Barlow (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
// constants
var OPTIONS_SUFFIX = 'Options';
/**
 * @param  {Object} target - the object literal that will have keys set to it
 * @param  {...<Object|null>} sources
 */
function merge(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    (0, affirm_js_1.isAffirmEnabled)() && assertIsMergeable(target);
    (0, affirm_js_1.default)(target !== null, 'target should not be null'); // assertIsMergeable supports null
    (0, affirm_js_1.default)(sources.length > 0, 'at least one source expected');
    for (var i = 0; i < sources.length; i++) {
        var source = sources[i];
        if (source) {
            (0, affirm_js_1.isAffirmEnabled)() && assertIsMergeable(source);
            for (var property in source) {
                // Providing a value of undefined in the target doesn't override the default, see https://github.com/phetsims/phet-core/issues/111
                if (source.hasOwnProperty(property) && source[property] !== undefined) {
                    var sourceProperty = source[property];
                    // Recurse on keys that end with 'Options', but not on keys named 'Options'.
                    if (property.endsWith(OPTIONS_SUFFIX) && property !== OPTIONS_SUFFIX) {
                        // *Options property value cannot be undefined, if truthy, it we be validated with assertIsMergeable via recursion.
                        (0, affirm_js_1.default)(sourceProperty !== undefined, 'nested *Options should not be undefined');
                        target[property] = merge(target[property] || {}, sourceProperty);
                    }
                    else {
                        target[property] = sourceProperty;
                    }
                }
            }
        }
    }
    return target;
}
/**
 * TODO: can we remove assertIsMergeable? https://github.com/phetsims/phet-core/issues/128
 * Asserts that the object is compatible with merge. That is, it's a POJSO.
 * This function must be called like: isAffirmEnabled() && assertIsMergeable( arg );
 */
function assertIsMergeable(object) {
    (0, affirm_js_1.default)(object === null ||
        (object && typeof object === 'object' && Object.getPrototypeOf(object) === Object.prototype), 'object is not compatible with merge');
    if (object !== null) {
        // ensure that options keys are not ES5 setters or getters
        Object.keys(object).forEach(function (prop) {
            var ownPropertyDescriptor = Object.getOwnPropertyDescriptor(object, prop);
            (0, affirm_js_1.default)(!ownPropertyDescriptor.hasOwnProperty('set'), 'cannot use merge with an object that has a setter');
            (0, affirm_js_1.default)(!ownPropertyDescriptor.hasOwnProperty('get'), 'cannot use merge with an object that has a getter');
        });
    }
}
exports.default = merge;
