"use strict";
// Copyright 2019-2024, University of Colorado Boulder
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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A tandem for a dynamic element that stores the name of the archetype that defines its dynamic element's schema.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var Tandem_js_1 = require("./Tandem.js");
var TandemConstants_js_1 = require("./TandemConstants.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var DynamicTandem = /** @class */ (function (_super) {
    __extends(DynamicTandem, _super);
    function DynamicTandem(parentTandem, name, providedOptions) {
        assert && assert(parentTandem, 'DynamicTandem must have a parentTandem');
        var options = (0, optionize_js_1.default)()({
            isValidTandemName: function (name) { return Tandem_js_1.default.getRegexFromCharacterClass(TandemConstants_js_1.default.BASE_DYNAMIC_TANDEM_CHARACTER_CLASS).test(name); }
        }, providedOptions);
        return _super.call(this, parentTandem, name, options) || this;
    }
    return DynamicTandem;
}(Tandem_js_1.default));
tandemNamespace_js_1.default.register('DynamicTandem', DynamicTandem);
exports.default = DynamicTandem;
