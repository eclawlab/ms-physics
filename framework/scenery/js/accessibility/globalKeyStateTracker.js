"use strict";
// Copyright 2020-2025, University of Colorado Boulder
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
 * A global object that tracks the state of the keyboard for the Window. Use this
 * to get information about which keyboard keys are pressed down and for how long.
 *
 * @author Michael Kauzmann
 * @author Jesse Greenberg
 */
var Tandem_js_1 = require("../../../tandem/js/Tandem.js");
var KeyStateTracker_js_1 = require("../accessibility/KeyStateTracker.js");
var scenery_js_1 = require("../scenery.js");
var GlobalKeyStateTracker = /** @class */ (function (_super) {
    __extends(GlobalKeyStateTracker, _super);
    function GlobalKeyStateTracker(options) {
        return _super.call(this, options) || this;
    }
    return GlobalKeyStateTracker;
}(KeyStateTracker_js_1.default));
var globalKeyStateTracker = new GlobalKeyStateTracker({
    tandem: Tandem_js_1.default.GENERAL_CONTROLLER.createTandem('keyStateTracker')
});
scenery_js_1.default.register('globalKeyStateTracker', globalKeyStateTracker);
exports.default = globalKeyStateTracker;
