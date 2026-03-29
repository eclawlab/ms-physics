"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This implementation auto-detects the enumeration values by Object.keys and instanceof. Every property that has a
 * type matching the enumeration type is marked as a value.  See sample usage in Orientation.ts.
 *
 * For general pattern see https://github.com/phetsims/phet-info/blob/main/doc/phet-software-design-patterns.md#enumeration
 *
 * This creates 2-way maps (key-to-value and value-to-key) for ease of use and to enable phet-io serialization.
 *
 * class T extends EnumerationValue {
 *     static a=new T();
 *     static b =new T();
 *     getName(){return 'he';}
 *     get thing(){return 'text';}
 *     static get age(){return 77;}
 *     static enumeration = new Enumeration( T );
 * }
 * T.enumeration.keys => ['a', 'b']
 * T.enumeration.values => [T, T]
 *
 * Note how `keys` only picks up 'a' and 'b'.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var EnumerationValue_js_1 = require("./EnumerationValue.js");
var inheritance_js_1 = require("./inheritance.js");
var optionize_js_1 = require("./optionize.js");
var phetCore_js_1 = require("./phetCore.js");
var Enumeration = /** @class */ (function () {
    function Enumeration(Enumeration, providedOptions) {
        var _this = this;
        var options = (0, optionize_js_1.default)()({
            phetioDocumentation: '',
            // Values are plucked from the supplied Enumeration, but in order to support subtyping (augmenting) Enumerations,
            // you can specify the rule for what counts as a member of the enumeration. This should only be used in the
            // special case of augmenting existing enumerations.
            instanceType: Enumeration
        }, providedOptions);
        this.phetioDocumentation = options.phetioDocumentation;
        var instanceType = options.instanceType;
        // Iterate over the type hierarchy to support augmenting enumerations, but reverse so that newly added enumeration
        // values appear after previously existing enumeration values
        var types = (0, inheritance_js_1.default)(Enumeration).reverse();
        (0, affirm_js_1.default)(types.includes(instanceType), 'the specified type should be in its own hierarchy');
        this.keys = [];
        this.values = [];
        types.forEach(function (type) {
            Object.keys(type).forEach(function (key) {
                var value = type[key];
                if (value instanceof instanceType) {
                    (0, affirm_js_1.default)(key === key.toUpperCase(), 'keys should be upper case by convention');
                    _this.keys.push(key);
                    _this.values.push(value);
                    // Only assign this to the lowest Enumeration in the hierarchy. Otherwise this would overwrite the
                    // supertype-assigned Enumeration. See https://github.com/phetsims/phet-core/issues/102
                    if (value instanceof Enumeration) {
                        value.name = key;
                        value.enumeration = _this;
                    }
                }
            });
        });
        (0, affirm_js_1.default)(this.keys.length > 0, 'no keys found');
        (0, affirm_js_1.default)(this.values.length > 0, 'no values found');
        this.Enumeration = Enumeration;
        EnumerationValue_js_1.default.sealedCache.add(Enumeration);
    }
    Enumeration.prototype.getKey = function (value) {
        return value.name;
    };
    Enumeration.prototype.getValue = function (key) {
        return this.Enumeration[key];
    };
    Enumeration.prototype.includes = function (value) {
        return this.values.includes(value);
    };
    return Enumeration;
}());
phetCore_js_1.default.register('Enumeration', Enumeration);
exports.default = Enumeration;
