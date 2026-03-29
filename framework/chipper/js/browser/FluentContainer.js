"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A class that manages the Fluent bundle when the locale changes or any string changes (like from
 * external PhET-iO control). If either of these change, the entire bundle is recreated.
 *
 * This is used by the generated fluent types files for each repo.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var Multilink_js_1 = require("../../../axon/js/Multilink.js");
var Property_js_1 = require("../../../axon/js/Property.js");
var localeProperty_js_1 = require("../../../joist/js/i18n/localeProperty.js");
var FluentLibrary_js_1 = require("../browser-and-node/FluentLibrary.js");
var FluentContainer = /** @class */ (function () {
    function FluentContainer(getFTL, allStringProperties) {
        var createFluentBundle = function () {
            var bcp47 = phet.chipper.localeData[localeProperty_js_1.default.value].bcp47;
            // Instantiate the FluentBundle with the bcp47 locale corresponding to the
            // currently selected locale. It will be passed to Intl formatters as Fluent is processed.
            // See https://github.com/phetsims/chipper/issues/1611
            var bundle = new FluentLibrary_js_1.FluentBundle(bcp47, {
                // Fluent wraps every interpolated value in the invisible FSI / PDI 'isolation' marks
                // to keep the reading order correct when left-to-right and right-to-left text are mixed.
                // Because those marks confuse speech-synthesis engines, we disable them.
                useIsolating: false
            });
            var resource = new FluentLibrary_js_1.FluentResource(getFTL());
            var errors = bundle.addResource(resource);
            assert && assert(errors.length === 0, 'Errors when adding resource for locale en');
            return bundle;
        };
        // Initial compute of the bundle
        var bundleProperty = new Property_js_1.default(createFluentBundle(), { disableListenerLimit: true });
        this.bundleProperty = bundleProperty;
        Multilink_js_1.default.multilinkAny(allStringProperties, function () {
            if (!localeProperty_js_1.default.isLocaleChanging) {
                bundleProperty.value = createFluentBundle();
            }
        });
        // Listener order is important. This listener must fire after the one that set
        // isLocaleChanging to true. Otherwise, the bundle will be recomputed for every
        // string change.
        localeProperty_js_1.default.lazyLink(function () {
            bundleProperty.value = createFluentBundle();
        });
    }
    return FluentContainer;
}());
exports.default = FluentContainer;
