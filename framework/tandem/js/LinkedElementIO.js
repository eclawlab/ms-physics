"use strict";
// Copyright 2018-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var Tandem_js_1 = require("./Tandem.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var IOType_js_1 = require("./types/IOType.js");
var StringIO_js_1 = require("./types/StringIO.js");
var LinkedElementIO = new IOType_js_1.default('LinkedElementIO', {
    isValidValue: function () { return true; },
    documentation: 'A LinkedElement',
    toStateObject: function (linkedElement) {
        assert && Tandem_js_1.default.VALIDATION && assert(linkedElement.element.isPhetioInstrumented(), 'Linked elements must be instrumented');
        return { elementID: linkedElement.element.tandem.phetioID };
    },
    // Override the parent implementation as a no-op.  LinkedElement elementID appears in the state, but should not be set
    // back into a running simulation.
    applyState: _.noop,
    stateSchema: {
        elementID: StringIO_js_1.default
    },
    apiStateKeys: ['elementID']
});
tandemNamespace_js_1.default.register('LinkedElementIO', LinkedElementIO);
exports.default = LinkedElementIO;
