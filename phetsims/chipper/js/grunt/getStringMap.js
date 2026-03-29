"use strict";
// Copyright 2015-2026, University of Colorado Boulder
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
exports.default = getStringMap;
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Returns a map such that map["locale"]["REPO/stringKey"] will be the string value (with fallbacks to English where needed).
 * Loads each string file only once, and only loads the repository/locale combinations necessary.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var strip_comments_1 = require("strip-comments");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var pascalCase_js_1 = require("../common/pascalCase.js");
var getFluentInternalReferences_js_1 = require("./modulify/getFluentInternalReferences.js");
var localeData = JSON.parse(fs_1.default.readFileSync('../babel/localeData.json', 'utf8'));
/**
 * For a given locale, return an array of specific locales that we'll use as fallbacks, e.g.
 * 'ar_AE' => [ 'ar_AE', 'ar', 'ar_MA', 'en' ]   (note, changed from zh_CN example, which does NOT use 'zh' as a fallback anymore)
 * 'es' => [ 'es', 'en' ]
 * 'en' => [ 'en' ]
 *
 */
var localeFallbacks = function (locale) {
    return __spreadArray(__spreadArray(__spreadArray([], (locale !== ChipperConstants_js_1.default.FALLBACK_LOCALE ? [locale] : []), true), (localeData[locale].fallbackLocales || []), true), [
        ChipperConstants_js_1.default.FALLBACK_LOCALE // e.g. 'en'
    ], false);
};
/**
 * Load all the required string files into memory, so we don't load them multiple times (for each usage).
 *
 * @param reposWithUsedStrings - All of the repos that have 1+ used strings
 * @param locales - All supported locales for this build
 * @returns - maps {locale:string} => Another map with: {stringKey:string} => {stringValue:string}
 */
var getStringFilesContents = function (reposWithUsedStrings, locales) {
    var stringFilesContents = {}; // maps [repositoryName][locale] => contents of locale string file
    reposWithUsedStrings.forEach(function (repo) {
        stringFilesContents[repo] = {};
        /**
         * Adds a locale into our stringFilesContents map.
         */
        var addLocale = function (locale, isRTL) {
            // Read optional string file
            var stringsFilename = path_1.default.normalize("../".concat(locale === ChipperConstants_js_1.default.FALLBACK_LOCALE ? '' : 'babel/').concat(repo, "/").concat(repo, "-strings_").concat(locale, ".json"));
            var fileContents;
            try {
                fileContents = JSON.parse(fs_1.default.readFileSync(stringsFilename, 'utf-8'));
            }
            catch (error) {
                grunt_js_1.default.log.verbose.writeln("missing string file: ".concat(stringsFilename));
                fileContents = {};
            }
            // Format the string values
            ChipperStringUtils_js_1.default.formatStringValues(fileContents, isRTL);
            stringFilesContents[repo][locale] = fileContents;
        };
        // Include fallback locales (they may have duplicates)
        var includedLocales = lodash_1.default.sortBy(lodash_1.default.uniq(locales.flatMap(function (locale) {
            (0, assert_1.default)(localeData[locale], "unsupported locale: ".concat(locale));
            return localeFallbacks(locale);
        })));
        includedLocales.forEach(function (locale) { return addLocale(locale, localeData[locale].direction === 'rtl'); });
    });
    return stringFilesContents;
};
/**
 * @param mainRepo
 * @param locales
 * @param phetLibs - Used to check for bad string dependencies
 * @param usedModules - relative file path of the module (filename) from the repos root
 */
