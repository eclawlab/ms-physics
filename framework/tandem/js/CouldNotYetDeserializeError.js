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
 * Error to be thrown if a failure occurs downstream of setting state because another state setting operation needs
 * to occur before "this" operation can succeed. For example, in reference serialization for dynamic PhetioObjects,
 * the dynamic instance must be created by the state engine before anything can reference it. By triggering this error,
 * we say "a failure here is alright, we will try again on the next iteration of setting the state. See
 * `phetioStateEngine.iterate` for more information.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var CouldNotYetDeserializeError = /** @class */ (function (_super) {
    __extends(CouldNotYetDeserializeError, _super);
    function CouldNotYetDeserializeError() {
        return _super.call(this, 'CouldNotYetDeserializeError') || this; // Do not change this message without consulting appropriate usages.
    }
    return CouldNotYetDeserializeError;
}(Error));
tandemNamespace_js_1.default.register('CouldNotYetDeserializeError', CouldNotYetDeserializeError);
exports.default = CouldNotYetDeserializeError;
