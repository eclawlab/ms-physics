"use strict";
// Copyright 2020-2026, University of Colorado Boulder
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
 * Describes the phases that a Property can go through in its value setting and notification lifecycle.
 *
 * UNDEFER - the phase when `Property.setDeferred(false)` is called and Property.value becomes accurate
 * NOTIFY - the phase when notifications are fired for Properties that have had a value change since becoming deferred
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var Enumeration_js_1 = require("../../phet-core/js/Enumeration.js");
var EnumerationValue_js_1 = require("../../phet-core/js/EnumerationValue.js");
var axon_js_1 = require("./axon.js");
var PropertyStatePhase = /** @class */ (function (_super) {
    __extends(PropertyStatePhase, _super);
    function PropertyStatePhase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PropertyStatePhase.UNDEFER = new PropertyStatePhase();
    PropertyStatePhase.NOTIFY = new PropertyStatePhase();
    PropertyStatePhase.enumeration = new Enumeration_js_1.default(PropertyStatePhase);
    return PropertyStatePhase;
}(EnumerationValue_js_1.default));
axon_js_1.default.register('PropertyStatePhase', PropertyStatePhase);
exports.default = PropertyStatePhase;
