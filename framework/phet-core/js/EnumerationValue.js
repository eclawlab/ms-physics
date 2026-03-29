"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * EnumerationValue is the base class for enumeration value instances.
 * See https://github.com/phetsims/phet-info/blob/main/doc/phet-software-design-patterns.md#enumeration
 *
 * PhET's Enumeration pattern is:
 *
 * class MyEnumeration extends EnumerationValue {
 *   public static readonly VALUE_1 = new MyEnumeration();
 *   public static readonly VALUE_2 = new MyEnumeration();
 *
 *   // Make sure this is last, once all EnumerationValues have been declared statically.
 *   public static readonly enumeration = new Enumeration( MyEnumeration );
 * }
 *
 * // Usage
 * console.log( MyEnumeration.VALUE_1 );
 * const printValue = enumValue => {
 *   affirm( enumValue.enumeration.values.includes(enumValue));
 *   console.log( enumValue );
 * };
 * printValue( MyEnumeration.VALUE_2 );
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var phetCore_js_1 = require("./phetCore.js");
var EnumerationValue = /** @class */ (function () {
    function EnumerationValue() {
        var c = this.constructor;
        (0, affirm_js_1.default)(!EnumerationValue.sealedCache.has(c), 'cannot create instanceof of a sealed constructor');
        this._name = null;
        this._enumeration = null;
    }
    EnumerationValue.prototype.toString = function () {
        return this.name;
    };
    // This method is unused, but needs to remain here so other types don't accidentally structurally match
    // enumeration values.  Without this, string satisfies the EnumerationValue interface, but we don't want it to.
    EnumerationValue.prototype.isEnumerationValue = function () { return true; };
    Object.defineProperty(EnumerationValue.prototype, "name", {
        get: function () {
            (0, affirm_js_1.default)(this._name, 'name cannot be retrieved until it has been filled in by Enumeration.');
            return this._name;
        },
        set: function (name) {
            (0, affirm_js_1.default)(!this._name, 'name cannot be changed once defined.');
            this._name = name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnumerationValue.prototype, "enumeration", {
        get: function () {
            (0, affirm_js_1.default)(this._enumeration, 'enumeration cannot be retrieved until it has been filled in by Enumeration.');
            return this._enumeration;
        },
        set: function (enumeration) {
            (0, affirm_js_1.default)(!this._enumeration, 'enumeration cannot be changed once defined.');
            this._enumeration = enumeration;
        },
        enumerable: false,
        configurable: true
    });
    // After an Enumeration is constructed, no new instances of that exact type can be made (though it is OK to
    // create subtypes)
    EnumerationValue.sealedCache = new Set();
    return EnumerationValue;
}());
phetCore_js_1.default.register('EnumerationValue', EnumerationValue);
exports.default = EnumerationValue;
