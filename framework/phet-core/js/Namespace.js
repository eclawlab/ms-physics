"use strict";
// Copyright 2015-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * For debugging or usage in the console, Namespace associates modules with a namespaced global for use in the browser.
 * This does not work in Node.js.
 *
 * @author Jonathan Olson
 * @author Chris Malley (PixelZoom, Inc.)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var Namespace = /** @class */ (function () {
    function Namespace(name) {
        var _a, _b;
        this.name = name;
        // Unsupported in Node.js
        if (!globalThis.hasOwnProperty('window')) {
            return;
        }
        if (globalThis.phet) {
            // We already create the chipper namespace, so we just attach to it with the register function.
            if (name === 'chipper') {
                globalThis.phet.chipper = globalThis.phet.chipper || {};
                globalThis.phet.chipper.name = 'chipper';
                globalThis.phet.chipper.register = this.register.bind(globalThis.phet.chipper);
                return globalThis.phet.chipper; // eslint-disable-line -- we want to provide the namespace API on something already existing
            }
            else {
                // TODO: Ideally we should always assert this, but in PhET-iO wrapper code, multiple built modules define the
                //       same namespace, this should be fixed in https://github.com/phetsims/phet-io-wrappers/issues/631
                var ignoreAssertion = !((_b = (_a = globalThis.phet) === null || _a === void 0 ? void 0 : _a.chipper) === null || _b === void 0 ? void 0 : _b.brand) || name === 'joist'; // SceneryStack also needs to declare a joist object.
                (0, affirm_js_1.isAffirmEnabled)() && !ignoreAssertion && (0, affirm_js_1.default)(!globalThis.phet[name], "namespace ".concat(name, " already exists"));
                globalThis.phet[name] = this;
            }
        }
    }
    /**
     * Registers a key-value pair with the namespace.
     *
     * If there are no dots ('.') in the key, it will be assigned to the namespace. For example:
     * - axon.register( 'A', A );
     * will set axon.A = A.
     *
     * If the key contains one or more dots ('.'), it's treated somewhat like a path expression. For instance, if the
     * following is called:
     * - axon.register( 'A.B.C', C );
     * then the register function will navigate to the object x.A.B and add x.A.B.C = C.
     */
    Namespace.prototype.register = function (key, value) {
        // Unsupported in Node.js
        if (!globalThis.hasOwnProperty('window')) {
            return value;
        }
        // When using hot module replacement, a module will be loaded and initialized twice, and hence its namespace.register
        // function will be called twice.  This should not be an assertion error.
        // If the key isn't compound (doesn't contain '.'), we can just look it up on this namespace
        if (key.includes('.')) {
            // @ts-expect-error
            (0, affirm_js_1.default)(!this[key], "".concat(key, " is already registered for namespace ").concat(this.name));
            // @ts-expect-error
            this[key] = value;
        }
        // Compound (contains '.' at least once). axon.register( 'A.B.C', C ) should set axon.A.B.C.
        else {
            var keys = key.split('.'); // e.g. [ 'A', 'B', 'C' ]
            // Walk into the namespace, verifying that each level exists. e.g. parent => x.A.B
            var parent_1 = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
            for (var i = 0; i < keys.length - 1; i++) { // for all but the last key
                // @ts-expect-error
                (0, affirm_js_1.default)(!!parent_1[keys[i]], "".concat([this.name].concat(keys.slice(0, i + 1)).join('.'), " needs to be defined to register ").concat(key));
                // @ts-expect-error
                parent_1 = parent_1[keys[i]];
            }
            // Write into the inner namespace, e.g. x.A.B[ 'C' ] = C
            var lastKey = keys[keys.length - 1];
            // @ts-expect-error
            (0, affirm_js_1.default)(!parent_1[lastKey], "".concat(key, " is already registered for namespace ").concat(this.name));
            // @ts-expect-error
            parent_1[lastKey] = value;
        }
        return value;
    };
    return Namespace;
}());
exports.default = Namespace;
