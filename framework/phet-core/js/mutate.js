"use strict";
// Copyright 2021-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generalized support for mutating objects that take ES5 getters/setters, similar to Node.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
var phetCore_js_1 = require("./phetCore.js");
/**
 * For example:
 *
 * mutate( something, [ 'left', 'right', 'top', 'bottom' ], { top: 0, left: 5 } );
 *
 * will be equivalent to:
 *
 * something.left = 5;
 * something.top = 0;
 *
 * First param will be mutated
 */
function mutate(target, orderedKeys, options) {
    (0, affirm_js_1.default)(target);
    (0, affirm_js_1.default)(Array.isArray(orderedKeys));
    if (!options) {
        return;
    }
    (0, affirm_js_1.default)(Object.getPrototypeOf(options) === Object.prototype, 'Extra prototype on options object is a code smell');
    lodash_js_1.default.each(orderedKeys, function (key) {
        // See https://github.com/phetsims/scenery/issues/580 for more about passing undefined.
        // @ts-expect-error
        (0, affirm_js_1.default)(!options.hasOwnProperty(key) || options[key] !== undefined, "Undefined not allowed for key: ".concat(key));
        // @ts-expect-error
        if (options[key] !== undefined) {
            // @ts-expect-error
            target[key] = options[key];
        }
    });
}
phetCore_js_1.default.register('mutate', mutate);
exports.default = mutate;
