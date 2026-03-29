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
 * The main Property for a translated string (subtyped so we can get the stringKey, or other things in the future).
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var DynamicProperty_js_1 = require("../../../axon/js/DynamicProperty.js");
var localeProperty_js_1 = require("../../../joist/js/i18n/localeProperty.js");
var TandemConstants_js_1 = require("../../../tandem/js/TandemConstants.js");
var StringIO_js_1 = require("../../../tandem/js/types/StringIO.js");
var LocalizedStringProperty = /** @class */ (function (_super) {
    __extends(LocalizedStringProperty, _super);
    function LocalizedStringProperty(localizedString, tandem, metadata) {
        var _this = this;
        // Allow phetioReadOnly to be overridden
        var phetioReadOnly = (metadata && typeof metadata.phetioReadOnly === 'boolean') ? metadata.phetioReadOnly :
            TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioReadOnly;
        // All i18n model strings are phetioFeatured by default
        var phetioFeatured = (metadata && typeof metadata.phetioFeatured === 'boolean') ? metadata.phetioFeatured : true;
        // Allow phetioDocumentation to be overridden
        var phetioDocumentation = (metadata && typeof metadata.phetioDocumentation === 'string') ? metadata.phetioDocumentation :
            TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDocumentation;
        _this = _super.call(this, localeProperty_js_1.default, {
            // localeProperty isn't a Property<Property<X>>, so derive() maps the localeProperty to a Property we can use.
            derive: function (locale) { return localizedString.getLocaleSpecificProperty(locale); },
            // This property should update the localizedString's TinyProperty too.
            bidirectional: true,
            // phet-io issues
            phetioValueType: StringIO_js_1.default,
            phetioState: false,
            tandem: tandem,
            phetioFeatured: phetioFeatured,
            phetioReadOnly: phetioReadOnly,
            phetioDocumentation: phetioDocumentation
        }) || this;
        _this.localizedString = localizedString;
        return _this;
    }
    Object.defineProperty(LocalizedStringProperty.prototype, "stringKey", {
        get: function () {
            return this.localizedString.stringKey;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a translation-specific Property for the given locale. This Property will not change when the localeProperty
     * (current locale) changes, but instead will only change during translation updates, stringTests, etc.
     */
    LocalizedStringProperty.prototype.getTranslatedStringProperty = function (locale) {
        return this.localizedString.getLocaleSpecificProperty(locale);
    };
    return LocalizedStringProperty;
}(DynamicProperty_js_1.default));
exports.default = LocalizedStringProperty;
