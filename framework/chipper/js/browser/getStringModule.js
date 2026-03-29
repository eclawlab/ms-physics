"use strict";
// Copyright 2020-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var CouldNotYetDeserializeError_js_1 = require("../../../tandem/js/CouldNotYetDeserializeError.js");
var PhetioObject_js_1 = require("../../../tandem/js/PhetioObject.js");
var Tandem_js_1 = require("../../../tandem/js/Tandem.js");
var IOType_js_1 = require("../../../tandem/js/types/IOType.js");
var ObjectLiteralIO_js_1 = require("../../../tandem/js/types/ObjectLiteralIO.js");
var isA11yStringKey_js_1 = require("./isA11yStringKey.js");
var LocalizedString_js_1 = require("./LocalizedString.js");
var localizedStrings_js_1 = require("./localizedStrings.js");
// constants
var FALLBACK_LOCALE = 'en';
// For developer internal use, particularly for memory leak detection
// e.g. _.max( phet.chipper.localizedStrings.map( ls => ls.property.tinyProperty.listeners.size ) ) to see if there is
// likely a leak
window.phet.chipper.localizedStrings = localizedStrings_js_1.default;
// For developer internal use, similar to the stringTest query parameter
window.phet.chipper.setAllStrings = function (str) {
    localizedStrings_js_1.default.forEach(function (localizedString) {
        localizedString.property.value = str;
    });
};
var stringKeyToTandemName = function (key) {
    return key.replace(/(?:[-_\s]\w)/g, function (word) { return word[1].toUpperCase(); });
};
var StringStateIOType = new IOType_js_1.default('StringStateIO', {
    valueType: PhetioObject_js_1.default,
    toStateObject: function () {
        var data = {};
        localizedStrings_js_1.default.forEach(function (localizedString) {
            var state = localizedString.getStateDelta();
            // Only create an entry if there is anything (we can save bytes by not including the tandem here)
            if (Object.keys(state).length > 0) {
                data[localizedString.property.tandem.phetioID] = state;
            }
        });
        return {
            data: data // Data nested for a valid schema
        };
    },
    stateSchema: {
        data: ObjectLiteralIO_js_1.default
    },
    applyState: function (ignored, state) {
        // Every string in state has to be in localizedStrings to continue
        Object.keys(state.data).forEach(function (phetioID) {
            var match = localizedStrings_js_1.default.find(function (localizedString) { return localizedString.property.tandem.phetioID === phetioID; });
            // When PhetioDynamicElementContainer elements such as PhetioGroup members add localizedStrings, we wait until
            // all of the members have been created (populating localizedStrings) before trying to set any of the strings.
            if (!match) {
                throw new CouldNotYetDeserializeError_js_1.default();
            }
        });
        // We need to iterate through every string in this runtime, since it might need to revert back to "initial" state.
        localizedStrings_js_1.default.forEach(function (localizedString) {
            localizedString.setStateDelta(state.data[localizedString.property.tandem.phetioID] || {});
        });
    }
});
PhetioObject_js_1.default.create({
    phetioType: StringStateIOType,
    tandem: Tandem_js_1.default.GENERAL_MODEL.createTandem('stringsState'),
    phetioDocumentation: 'Strings that have changed from their initial values. Each string value is specific to the locale it changed in.',
    phetioState: true
});
/**
 * @param requirejsNamespace - E.g. 'JOIST', to pull string keys out from that namespace
 * @returns Nested object to be accessed like JoistStrings.ResetAllButton.name
 */