function getStringMap(mainRepo, locales, phetLibs, usedModules) {
    (0, assert_1.default)(locales.includes(ChipperConstants_js_1.default.FALLBACK_LOCALE), 'fallback locale is required');
    // --------------------------------------------------------------------
    // The Fluent.js file uses all Strings.js keys internally so they do not count as usages.
    // --------------------------------------------------------------------
    var nonFluentModules = usedModules.filter(function (modulePath) { return !modulePath.endsWith('Fluent.js'); });
    // Load the file contents of every single JS module that used any strings.
    // Strip out comments so we only find code usages of strings.
    var usedFileContents = nonFluentModules.map(function (usedModule) { return fs_1.default.readFileSync("../".concat(usedModule), 'utf-8'); }).map(function (fileContent) { return (0, strip_comments_1.default)(fileContent); });
    // Compute which repositories contain one or more used strings (since we'll need to load string files for those
    // repositories).
    var reposWithUsedStrings = [];
    usedFileContents.forEach(function (fileContent) {
        // Accept imports for either *Strings.js or *Fluent.js
        // [a-zA-Z_$][a-zA-Z0-9_$] ---- general JS identifiers, first character can't be a number
        // [^\n\r] ---- grab everything except for newlines here, so we get everything
        var allImportStatements = fileContent.match(/import [a-zA-Z_$][a-zA-Z0-9_$]*(Strings|Fluent) from '[^\n\r]+(Strings|Fluent)\.js';/g);
        if (allImportStatements) {
            reposWithUsedStrings.push.apply(reposWithUsedStrings, allImportStatements.map(function (importStatement) {
                // Grabs out the prefix before `Strings.js` OR `Fluent.js` (without the leading slash)
                var importName = importStatement.match(/\/([\w-]+)(Strings|Fluent)\.js/)[1];
                // kebab case the repo
                return lodash_1.default.kebabCase(importName);
            }));
        }
    });
    reposWithUsedStrings = lodash_1.default.uniq(reposWithUsedStrings).filter(function (repo) {
        return fs_1.default.existsSync("../".concat(repo, "/package.json"));
    });
    // Compute a map of {repo:string} => {requirejsNamepsace:string}, so we can construct full string keys from strings
    // that would be accessing them, e.g. `JoistStrings.ResetAllButton.name` => `JOIST/ResetAllButton.name`.
    var requirejsNamespaceMap = {};
    reposWithUsedStrings.forEach(function (repo) {
        var packageObject = JSON.parse(fs_1.default.readFileSync("../".concat(repo, "/package.json"), 'utf-8'));
        requirejsNamespaceMap[repo] = packageObject.phet.requirejsNamespace;
    });
    // Load all the required string files into memory, so we don't load them multiple times (for each usage)
    // maps [repositoryName][locale] => contents of locale string file
    var stringFilesContents = getStringFilesContents(reposWithUsedStrings, locales);
    // Initialize our full stringMap object (which will be filled with results and then returned as our string map).
    var stringMap = {};
    var stringMetadata = {};
    locales.forEach(function (locale) {
        stringMap[locale] = {};
    });
    // combine our strings into [locale][stringKey] map, using the fallback locale where necessary. In regards to nested
    // strings, this data structure doesn't nest. Instead it gets nested string values, and then sets them with the
    // flat key string like `"FRICTION/a11y.some.string.here": { value: 'My Some String' }`
    reposWithUsedStrings.forEach(function (repo) {
        // Scan all of the files with string module references, scanning for anything that looks like a string access for
        // our repo. This will include the string module reference, e.g. `JoistStrings.ResetAllButton.name`, but could also
        // include slightly more (since we're string parsing), e.g. `JoistStrings.ResetAllButton.name.length` would be
        // included, even though only part of that is a string access.
        var stringAccesses = [];
        // We need to look for both SomethingStrings.* and SomethingFluent.*
        var prefixes = [
            "".concat((0, pascalCase_js_1.default)(repo), "Strings"),
            "".concat((0, pascalCase_js_1.default)(repo), "Fluent")
        ];
        prefixes.forEach(function (prefix) {
            usedFileContents.forEach(function (fileContent) {
                // Only scan files where we can identify an import for it
                if (fileContent.includes("import ".concat(prefix, " from"))) {
                    // Look for normal matches, e.g. `JoistStrings.` followed by one or more chunks like:
                    // .somethingVaguely_alphaNum3r1c
                    // [ 'aStringInBracketsBecauseOfSpecialCharacters' ]
                    //
                    // It will also then end on anything that doesn't look like another one of those chunks
                    // [a-zA-Z_$][a-zA-Z0-9_$]* ---- this grabs things that looks like valid JS identifiers
                    // \\[ '[^']+' \\])+ ---- this grabs things like our second case above
                    // [^\\.\\[] ---- matches something at the end that is NOT either of those other two cases
                    // It is also generalized to support arbitrary whitespace and requires that ' match ' or " match ", since
                    // this must support JS code and minified TypeScript code
                    // Matches one final character that is not '.' or '[', since any valid string accesses should NOT have that
                    // after. NOTE: there are some degenerate cases that will break this, e.g.:
                    // - JoistStrings.someStringProperty[ 0 ]
                    // - JoistStrings.something[ 0 ]
                    // - JoistStrings.something[ 'length' ]
                    var matches = fileContent.match(new RegExp("".concat(prefix, "(\\.[a-zA-Z_$][a-zA-Z0-9_$]*|\\[\\s*['\"][^'\"]+['\"]\\s*\\])+[^\\.\\[]"), 'g'));
                    if (matches) {
                        stringAccesses.push.apply(stringAccesses, matches.map(function (match) {
                            return match
                                // We always have to strip off the last character - it's a character that shouldn't be in a string access
                                .slice(0, match.length - 1)
                                // Handle JoistStrings[ 'some-thingStringProperty' ].value => JoistStrings[ 'some-thing' ]
                                // -- Anything after StringProperty should go
                                // away, but we need to add the final '] to maintain the format
                                .replace(/StringProperty'\s?].*/, '\']')
                                // Handle JoistStrings.somethingStringProperty.value => JoistStrings.something
                                .replace(/StringProperty.*/, '')
                                // .format( ... )
                                .replace(/\.format.*/, '')
                                // .createProperty( ... )
                                .replace(/\.createProperty.*/, '')
                                // Normalize whitespace
                                .replace(/\[ '/g, '[\'')
                                .replace(/' \]/g, '\']');
                        }));
                    }
                }
            });
        });
        // Strip off our prefixes, so our stringAccesses will have things like `'ResetAllButton.name'` inside.
        stringAccesses = lodash_1.default.uniq(stringAccesses).map(function (str) {
            // Take off whichever prefix it had (Strings or Fluent)
            return prefixes.reduce(function (acc, pre) { return acc.startsWith(pre) ? acc.slice(pre.length) : acc; }, str);
        });
        // Search for any string accesses that are in used fluent patterns. They are not used direcly in simulation code,
        // but are used, so they need to be in the string map.
        var englishStringContents = stringFilesContents[repo][ChipperConstants_js_1.default.FALLBACK_LOCALE];
        var fluentKeyMap = ChipperStringUtils_js_1.default.getFluentKeyMap(englishStringContents);
        var ftl = ChipperStringUtils_js_1.default.createFluentFileFromData(fluentKeyMap.values());
        // Build a reverse lookup from Fluent key → original JSON key for bijective mapping
        var fluentToJsonKey = new Map();
        fluentKeyMap.forEach(function (entry, jsonKey) {
            // Safety check to avoid collisions
            var prev = fluentToJsonKey.get(entry.fluentKey);
            (0, assert_1.default)(!prev || prev === jsonKey, "Fluent key collision for \"".concat(entry.fluentKey, "\" from \"").concat(prev, "\" and \"").concat(jsonKey, "\""));
            fluentToJsonKey.set(entry.fluentKey, jsonKey);
        });
        // Every string referenced in simulation code, in its fluent key form. A leading '.' is removed from the key assembled in stringAccesses.
        var fluentFormsAccessed = stringAccesses.map(function (stringAccess) { return ChipperStringUtils_js_1.default.createFluentKey(stringAccess.substring(1)); });
        // Loop over every fluent key in the file.
        fluentKeyMap.forEach(function (entry) {
            var fluentKey = entry.fluentKey;
            // The fluent key is used in simulation code. So all references in its pattern value must be considered used.
            if (fluentFormsAccessed.includes(fluentKey)) {
                // All references used by this fluent key, catching deeply nested references.
                var references = (0, getFluentInternalReferences_js_1.getFluentInternalReferences)(ftl, fluentKey);
                references.forEach(function (reference) {
                    // Convert the fluent key back to its JSON key using the reverse lookup (lossless, supports underscores anywhere)
                    var jsonKey = fluentToJsonKey.get(reference);
                    (0, assert_1.default)(jsonKey, "Unknown Fluent reference \"".concat(reference, "\" (no mapping back to JSON key)."));
                    var jsonFormattedReference = '.' + jsonKey;
                    if (!stringAccesses.includes(jsonFormattedReference)) {
                        stringAccesses.push(jsonFormattedReference);
                    }
                });
            }
        });
        // The JS outputted by TS is minified and missing the whitespace
        var depth = 2;
        // Turn each string access into an array of parts, e.g. '.ResetAllButton.name' => [ 'ResetAllButton', 'name' ]
        // or '[ \'A\' ].B[ \'C\' ]' => [ 'A', 'B', 'C' ]
        // Regex grabs either `.identifier` or `[ 'text' ]`.
        var stringKeysByParts = stringAccesses.map(function (access) { return access.match(/\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\s*['"][^'"]+['"]\s*\]/g).map(function (token) {
            return token.startsWith('.') ? token.slice(1) : token.slice(depth, token.length - depth);
        }); });
        // Concatenate the string parts for each access into something that looks like a partial string key, e.g.
        // [ 'ResetAllButton', 'name' ] => 'ResetAllButton.name'
        var partialStringKeys = lodash_1.default.uniq(stringKeysByParts.map(function (parts) { return parts.join('.'); })).filter(function (key) { return key !== 'js'; });
        // For each string key and locale, we'll look up the string entry and fill it into the stringMap
        partialStringKeys.forEach(function (partialStringKey) {
            locales.forEach(function (locale) {
                var stringEntry = null;
                for (var _i = 0, _a = localeFallbacks(locale); _i < _a.length; _i++) {
                    var fallbackLocale = _a[_i];
                    var stringFileContents = stringFilesContents[repo][fallbackLocale];
                    if (stringFileContents) {
                        stringEntry = ChipperStringUtils_js_1.default.getStringEntryFromMap(stringFileContents, partialStringKey);
                        if (stringEntry) {
                            break;
                        }
                    }
                }
                if (!partialStringKey.endsWith('StringProperty') && !partialStringKey.endsWith('.getDependentProperties')) {
                    (0, assert_1.default)(stringEntry !== null, "Missing string information for ".concat(repo, " ").concat(partialStringKey));
                    var stringKey = "".concat(requirejsNamespaceMap[repo], "/").concat(partialStringKey);
                    // Normalize the string value, so that it will not generate warnings for HTML validation,
                    // see https://github.com/phetsims/scenery/issues/1687
                    stringMap[locale][stringKey] = stringEntry.value.normalize();
                    if (stringEntry.simMetadata && locale === ChipperConstants_js_1.default.FALLBACK_LOCALE) {
                        stringMetadata[stringKey] = stringEntry.simMetadata;
                    }
                }
            });
        });
    });
    return { stringMap: stringMap, stringMetadata: stringMetadata };
}
