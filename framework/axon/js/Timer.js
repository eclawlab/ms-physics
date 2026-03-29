"use strict";
// Copyright 2019-2026, University of Colorado Boulder
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
 * Timer so that other modules can run timing related code through the simulation's requestAnimationFrame. Use its
 * Emitter interface for adding/removing listeners.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var axon_js_1 = require("./axon.js");
var TinyEmitter_js_1 = require("./TinyEmitter.js");
var Timer = /** @class */ (function (_super) {
    __extends(Timer, _super);
    function Timer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Adds a listener to be called back once after the specified time in milliseconds
     * @param listener - called with no arguments
     * @param timeout in milliseconds
     * @returns an internally-wrapped listener which can be removed with clearTimeout
     */
    Timer.prototype.setTimeout = function (listener, timeout) {
        var _this = this;
        var elapsed = 0;
        var callback = function (dt) {
            elapsed += dt;
            // Convert seconds to ms and see if item has timed out
            if (elapsed * 1000 >= timeout) {
                // make sure that this callback hasn't already been removed by another listener while emit() is in progress
                if (_this.hasListener(callback)) {
                    listener();
                    _this.removeListener(callback);
                }
            }
        };
        this.addListener(callback);
        // Return the callback so it can be removed with removeStepListener
        return callback;
    };
    /**
     * Clear a scheduled timeout. If there was no timeout, nothing is done.
     */
    Timer.prototype.clearTimeout = function (listener) {
        if (this.hasListener(listener)) {
            this.removeListener(listener);
        }
    };
    /**
     * Adds a listener to be called at specified intervals (in milliseconds)
     * @param listener - called with no arguments
     * @param interval - in milliseconds
     * @returns an internally-wrapped listener which can be removed with clearInterval
     */
    Timer.prototype.setInterval = function (listener, interval) {
        var _this = this;
        var elapsed = 0;
        var callback = function (dt) {
            elapsed += dt;
            // Convert seconds to ms and see if item has timed out
            while (elapsed * 1000 >= interval && _this.hasListener(callback)) {
                listener();
                elapsed = elapsed - interval / 1000.0; // Save the leftover time so it won't accumulate
            }
        };
        this.addListener(callback);
        // Return the callback so it can be removed if needed.
        return callback;
    };
    /**
     * Clear a scheduled interval. If there was no interval, nothing is done.
     */
    Timer.prototype.clearInterval = function (listener) {
        if (this.hasListener(listener)) {
            this.removeListener(listener);
        }
    };
    /**
     * Run a callback on the next frame. This method is largely for clarity.
     */
    Timer.prototype.runOnNextTick = function (listener) {
        this.setTimeout(listener, 0);
    };
    return Timer;
}(TinyEmitter_js_1.default));
exports.default = Timer;
axon_js_1.default.register('Timer', Timer);
