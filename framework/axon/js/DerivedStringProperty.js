"use strict";
// Copyright 2023-2026, University of Colorado Boulder
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * DerivedStringProperty is typically used for strings that are derived from LocalizedStringProperty
 * (translatable strings, generated from the {{REPO}}-strings_en.json file via 'grunt modulify') and/or other instances
 * of DerivedStringProperty. Using this class ensures that code follows PhET-iO instrumentation standards,
 * and makes occurrences of this type of string Property easier to identify.
 *
 * Responsibilities include:
 *  - ensures that the derivation returns a string
 *  - adds proper PhET-iO metadata, with defaults that have been specified by PhET-iO design, which can be
 *    overridden where appropriate (e.g. phetioFeatured) and are not part of the public API where they should
 *    not be overridable (e.g. phetioValueType)
 *
 * Note that you can also use DerivedStringProperty for model/logic strings that are not translated. But you'll
 * need to consider whether you want to override the default of phetioFeatured: true, which was chosen as the default
 * for translated strings.
 *
 * See https://github.com/phetsims/phet-io/issues/1943
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var StringIO_js_1 = require("../../tandem/js/types/StringIO.js");
var axon_js_1 = require("./axon.js");
var DerivedProperty_js_1 = require("./DerivedProperty.js");
var DerivedStringProperty = /** @class */ (function (_super) {
    __extends(DerivedStringProperty, _super);
    function DerivedStringProperty(dependencies, derivation, providedOptions) {
        var options = (0, optionize_js_1.default)()({
            phetioFeatured: true, // featured by default, see https://github.com/phetsims/phet-io/issues/1943
            phetioValueType: StringIO_js_1.default,
            tandemNameSuffix: 'StringProperty' // Change only with caution
        }, providedOptions);
        return _super.call(this, dependencies, derivation, options) || this;
    }
    return DerivedStringProperty;
}(DerivedProperty_js_1.default));
exports.default = DerivedStringProperty;
axon_js_1.default.register('DerivedStringProperty', DerivedStringProperty);
