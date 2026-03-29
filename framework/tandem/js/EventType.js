"use strict";
// Copyright 2019-2022, University of Colorado Boulder
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
 * This characterizes events that may be emitted from PhetioObjects to the PhET-iO data stream.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var Enumeration_js_1 = require("../../phet-core/js/Enumeration.js");
var EnumerationValue_js_1 = require("../../phet-core/js/EnumerationValue.js");
var TandemConstants_js_1 = require("./TandemConstants.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var EnumerationIO_js_1 = require("./types/EnumerationIO.js");
var EventType = /** @class */ (function (_super) {
    __extends(EventType, _super);
    function EventType() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    var _a;
    _a = TandemConstants_js_1.default.EVENT_TYPE_MODEL;
    // The user has taken an action, such as pressing a button or moving a mouse
    EventType.USER = new EventType();
    // An event was produced by the simulation model. This could be in response to a user event, or something that happens
    // during the simulation step. Note the separation is not model vs view, but user-driven vs automatic.
    EventType[_a] = new EventType();
    // An event was triggered by the PhET-iO wrapper, via PhetioEngineIO.triggerEvent
    EventType.WRAPPER = new EventType();
    // These messages are suppressed, use this to opt a PhetioObject out of the data stream feature.
    EventType.OPT_OUT = new EventType();
    EventType.enumeration = new Enumeration_js_1.default(EventType);
    EventType.phetioType = (0, EnumerationIO_js_1.default)(EventType);
    return EventType;
}(EnumerationValue_js_1.default));
tandemNamespace_js_1.default.register('EventType', EventType);
exports.default = EventType;
