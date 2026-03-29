"use strict";
// Copyright 2022-2026, University of Colorado Boulder
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocaleProperty = void 0;
/**
 * A universal locale Property that is accessible independently of the running Sim instance.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var Property_js_1 = require("../../../axon/js/Property.js");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
var StringUtils_js_1 = require("../../../phetcommon/js/util/StringUtils.js");
var globalKeyStateTracker_js_1 = require("../../../scenery/js/accessibility/globalKeyStateTracker.js");
var KeyboardUtils_js_1 = require("../../../scenery/js/accessibility/KeyboardUtils.js");
var Tandem_js_1 = require("../../../tandem/js/Tandem.js");
var StringIO_js_1 = require("../../../tandem/js/types/StringIO.js");
var joist_js_1 = require("../joist.js");
assert && assert(phet.chipper.locale, 'phet.chipper.locale global expected');
assert && assert(phet.chipper.localeData, 'phet.chipper.localeData global expected');
assert && assert(phet.chipper.strings, 'phet.chipper.strings global expected');
// Sort these properly by their localized name (without using _.sortBy, since string comparison does not provide
// a good sorting experience). See https://github.com/phetsims/joist/issues/965
var availableRuntimeLocales = Object.keys(phet.chipper.strings).sort(function (a, b) {
    var lowerCaseA = StringUtils_js_1.default.localeToLocalizedName(a).toLowerCase();
    var lowerCaseB = StringUtils_js_1.default.localeToLocalizedName(b).toLowerCase();
    return lowerCaseA.localeCompare(lowerCaseB, 'en-US', { sensitivity: 'base' });
});
var LocaleProperty = /** @class */ (function (_super) {
    __extends(LocaleProperty, _super);
    function LocaleProperty(value, providedOptions) {
        var _this = this;
        var options = (0, optionize_js_1.default)()({
            valueType: 'string',
            phetioValueType: StringIO_js_1.default
        }, providedOptions);
        _this = _super.call(this, value, options) || this;
        _this.availableRuntimeLocales = availableRuntimeLocales;
        _this._isLocaleChanging = false;
        return _this;
    }
    Object.defineProperty(LocaleProperty.prototype, "isLocaleChanging", {
        /**
         * True when the locale is in the process of changing, so that you can opt out of work while many strings are changing.
         */
        get: function () {
            return this._isLocaleChanging;
        },
        enumerable: false,
        configurable: true
    });
    // Override to provide grace and support for the full definition of allowed locales (aligned with the query parameter
    // schema). For example three letter values, and case insensitivity. See checkAndRemapLocale() for details. NOTE that
    // this will assert if the locale doesn't match the right format.
    LocaleProperty.prototype.unguardedSet = function (value) {
        this._isLocaleChanging = true;
        // NOTE: updates phet.chipper.locale as a side-effect
        _super.prototype.unguardedSet.call(this, phet.chipper.checkAndRemapLocale(value, true));
        this._isLocaleChanging = false;
    };
    // This improves the PhET-iO Studio interface, by giving available values, without triggering validation if you want
    // to use the more general locale schema (three digit/case-insensitive/etc).
    LocaleProperty.prototype.toStateObject = function () {
        var parentObject = _super.prototype.toStateObject.call(this);
        // Provide via validValues without forcing validation assertions if a different value is set.
        parentObject.validValues = __spreadArray([], this.availableRuntimeLocales, true).sort();
        return parentObject;
    };
    Object.defineProperty(LocaleProperty.prototype, "supportsDynamicLocale", {
        // Dynamic local switching is not supported if there is only one available runtime locale
        get: function () {
            return this.availableRuntimeLocales.length > 1;
        },
        enumerable: false,
        configurable: true
    });
    return LocaleProperty;
}(Property_js_1.default));
exports.LocaleProperty = LocaleProperty;
var localeProperty = new LocaleProperty(phet.chipper.locale, {
    disableListenerLimit: true,
    tandem: Tandem_js_1.default.GENERAL_MODEL.createTandem('localeProperty'),
    phetioFeatured: true,
    phetioDocumentation: 'Specifies language currently displayed in the simulation',
    // getStringModule leverages listener order dependencies to only update the Fluent bundle once when all strings change
    // due to a locale changing, see https://github.com/phetsims/chipper/issues/1588
    hasListenerOrderDependencies: true
});
if ((_c = (_b = (_a = window.phet) === null || _a === void 0 ? void 0 : _a.chipper) === null || _b === void 0 ? void 0 : _b.queryParameters) === null || _c === void 0 ? void 0 : _c.keyboardLocaleSwitcher) {
    // DUPLICATION ALERT: don't change these without consulting PHET_IO_WRAPPERS/PhetioClient.initializeKeyboardLocaleSwitcher()
    var FORWARD_KEY_1 = KeyboardUtils_js_1.default.KEY_I;
    var BACKWARD_KEY_1 = KeyboardUtils_js_1.default.KEY_U;
    globalKeyStateTracker_js_1.default.keydownEmitter.addListener(function (event) {
        var bump = function (delta) {
            // Ctrl + u in Chrome on Windows is "view source" in a new tab
            event.preventDefault();
            var index = availableRuntimeLocales.indexOf(localeProperty.value);
            var nextIndex = (index + delta + availableRuntimeLocales.length) % availableRuntimeLocales.length;
            localeProperty.value = availableRuntimeLocales[nextIndex];
            // Indicate the new locale on the console
            console.log(localeProperty.value);
        };
        if (event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey) {
            if (KeyboardUtils_js_1.default.isKeyEvent(event, FORWARD_KEY_1)) {
                bump(+1);
            }
            else if (KeyboardUtils_js_1.default.isKeyEvent(event, BACKWARD_KEY_1)) {
                bump(-1);
            }
        }
    });
}
joist_js_1.default.register('localeProperty', localeProperty);
exports.default = localeProperty;
