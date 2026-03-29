"use strict";
// Copyright 2015-2025, University of Colorado Boulder
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
 * String utilities used throughout chipper.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var lodash_1 = require("lodash");
// What divides the repo prefix from the rest of the string key, like `FRICTION/friction.title`
var NAMESPACE_PREFIX_DIVIDER = '/';
var A11Y_MARKER = 'a11y.';
// Matches { … } placeholders in fluent that are NOT variables. Note this will catch
// legacy patterns like {$0} and {{value}}. Use `isLegacyStringPattern` to check for those.
var FLUENT_PLACEHOLDER_EXPRESSION = /\{\s*(?!\$)([^\s}]+)\s*\}/gu;
var ChipperStringUtils = {
    /**
     * Pad LTR/RTL language values with unicode embedding marks (see https://github.com/phetsims/joist/issues/152)
     * Uses directional formatting characters: http://unicode.org/reports/tr9/#Directional_Formatting_Characters
     *
     * @returns the input string padded with the embedding marks, or an empty string if the input was empty
     */
    addDirectionalFormatting: function (str, isRTL) {
        if (str.length > 0) {
            return "".concat((isRTL ? '\u202b' : '\u202a') + str, "\u202C");
        }
        else {
            return str;
        }
    },
    /**
     * Appends spaces to a string
     *
     * @param str - the input string
     * @param n - number of spaces to append
     * @returns a new string
     */
    padString: function (str, n) {
        while (str.length < n) {
            str += ' ';
        }
        return str;
    },
    /**
     * Replaces all occurrences of {string} find with {string} replace in {string} str
     *
     * @param str - the input string
     * @param find - the string to find
     * @param replaceWith - the string to replace find with
     * @returns a new string
     */
    replaceAll: function (str, find, replaceWith) {
        return str.replace(new RegExp(find.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replaceWith);
    },
    // TODO chipper#316 determine why this behaves differently than str.replace for some cases (eg, 'MAIN_INLINE_JAVASCRIPT')
    /**
     * Replaces the first occurrence of {string} find with {string} replaceWith in {string} str
     *
     * @param str - the input string
     * @param find - the string to find
     * @param replaceWith - the string to replace find with
     * @returns a new string
     */
    replaceFirst: function (str, find, replaceWith) {
        var idx = str.indexOf(find);
        if (str.includes(find)) {
            return str.slice(0, idx) + replaceWith + str.slice(idx + find.length);
        }
        else {
            return str;
        }
    },
    /**
     * Returns a string with all of the keys of the mapping replaced with the values.
     */
    replacePlaceholders: function (str, mapping) {
        Object.keys(mapping).forEach(function (key) {
            var replacement = mapping[key];
            key = "{{".concat(key, "}}");
            var index;
            while ((index = str.indexOf(key)) >= 0) {
                str = str.slice(0, index) + replacement + str.slice(index + key.length);
            }
        });
        Object.keys(mapping).forEach(function (key) {
            if (str.includes("{{".concat(key, "}}"))) {
                throw new Error("Template string detected in placeholders: ".concat(key, "\n\n").concat(str.slice(0, str.indexOf("{{".concat(key, "}}")) + 10)));
            }
        });
        return str;
    },
    /**
     * Recurse through a string file and format each string value appropriately
     * @param stringMap
     * @param isRTL - is right to left language
     * @param [assertNoWhitespace] - when true, assert that trimming each string value doesn't change the string.
     */
    formatStringValues: function (stringMap, isRTL, assertNoWhitespace) {
        ChipperStringUtils.forEachString(stringMap, function (key, stringObject) {
            assert_1.default && assertNoWhitespace && (0, assert_1.default)(stringObject.value === stringObject.value.trim(), "String should not have trailing or leading whitespace, key: ".concat(key, ", value: \"").concat(stringObject.value, "\""));
            // remove leading/trailing whitespace, see chipper#619. Do this before addDirectionalFormatting
            stringObject.value = ChipperStringUtils.addDirectionalFormatting(stringObject.value.trim(), isRTL);
        });
    },
    /**
     * Given a key, get the appropriate string from the "map" object, or null if the key does not appear in the map.
     * This method is called in unbuilt mode from the string plugin and during the build via CHIPPER/getStringFileMap.
     * This method supports recursing through keys that support string nesting. This method was created to support
     * nested string keys in https://github.com/phetsims/rosetta/issues/193
     * @param map - where an "intermediate" Object should hold nested strings
     * @param key - like `FRICTION/friction.title` or using nesting like `a11y.nested.string.here`
     * @returns - the string entry of the key, or null if the key does not appear in the map
     * @throws  {Error} - if the key doesn't hold a string value in the map
     */
    getStringEntryFromMap: function (map, key) {
        if (key.includes(NAMESPACE_PREFIX_DIVIDER)) {
            throw new Error('getStringEntryFromMap key should not have REPO/');
        }
        // Lodash gives precedence to  "key1.key2" over "key1:{key2}", so we do too.
        var result = lodash_1.default.at(map, key)[0];
        if (result) {
            if (result.value === undefined) {
                throw new Error("no value for string: ".concat(key));
            }
            if (typeof result.value !== 'string') {
                throw new Error("value should be a string for key ".concat(key));
            }
            return result;
        }
        // They key does not appear in the map
        return null;
    },
    /**
     * @param key - without "string!REPO" at the beginning, just the actual "string key"
     */
    isA11yStringKey: function (key) {
        return key.startsWith(ChipperStringUtils.A11Y_MARKER);
    },
    /**
     * Creates a key that can be used in a fluent file. Converting all underscores, dots, and
     * non-alphanumeric characters into underscores.
     *
     * @param dotSeparatedKey - a key like 'a11y.some.thing.accessibleName'
     */
    createFluentKey: function (dotSeparatedKey) {
        return dotSeparatedKey.replace(/[^a-zA-Z0-9]/g, '_');
    },
    /**
     * Replace every fluent reference key in the string with a canonical form for Fluent.
     * This is often used to convert dot separated keys into underscore separated keys.
     *
     * This function will not touch legacy patterns like {{value}} or {$0} that are not
     * compatible with fluent. It will also not match variable placeholders like { $variable }.
     */
    replaceFluentReferences: function (str) {
        if (ChipperStringUtils.isLegacyStringPattern(str)) {
            return str;
        }
        function canonicalisePlaceholder(_match, key) {
            var canonical = ChipperStringUtils.createFluentKey(key.trim());
            return "{ ".concat(canonical, " }"); // so that spacing is normalized
        }
        // These needs to use a string replace instead of using the FLuent AST visitor because
        // dot notation in variable references is not valid syntax in Fluent and therefore
        // the AST visitor will not find it.
        return str.replace(FLUENT_PLACEHOLDER_EXPRESSION, canonicalisePlaceholder);
    },
    /**
     * If the string uses the legacy pattern form, it won't be compatible with Fluent.
     * If it uses double curly braces for StringUtils.fillIn, Fluent will try to find the inner term and likely fail.
     * If it uses single curly surrounding a number, it is intended for StringUtils.format.
     *
     * NOTE: Rosetta has similar logic to determine how to highlight strings with patterns, but rosetta does not use
     * this implementation.
     */
    isLegacyStringPattern: function (str) {
        return str.includes('{{') || str.includes('}}') || /{\d+}/.test(str);
    },
    /**
     * Creates a full Fluent (FTL) file string from the provided FluentData values.
     */
    createFluentFileFromData: function (fluentData) {
        var ftl = '';
        for (var _i = 0, fluentData_1 = fluentData; _i < fluentData_1.length; _i++) {
            var entry = fluentData_1[_i];
            ftl += "".concat(entry.fluentKey, " = ").concat(entry.value, "\n");
        }
        return ftl;
    },
    /**
     * Flattens the nested “string-file” JSON structure into a Map so that each
     * keys, fluent keys, and values can be easily worked with.
     *   dot-path            → { fluentKey: dot_path, value: 'Some string' }
     *
     * Example
     * -------
     *   {
     *     screen1: {
     *       title: { value: 'Screen 1' }
     *     }
     *   }
     *
     * => Map entry:  'screen1.title' → { fluentKey: 'screen1_title', value: 'Screen 1' }
     *
     * Implementation notes
     * --------------------
     * • Depth-first traversal: `trail` holds the property path as we descend.
     * • A node is considered a leaf when it is an object that owns a `value` property
     */
    getFluentKeyMap: function (messages) {
        var result = new Map();
        var visit = function (node, trail) {
            if (node && typeof node === 'object' && !Array.isArray(node) && 'value' in node) {
                var jsonKey = trail.join('.');
                result.set(jsonKey, {
                    fluentKey: ChipperStringUtils.createFluentKey(jsonKey),
                    // Replace any dots in references in the string value to underscores so that it is compatible with Fluent.
                    // This allows PhET developers to use dot notation in the references which is more familiar.
                    value: ChipperStringUtils.replaceFluentReferences(node.value)
                });
                return;
            }
            // Recurse through nested objects
            if (node && typeof node === 'object') {
                for (var _i = 0, _a = Object.entries(node); _i < _a.length; _i++) {
                    var _b = _a[_i], k = _b[0], v = _b[1];
                    visit(v, __spreadArray(__spreadArray([], trail, true), [k], false));
                }
            }
        };
        visit(messages, []);
        return result;
    },
    /**
     * The start of any a11y specific string key.
     */
    A11Y_MARKER: A11Y_MARKER,
    /**
     * Call a function on each object with a "value" attribute in an object tree.
     * @param map - string map, like a loaded JSON strings file
     * @param func
     * @param keySoFar - while recursing, build up a string of the key separated with dots.
     */
    forEachString: function (map, func, keySoFar) {
        if (keySoFar === void 0) { keySoFar = ''; }
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                var nextKey = keySoFar ? "".concat(keySoFar, ".").concat(key) : key; // don't start with period, assumes '' is falsey
                var stringObject = map[key];
                // no need to support non-object, null, or arrays in the string map, for example stringObject.history in
                // locale specific files.
                if (typeof stringObject !== 'object' || stringObject === null || Array.isArray(stringObject)) {
                    continue;
                }
                if (stringObject.value) {
                    func(nextKey, stringObject);
                }
                // recurse to the next level since if it wasn't the `value` key
                key !== 'value' && ChipperStringUtils.forEachString(stringObject, func, nextKey);
            }
        }
    }
};
exports.default = ChipperStringUtils;
