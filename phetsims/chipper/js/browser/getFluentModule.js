"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Constructs the modules needed to use Fluent.js messages in a PhET simulation. Fluent has the following concepts:
 *
 * - Bundle: A collection of messages for a single locale.
 * - Message: An data structure in a FluentBundle. The message can be formatted with arguments into a final string.
 *            If there are no arguments, the message is a string.
 *
 * This is used in generated files from modulify.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var DerivedProperty_js_1 = require("../../../axon/js/DerivedProperty.js");
var localeProperty_js_1 = require("../../../joist/js/i18n/localeProperty.js");
var FluentLibrary_js_1 = require("../browser-and-node/FluentLibrary.js");
var LocalizedMessageProperty_js_1 = require("./LocalizedMessageProperty.js");
var LocalizedString_js_1 = require("./LocalizedString.js");
var getFluentModule = function (localeToFluentFileMap) {
    var locales = Object.keys(localeToFluentFileMap);
    var localeToBundleMap = new Map();
    locales.forEach(function (locale) {
        var bundle = new FluentLibrary_js_1.FluentBundle(locale);
        var localeFile = localeToFluentFileMap[locale];
        // If assertions are enabled, error out if the file is not valid Fluent syntax (or has keys with dashes)
        assert && FluentLibrary_js_1.default.verifyFluentFile(localeFile);
        var resource = new FluentLibrary_js_1.FluentResource(localeFile);
        // This does not catch syntax errors unfortunately, Fluent skips over messages with syntax errors.
        // See https://github.com/projectfluent/fluent.js/blob/2f675def5b19ad34ff2d4d89c7d1269e5b352e9e/fluent/src/resource.js#L81C1-L83C20
        var errors = bundle.addResource(resource);
        assert && assert(errors.length === 0, "Errors when adding resource for locale: ".concat(locale));
        localeToBundleMap.set(locale, bundle);
    });
    var englishMessageKeys = FluentLibrary_js_1.default.getFluentMessageKeys(localeToFluentFileMap.en);
    var messagePropertiesMap = {};
    englishMessageKeys.forEach(function (key) {
        // Create the bundle Property for a locale and key. Uses locale fallbacks until
        // a bundle with the message key is found.
        var bundleProperty = new DerivedProperty_js_1.default([localeProperty_js_1.default], function (locale) {
            var localeFallbacks = LocalizedString_js_1.default.getLocaleFallbacks(locale);
            for (var _i = 0, localeFallbacks_1 = localeFallbacks; _i < localeFallbacks_1.length; _i++) {
                var fallbackLocale = localeFallbacks_1[_i];
                var bundle = localeToBundleMap.get(fallbackLocale);
                if (bundle && bundle.hasMessage(key)) {
                    return bundle;
                }
            }
            throw new Error("Could not find bundle for key: ".concat(key, "."));
        }, { disableListenerLimit: true });
        var localizedMessageProperty = new LocalizedMessageProperty_js_1.default(bundleProperty, function (bundle) {
            if (bundle.hasMessage(key)) {
                var value = bundle.getMessage(key).value;
                assert && assert(value !== null);
                return value;
            }
            else {
                throw new Error("Could not find message for: ".concat(key, "."));
            }
        });
        var propertyKey = "".concat(key, "MessageProperty");
        messagePropertiesMap[propertyKey] = localizedMessageProperty;
    });
    return messagePropertiesMap;
};
exports.default = getFluentModule;
