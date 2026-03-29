"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemoizerForLocale = getMemoizerForLocale;
var cache = new Map();
function getMemoizerForLocale(locales) {
    var stringLocale = Array.isArray(locales) ? locales.join(" ") : locales;
    var memoizer = cache.get(stringLocale);
    if (memoizer === undefined) {
        memoizer = new Map();
        cache.set(stringLocale, memoizer);
    }
    return memoizer;
}
