"use strict";
// Copyright 2013-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var toFixed_js_1 = require("../../../dot/js/util/toFixed.js");
var toFixedNumber_js_1 = require("../../../dot/js/util/toFixedNumber.js");
var affirm_js_1 = require("../../../perennial-alias/js/browser-and-node/affirm.js");
// Unicode embedding marks that we use.
var LTR = '\u202a';
var RTL = '\u202b';
var POP = '\u202c';
var StringUtils = {
    /**
     * NOTE: Please use StringUtils.fillIn instead of this function.
     *
     * http://mobzish.blogspot.com/2008/10/simple-messageformat-for-javascript.html
     * Similar to Java's MessageFormat, supports simple substitution, simple substitution only.
     * The full MessageFormat specification allows conditional formatting, for example to support pluralisation.
     *
     * Example:
     * > StringUtils.format( '{0} + {1}', 2, 3 )
     * "2 + 3"
     *
     * @param pattern pattern string, with N placeholders, where N is an integer
     * @param substitutionValues substitution values for the placeholders
     * @deprecated - please use StringUtils.fillIn
     */
    format: function (pattern) {
        var substitutionValues = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            substitutionValues[_i - 1] = arguments[_i];
        }
        // eslint-disable-next-line prefer-rest-params
        var args = arguments;
        return pattern.replace(/{(\d)}/g, function (r, n) { return args[+n + 1]; });
    },
    /**
     * Fills in a set of placeholders in a template.
     * Placeholders are specified with pairs of curly braces, e.g. '{{name}} is {{age}} years old'
     * See https://github.com/phetsims/phetcommon/issues/36
     *
     * Example:
     * > StringUtils.fillIn( '{{name}} is {{age}} years old', { name: 'Fred', age: 23 } )
     * "Fred is 23 years old"
     *
     * @param template - the template, containing zero or more placeholders
     * @param values - a hash whose keys correspond to the placeholder names, e.g. { name: 'Fred', age: 23 }
     *                          Unused keys are silently ignored. All placeholders do not need to be filled.
     */
    fillIn: function (template, values) {
        // @ts-expect-error
        template = (template && template.get) ? template.get() : template;
        (0, affirm_js_1.default)(typeof template === 'string', "invalid template: ".concat(template));
        // To catch attempts to use StringUtils.fillIn like StringUtils.format
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        (0, affirm_js_1.default)(values && typeof values === 'object', "invalid values: ".concat(values));
        var newString = template;
        // {string[]} parse out the set of placeholders
        var placeholders = template.match(/\{\{[^{}]+\}\}/g) || [];
        // replace each placeholder with its corresponding value
        for (var i = 0; i < placeholders.length; i++) {
            var placeholder = placeholders[i];
            // key is the portion of the placeholder between the curly braces
            var key = placeholder.replace('{{', '').replace('}}', '');
            if (values[key] !== undefined) {
                // Support Properties as values
                // @ts-expect-error
                var valueString = (values[key] && values[key].get) ? values[key].get() : values[key];
                newString = newString.replace(placeholder, valueString);
            }
        }
        return newString;
    },
    /**
     * @returns Whether this length-1 string is equal to one of the three directional embedding marks used.
     */
    isEmbeddingMark: function (chr) {
        return chr === LTR || chr === RTL || chr === POP;
    },
    /**
     * Given a string with embedding marks, this function returns an equivalent string.slice() but prefixes and suffixes
     * the string with the embedding marks needed to ensure things have the correct LTR/RTL order.
     *
     * For example, with a test string:
     *
     * embeddedDebugString( '\u202a\u202bhi\u202c\u202c' )
     * === "[LTR][RTL]hi[POP][POP]"
     *
     * We could grab the first word, and it adds the ending POP:
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 0, 6 ) )
     * === "[LTR]first[POP]"
     *
     * Or the second word:
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 6, 14 ) )
     * === "[RTL]second[POP]"
     *
     * Or a custom range:
     * embeddedDebugString( embeddedSlice( '\u202afirst\u202bsecond\u202cthird\u202c', 3, -3 ) )
     * === "[LTR]rst[RTL]second[POP]thi[POP]"
     *
     * @param string - The main source string to slice from
     * @param startIndex - The starting index where the slice starts (includes char at this index)
     * @param [endIndex] - The ending index where the slice stops (does NOT include char at this index)
     * @returns The sliced string, with embedding marks added at the start and end
     */
    embeddedSlice: function (string, startIndex, endIndex) {
        // {Array.<string>} - array of LTR/RTL embedding marks that are currently on the stack for the current location.
        var stack = [];
        var chr;
        if (endIndex === undefined) {
            endIndex = string.length;
        }
        if (endIndex < 0) {
            endIndex += string.length;
        }
        // To avoid returning an extra adjacent [LTR][POP] or [RTL][POP], we can move the start forward and the
        // end backwards as long as they are over embedding marks to avoid this.
        while (startIndex < string.length && StringUtils.isEmbeddingMark(string.charAt(startIndex))) {
            startIndex++;
        }
        while (endIndex >= 1 && StringUtils.isEmbeddingMark(string.charAt(endIndex - 1))) {
            endIndex--;
        }
        // If our string will be empty, just bail out.
        if (startIndex >= endIndex || startIndex >= string.length) {
            return '';
        }
        // Walk up to the start of the string
        for (var i = 0; i < startIndex; i++) {
            chr = string.charAt(i);
            if (chr === LTR || chr === RTL) {
                stack.push(chr);
            }
            else if (chr === POP) {
                stack.pop();
            }
        }
        // Will store the minimum stack size during our slice. This allows us to turn [LTR][RTL]boo[POP][POP] into
        // [RTL]boo[POP] by skipping the "outer" layers.
        var minimumStackSize = stack.length;
        // Save our initial stack for prefix computation
        var startStack = stack.slice();
        // A normal string slice
        var slice = string.slice(startIndex, endIndex);
        // Walk through the sliced string, to determine what we need for the suffix
        for (var j = 0; j < slice.length; j++) {
            chr = slice.charAt(j);
            if (chr === LTR || chr === RTL) {
                stack.push(chr);
            }
            else if (chr === POP) {
                stack.pop();
                minimumStackSize = Math.min(stack.length, minimumStackSize);
            }
        }
        // Our ending stack for suffix computation
        var endStack = stack;
        // Always leave one stack level on top
        var numSkippedStackLevels = Math.max(0, minimumStackSize - 1);
        startStack = startStack.slice(numSkippedStackLevels);
        endStack = endStack.slice(numSkippedStackLevels);
        // Our prefix will be the embedding marks that have been skipped and not popped.
        var prefix = startStack.join('');
        // Our suffix includes one POP for each embedding mark currently on the stack
        var suffix = endStack.join('').replace(/./g, POP);
        return prefix + slice + suffix;
    },
    /**
     * String's split() API, but uses embeddedSlice() on the extracted strings.
     *
     * For example, given a string:
     *
     * StringUtils.embeddedDebugString( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c' );
     * === "[LTR]Hello  there, [RTL]How are you[POP] doing?[POP]"
     *
     * Using embeddedSplit with a regular expression matching a sequence of spaces:
     * StringUtils.embeddedSplit( '\u202aHello  there, \u202bHow are you\u202c doing?\u202c', / +/ )
     *            .map( StringUtils.embeddedDebugString );
     * === [ "[LTR]Hello[POP]",
     *       "[LTR]there,[POP]",
     *       "[RTL]How[POP]",
     *       "[RTL]are[POP]",
     *       "[RTL]you[POP]",
     *       "[LTR]doing?[POP]" ]
     */
    embeddedSplit: function (string, separator, limit) {
        // Matching split API
        if (separator === undefined) {
            return [string];
        }
        // {Array.<string>} - What we will push to and return.
        var result = [];
        // { index: {number}, length: {number} } - Last result of findSeparatorMatch()
        var separatorMatch;
        // Remaining part of the string to split up. Will have substrings removed from the start.
        var stringToSplit = string;
        // Finds the index and length of the first substring of stringToSplit that matches the separator (string or regex)
        // and returns an object with the type  { index: {number}, length: {number} }.
        // If index === -1, there was no match for the separator.
        function findSeparatorMatch() {
            var index;
            var length;
            if (separator instanceof window.RegExp) {
                var match = stringToSplit.match(separator);
                if (match) {
                    index = match.index;
                    length = match[0].length;
                }
                else {
                    index = -1;
                }
            }
            else {
                (0, affirm_js_1.default)(typeof separator === 'string');
                index = stringToSplit.indexOf(separator);
                length = separator.length;
            }
            return {
                // @ts-expect-error
                index: index,
                // @ts-expect-error
                length: length
            };
        }
        // Loop until we run out of matches for the separator. For each separator match, stringToSplit for the next
        // iteration will have everything up to the end of the separator match chopped off. The indexOffset variable
        // stores how many characters we have chopped off in this fashion, so that we can index into the original string.
        var indexOffset = 0;
        while ((separatorMatch = findSeparatorMatch()).index >= 0) {
            // Extract embedded slice from the original, up until the separator match
            result.push(StringUtils.embeddedSlice(string, indexOffset, indexOffset + separatorMatch.index));
            // Handle chopping off the section of stringToSplit, so we can do simple matching in findSeparatorMatch()
            var offset = separatorMatch.index + separatorMatch.length;
            stringToSplit = stringToSplit.slice(offset);
            indexOffset += offset;
        }
        // Embedded slice for after the last match. May be an empty string.
        result.push(StringUtils.embeddedSlice(string, indexOffset));
        // Matching split API
        if (limit !== undefined) {
            (0, affirm_js_1.default)(typeof limit === 'number');
            // @ts-expect-error
            result = _.first(result, limit);
        }
        return result;
    },
    /**
     * Replaces embedding mark characters with visible strings. Useful for debugging for strings with embedding marks.
     *
     * @returns With embedding marks replaced.
     */
    embeddedDebugString: function (string) {
        return string.replace(/\u202a/g, '[LTR]').replace(/\u202b/g, '[RTL]').replace(/\u202c/g, '[POP]');
    },
    /**
     * Wraps a string with embedding marks for LTR display.
     */
    wrapLTR: function (string) {
        return LTR + string + POP;
    },
    /**
     * Wraps a string with embedding marks for RTL display.
     */
    wrapRTL: function (string) {
        return RTL + string + POP;
    },
    /**
     * Wraps a string with embedding marks for LTR/RTL display, depending on the direction
     *
     * @param string
     * @param direction - either 'ltr' or 'rtl'
     */
    wrapDirection: function (string, direction) {
        (0, affirm_js_1.default)(direction === 'ltr' || direction === 'rtl');
        if (direction === 'ltr') {
            return StringUtils.wrapLTR(string);
        }
        else {
            return StringUtils.wrapRTL(string);
        }
    },
    /**
     * Given a locale, e.g. 'es', provides the localized name, e.g. 'Español'
     */
    localeToLocalizedName: function (locale) {
        (0, affirm_js_1.default)(phet.chipper.localeData[locale], 'locale needs to be a valid locale code defined in localeData');
        return StringUtils.wrapDirection(phet.chipper.localeData[locale].localizedName, phet.chipper.localeData[locale].direction);
    },
    /**
     * Capitalize the first letter of the given string.  This will skip control characters and whitespace at the beginning
     * of a string.  If the letter is already capitalized the returned string will match the provided one.  Strings that
     * start with numbers, such as "1 of these things" will be essentially unchanged too.
     *
     * This will only work reliably for English strings.
     */
    capitalize: function (str) {
        // Find the index of the first character that can be capitalized.  Control characters and whitespace are skipped.
        var firstCharIndex = str.search(/[A-Za-z0-9]/);
        if (firstCharIndex === -1) {
            // No characters were found in the string that can be capitalized, so return an unchanged copy.
            return str.slice(0);
        }
        // Break the string apart and capitalize the identified character.
        var preChangeString = firstCharIndex > 0 ? str.slice(0, firstCharIndex) : '';
        var capitalizedCharacter = str.charAt(firstCharIndex).toUpperCase();
        var postChangeString = firstCharIndex + 1 < str.length ? str.slice(firstCharIndex + 1) : '';
        return preChangeString + capitalizedCharacter + postChangeString;
    },
    /**
     * Convert a number to a string with a specified number of digits after the decimal point and wrap it with LTR
     * embedding marks so that it will be displayed correctly in all cases, meaning that the negative sign will be on the
     * left even if it is within a right-to-left string.  Uses toFixed, so that trailing zeros are preserved to the right
     * of the decimal place. See https://github.com/phetsims/phetcommon/issues/68 for some history on the need for this.
     */
    toFixedLTR: function (number, digits) {
        return StringUtils.wrapLTR((0, toFixed_js_1.toFixed)(number, digits));
    },
    /**
     * Similar to toFixedLTR, but uses toFixedNumber and therefore removes trailing zeros to the right of the
     * decimal place.
     */
    toFixedNumberLTR: function (number, digits) {
        return StringUtils.wrapLTR('' + (0, toFixedNumber_js_1.toFixedNumber)(number, digits));
    }
};
exports.default = StringUtils;
