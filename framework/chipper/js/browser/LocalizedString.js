"use strict";
// Copyright 2022-2026, University of Colorado Boulder
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Sets up a system of Properties to handle translation fallback and phet-io support for a single translated string.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var TinyProperty_js_1 = require("../../../axon/js/TinyProperty.js");
var localeProperty_js_1 = require("../../../joist/js/i18n/localeProperty.js");
var arrayRemove_js_1 = require("../../../phet-core/js/arrayRemove.js");
var Tandem_js_1 = require("../../../tandem/js/Tandem.js");
var LocalizedStringProperty_js_1 = require("./LocalizedStringProperty.js");
var localizedStrings_js_1 = require("./localizedStrings.js");
// constants
var FALLBACK_LOCALE = 'en';
var localeData = phet.chipper.localeData;
assert && assert(localeData, 'localeData expected but global has not been set');
var LocalizedString = /** @class */ (function () {
    function LocalizedString(stringKey, 
    // Store initial values, so we can handle state deltas
    localeToTranslationMap, tandem, metadata) {
        this.stringKey = stringKey;
        this.localeToTranslationMap = localeToTranslationMap;
        // Uses lazy creation of locales
        this.localePropertyMap = new Map();
        // Store initial values, so we can handle state deltas
        this.initialValues = {};
        this.property = new LocalizedStringProperty_js_1.default(this, tandem, metadata);
        // Add to a global list to support PhET-iO serialization and internal testing
        localizedStrings_js_1.default.push(this);
    }
    /**
     * Returns an object that shows the changes of strings from their initial values. This includes whether strings are
     * marked as "overridden"
     */
    LocalizedString.prototype.getStateDelta = function () {
        var _this = this;
        var result = {};
        this.usedLocales.forEach(function (locale) {
            var initialValue = _this.initialValues[locale];
            var currentValue = _this.getLocaleSpecificProperty(locale).value;
            if (currentValue !== initialValue) {
                result[locale] = currentValue;
            }
        });
        return result;
    };
    /**
     * Take a state from getStateDelta, and apply it.
     */
    LocalizedString.prototype.setStateDelta = function (state) {
        var _this = this;
        // Create potential new locales (since locale-specific Properties are lazily created as needed
        Object.keys(state).forEach(function (locale) { return _this.getLocaleSpecificProperty(locale); });
        this.usedLocales.forEach(function (locale) {
            var localeSpecificProperty = _this.getLocaleSpecificProperty(locale);
            var initialValue = _this.initialValues[locale];
            assert && assert(initialValue !== undefined);
            var stateValue = state[locale] !== undefined ? state[locale] : null;
            localeSpecificProperty.value = stateValue !== null && stateValue !== void 0 ? stateValue : initialValue;
        });
    };
    Object.defineProperty(LocalizedString.prototype, "usedLocales", {
        get: function () {
            return __spreadArray([], this.localePropertyMap.keys(), true);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the locale-specific Property for any locale (lazily creating it if necessary)
     */
    LocalizedString.prototype.getLocaleSpecificProperty = function (locale) {
        // Lazy creation
        if (!this.localePropertyMap.has(locale)) {
            // Locales in order of fallback
            var orderedLocales = LocalizedString.getLocaleFallbacks(locale);
            // Find the first-defined value
            var initialValue = null;
            for (var _i = 0, orderedLocales_1 = orderedLocales; _i < orderedLocales_1.length; _i++) {
                var locale_1 = orderedLocales_1[_i];
                if (this.localeToTranslationMap[locale_1] !== undefined) {
                    initialValue = this.localeToTranslationMap[locale_1];
                    break;
                }
            }
            // Should be guaranteed because of `en` as a fallback
            assert && assert(initialValue !== undefined, 'no initial value found for', locale);
            this.initialValues[locale] = initialValue;
            this.localePropertyMap.set(locale, new TinyProperty_js_1.default(initialValue));
        }
        return this.localePropertyMap.get(locale);
    };
    LocalizedString.prototype.dispose = function () {
        this.property.dispose();
        (0, arrayRemove_js_1.default)(localizedStrings_js_1.default, this);
    };
    /**
     * Reset to the initial value for the specified locale, used for testing.
     */
    LocalizedString.prototype.restoreInitialValue = function (locale) {
        assert && assert(typeof this.initialValues[locale] === 'string', 'initial value expected for', locale);
        this.property.value = this.initialValues[locale];
    };
    LocalizedString.getLocaleFallbacks = function (locale) {
        if (locale === void 0) { locale = localeProperty_js_1.default.value; }
        return _.uniq(__spreadArray(__spreadArray([
            locale
        ], (localeData[locale].fallbackLocales || []), true), [
            FALLBACK_LOCALE
        ], false));
    };
    /**
     * Computes a nested map of LocalizedStringProperties from a nested input structure of strings.
     * The string Properties will change values based on the current locale
     * (stored in localeProperty).
     *
     * For instance, if we have an example StringMap:
     *
     * const stringMap = {
     *   en: {
     *     a: 'a',
     *     nest: {
     *       x: 'x',
     *       y: 'y'
     *     }
     *   },
     *   hi: {
     *     'a': 'ए',
     *     'b': 'ब',
     *     nest: {
     *       x: 'एक्स',
     *     }
     *   }
     * }
     *
     * Then the resulting LocalizedString.getNestedStringProperties( stringMap ) would
     * have the structure:
     *
     * {
     *   aStringProperty: LocalizedStringProperty,
     *   bStringProperty: LocalizedStringProperty,
     *   nest: {
     *     xStringProperty: LocalizedStringProperty,
     *     yStringProperty: LocalizedStringProperty
     *   }
     * }
     *
     * It is recommended to put each translation file into a separate JSON file,
     * and import them into a single file that will be passed to this function.
     *
     * @param stringData
     */
    LocalizedString.getNestedStringProperties = function (stringData) {
        var locales = Object.keys(stringData);
        // We will stuff data into here.
        var result = {};
        // Given an array of keys (e.g. [ 'a', 'b', 'c' ]), look up the value in the stringData.
        // E.g. stringData[ locale ].a?.b?.c
        var lookupWithLocale = function (keys, locale) {
            var object = stringData[locale];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (object) {
                    // @ts-expect-error
                    object = object[key];
                }
            }
            return object;
        };
        // Recursively construct the map, appending more keys as we go.
        var recur = function (keys) {
            // All potential keys of the next level.
            // Some will be for strings, some will be for nested objects.
            var potentialKeys = _.sortBy(_.uniq(locales.map(function (locale) {
                var object = lookupWithLocale(keys, locale);
                return object ? Object.keys(object) : [];
            }).flat()));
            for (var _i = 0, potentialKeys_1 = potentialKeys; _i < potentialKeys_1.length; _i++) {
                var key = potentialKeys_1[_i];
                var nextKeys = __spreadArray(__spreadArray([], keys, true), [key], false);
                // Is the key for a string (and if so, what locales is it defined for?)
                var isString = true;
                var stringLocales = [];
                for (var _a = 0, locales_1 = locales; _a < locales_1.length; _a++) {
                    var locale = locales_1[_a];
                    var object = lookupWithLocale(keys, locale);
                    if (object) {
                        var value = object[key];
                        if (typeof value === 'string') {
                            stringLocales.push(locale);
                        }
                        else {
                            isString = false;
                        }
                    }
                }
                if (isString) {
                    assert && assert(stringLocales.length > 0);
                    // Build the map with string values
                    var map = {};
                    for (var _b = 0, stringLocales_1 = stringLocales; _b < stringLocales_1.length; _b++) {
                        var locale = stringLocales_1[_b];
                        map[locale] = lookupWithLocale(nextKeys, locale);
                    }
                    // If there is no "fallback" entry, put it in as a fallback manually
                    // (so we will always have a string)
                    if (!stringLocales.includes(FALLBACK_LOCALE)) {
                        map[FALLBACK_LOCALE] = map[stringLocales[0]];
                    }
                    var stringProperty = new LocalizedStringProperty_js_1.default(new LocalizedString(nextKeys.join('.'), map, Tandem_js_1.default.OPT_OUT), Tandem_js_1.default.OPT_OUT);
                    _.set(result, __spreadArray(__spreadArray([], keys, true), ["".concat(key, "StringProperty")], false), stringProperty);
                }
                else {
                    recur(nextKeys);
                }
            }
        };
        recur([]);
        return result;
    };
    return LocalizedString;
}());
exports.default = LocalizedString;
