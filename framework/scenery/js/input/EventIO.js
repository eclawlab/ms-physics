"use strict";
// Copyright 2018-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var BooleanIO_js_1 = require("../../../tandem/js/types/BooleanIO.js");
var IOType_js_1 = require("../../../tandem/js/types/IOType.js");
var NullableIO_js_1 = require("../../../tandem/js/types/NullableIO.js");
var NumberIO_js_1 = require("../../../tandem/js/types/NumberIO.js");
var ObjectLiteralIO_js_1 = require("../../../tandem/js/types/ObjectLiteralIO.js");
var StringIO_js_1 = require("../../../tandem/js/types/StringIO.js");
var scenery_js_1 = require("../scenery.js");
var eventSerialization_js_1 = require("./eventSerialization.js");
var EventIO = new IOType_js_1.default('EventIO', {
    valueType: window.Event,
    documentation: 'A DOM Event',
    toStateObject: function (domEvent) { return (0, eventSerialization_js_1.serializeDomEvent)(domEvent); },
    fromStateObject: function (stateObject) { return (0, eventSerialization_js_1.deserializeDomEvent)(stateObject); },
    // This should remain the same as Input.domEventPropertiesToSerialize (local var). Each key can be null depending on
    // what Event interface is being serialized (which depends on what DOM Event the instance is).
    stateSchema: function () { return ({
        constructorName: StringIO_js_1.default,
        altKey: (0, NullableIO_js_1.default)(BooleanIO_js_1.default),
        button: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        charCode: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        clientX: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        clientY: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        code: (0, NullableIO_js_1.default)(StringIO_js_1.default),
        ctrlKey: (0, NullableIO_js_1.default)(BooleanIO_js_1.default),
        deltaMode: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        deltaX: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        deltaY: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        deltaZ: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        key: (0, NullableIO_js_1.default)(StringIO_js_1.default),
        keyCode: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        metaKey: (0, NullableIO_js_1.default)(BooleanIO_js_1.default),
        pageX: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        pageY: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        pointerId: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        pointerType: (0, NullableIO_js_1.default)(StringIO_js_1.default),
        scale: (0, NullableIO_js_1.default)(NumberIO_js_1.default),
        shiftKey: (0, NullableIO_js_1.default)(BooleanIO_js_1.default),
        target: (0, NullableIO_js_1.default)(ObjectLiteralIO_js_1.default),
        type: (0, NullableIO_js_1.default)(StringIO_js_1.default),
        relatedTarget: (0, NullableIO_js_1.default)(ObjectLiteralIO_js_1.default),
        which: (0, NullableIO_js_1.default)(NumberIO_js_1.default)
    }); }
});
scenery_js_1.default.register('EventIO', EventIO);
exports.default = EventIO;