var getStringModule = function (requirejsNamespace) {
    // Our string information is pulled globally, e.g. phet.chipper.strings[ locale ][ stringKey ] = stringValue;
    // Our locale information is from phet.chipper.locale
    assert && assert(typeof phet.chipper.locale === 'string', 'phet.chipper.locale should have been loaded by now');
    assert && assert(Object.keys(phet.chipper.localeData).includes(phet.chipper.locale), "phet.chipper.locale:".concat(phet.chipper.locale, " is not in localeData"));
    assert && assert(phet.chipper.strings, 'phet.chipper.strings should have been loaded by now');
    // Construct locales in increasing specificity, e.g. [ 'en', 'zh', 'zh_CN' ], so we get fallbacks in order
    // const locales = [ FALLBACK_LOCALE ];
    var stringKeyPrefix = "".concat(requirejsNamespace, "/");
    // We may have other older (unused) keys in babel, and we are only doing the search that matters with the English
    // string keys.
    var allStringKeysInRepo = Object.keys(phet.chipper.strings[FALLBACK_LOCALE]).filter(function (stringKey) { return stringKey.startsWith(stringKeyPrefix); });
    // TODO: https://github.com/phetsims/phet-io/issues/1877 What if this list doesn't exist?  Should that be an error?
    // Or an error if running an api-stable phet-io sim?
    // TODO: https://github.com/phetsims/phet-io/issues/1877 What will happen if this is stale? How will a developer know
    // to update it? Should it run in daily-grunt-work?
    if (phet.chipper.usedStringsEN) {
        allStringKeysInRepo = allStringKeysInRepo.filter(function (stringKey) { return phet.chipper.usedStringsEN.hasOwnProperty(stringKey); });
    }
    // localizedStringMap[ stringKey ]
    var localizedStringMap = {};
    var stringModule = {};
    allStringKeysInRepo.forEach(function (stringKey) {
        // strip off the requirejsNamespace, e.g. 'JOIST/ResetAllButton.name' => 'ResetAllButton.name'
        var stringKeyWithoutPrefix = stringKey.slice(stringKeyPrefix.length);
        var keyParts = stringKeyWithoutPrefix.split('.');
        var lastKeyPart = keyParts[keyParts.length - 1];
        var allButLastKeyPart = keyParts.slice(0, keyParts.length - 1);
        // During traversal into the string object, this will hold the object where the next level needs to be defined,
        // whether that's another child object, or the string value itself.
        var reference = stringModule;
        // We'll traverse down through the parts of a string key (separated by '.'), creating a new level in the
        // string object for each one. This is done for all BUT the last part, since we'll want to assign the result
        // of that to a raw string value (rather than an object).
        var partialKey = stringKeyPrefix;
        allButLastKeyPart.forEach(function (keyPart, i) {
            // When concatenating each level into the final string key, we don't want to put a '.' directly after the
            // slash, because `JOIST/.ResetAllButton.name` would be invalid.
            // See https://github.com/phetsims/chipper/issues/922
            partialKey += "".concat(i > 0 ? '.' : '').concat(keyPart);
            // Don't allow e.g. JOIST/a and JOIST/a.b, since localeObject.a would need to be a string AND an object at the
            // same time.
            assert && assert(typeof reference[keyPart] !== 'string', 'It is not allowed to have two different string keys where one is extended by adding a period (.) at the end ' +
                "of the other. The string key ".concat(partialKey, " is extended by ").concat(stringKey, " in this case, and should be changed."));
            // Create the next nested level, and move into it
            if (!reference[keyPart]) {
                reference[keyPart] = {};
            }
            reference = reference[keyPart]; // since we are on all but the last key part, it cannot be stringlike
        });
        assert && assert(typeof reference[lastKeyPart] !== 'object', 'It is not allowed to have two different string keys where one is extended by adding a period (.) at the end ' +
            "of the other. The string key ".concat(stringKey, " is extended by another key, something containing ").concat(reference[lastKeyPart] && Object.keys(reference[lastKeyPart]), "."));
        assert && assert(!reference[lastKeyPart], "We should not have defined this place in the object (".concat(stringKey, "), otherwise it means a duplicated string key OR extended string key"));
        // In case our assertions are not enabled, we'll need to proceed without failing out (so we allow for the
        // extended string keys in our actual code, even though assertions should prevent that).
        if (typeof reference !== 'string') {
            var tandem = Tandem_js_1.default.STRINGS.createTandem(_.camelCase(requirejsNamespace));
            for (var i = 0; i < keyParts.length; i++) {
                var tandemName = stringKeyToTandemName(keyParts[i]);
                // If it is the tail of the string key, then make the tandem be a "*StringProperty"
                if (i === keyParts.length - 1) {
                    var currentTandemName = tandemName;
                    var j = 0;
                    var tandemNameTaken = true;
                    // Handle the case where two unique string keys map to the same camel case value, i.e. "Solid" and "solid".
                    // Here we will be solidStringProperty and solid2StringProperty
                    while (tandemNameTaken) {
                        j++;
                        currentTandemName = "".concat(tandemName).concat(j === 1 ? '' : j, "StringProperty");
                        tandemNameTaken = tandem.hasChild(currentTandemName);
                    }
                    tandemName = currentTandemName;
                }
                tandem = tandem.createTandem(tandemName);
            }
            // strings nested under the a11y section are not currently PhET-iO instrumented, see https://github.com/phetsims/chipper/issues/1352
            // except we do instrument them when requested, see https://github.com/phetsims/chipper/issues/1631
            if (tandem.phetioID.includes('.a11y.') && !phet.chipper.queryParameters.phetioInstrumentA11yStrings) {
                tandem = Tandem_js_1.default.OPT_OUT;
            }
            var localeToTranslationMap_1 = {};
            Object.keys(phet.chipper.strings).forEach(function (locale) {
                var string = phet.chipper.strings[locale][stringKey];
                // Ignore zero-length strings, see https://github.com/phetsims/chipper/issues/1343
                if (locale === FALLBACK_LOCALE || (typeof string === 'string' && string !== '')) {
                    localeToTranslationMap_1[locale] = phet.chipper.mapString(string, (0, isA11yStringKey_js_1.default)(stringKey));
                }
            });
            var localizedString = new LocalizedString_js_1.default(stringKey, localeToTranslationMap_1, tandem, phet.chipper.stringMetadata[stringKey]);
            localizedStringMap[stringKey] = localizedString;
            // Put our Property in the stringModule
            reference["".concat(lastKeyPart, "StringProperty")] = localizedString.property;
            // Change our stringModule based on the Property value
            localizedString.property.link(function (string) {
                reference[lastKeyPart] = string;
            });
        }
    });
    return stringModule;
};
exports.default = getStringModule;
