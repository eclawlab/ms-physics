"use strict";
// Copyright 2024-2026, University of Colorado Boulder
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
 * Computes the subset of localeData that should be shipped with a built simulation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
/**
 * Returns a subset of the localeData that should be included in the built simulation.
 *
 * @param localesWithTranslations - Array of locales that have translations
 */
exports.default = (function (localesWithTranslations) {
    // Load localeData
    var fullLocaleData = JSON.parse(fs_1.default.readFileSync('../babel/localeData.json', 'utf8'));
    // Include a (larger) subset of locales' localeData. It will need more locales than just the locales directly specified
    // in phet.chipper.strings (the stringMap). We also need locales that will fall back to ANY of those locales in phet.chipper.strings,
    // e.g. if we have an "es" translation, we will include the locale data for "es_PY" because it falls back to "es".
    var includedDataLocales = lodash_1.default.uniq(__spreadArray(__spreadArray([
        // Always include the fallback (en)
        ChipperConstants_js_1.default.FALLBACK_LOCALE
    ], localesWithTranslations, true), Object.keys(fullLocaleData).filter(function (locale) {
        return fullLocaleData[locale].fallbackLocales && fullLocaleData[locale].fallbackLocales.some(function (fallbackLocale) {
            return localesWithTranslations.includes(fallbackLocale);
        });
    }), true));
    // If a locale is NOT included, and has no fallbacks that are included, BUT IS the fallback for another locale, we
    // should include it. For example, if we have NO "ak" translation, but we have a "tw" translation (which falls back to
    // "ak"), we will want to include "ak" (even though it won't ever contain non-English string translation), because we
    // may want to reference it (and want to not have "broken" locale links localeData).
    // This array would get longer as we iterate through it.
    for (var i = 0; i < includedDataLocales.length; i++) {
        var locale = includedDataLocales[i];
        // If our locale is included, we should make sure all of its fallbackLocales are included
        var fallbackLocales = fullLocaleData[locale].fallbackLocales;
        if (fallbackLocales) {
            for (var _i = 0, fallbackLocales_1 = fallbackLocales; _i < fallbackLocales_1.length; _i++) {
                var fallbackLocale = fallbackLocales_1[_i];
                if (!includedDataLocales.includes(fallbackLocale)) {
                    includedDataLocales.push(fallbackLocale);
                }
            }
        }
    }
    // The set of locales included in generated (subset of) localeData for this specific built simulation file
    // is satisfied by the following closure:
    //
    // 1. If a locale has a translation, include that locale.
    // 2. If one of a locale's localeData[ locale ].fallbackLocales is translated, include that locale.
    // 3. If a locale is in an included localeData[ someOtherLocale ].fallbackLocales, include that locale.
    // 4. Always include the default locale "en".
    var localeData = {};
    for (var _a = 0, _b = lodash_1.default.sortBy(includedDataLocales); _a < _b.length; _a++) {
        var locale = _b[_a];
        localeData[locale] = fullLocaleData[locale];
    }
    return localeData;
});
