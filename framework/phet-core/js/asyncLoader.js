"use strict";
// Copyright 2021-2025, University of Colorado Boulder
/**
 * Singleton which keeps track of all async items currently loading, and doesn't proceed until all have been loaded.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
Object.defineProperty(exports, "__esModule", { value: true });
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var arrayRemove_js_1 = require("../../phet-core/js/arrayRemove.js");
var phetCore_js_1 = require("./phetCore.js");
var AsyncLoader = /** @class */ (function () {
    function AsyncLoader() {
        this.pendingLocks = [];
        this.loadComplete = false;
        this.listeners = [];
        this.stageComplete = this.createLock('stage');
    }
    // Allow resetting this for sandbox or other non-sim purposes. We'll want to be able to load resources AFTER
    // we've completed loading.
    AsyncLoader.prototype.reset = function () {
        this.loadComplete = false;
        this.stageComplete = this.createLock('stage');
    };
    /**
     * @param listener - called when load is complete
     */
    AsyncLoader.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };
    /**
     * Attempts to proceed to the next phase if possible (otherwise it's a no-op).
     *
     * NOTE: If potentially loading more resources, this should call reset().
     */
    AsyncLoader.prototype.proceedIfReady = function () {
        if (this.pendingLocks.length === 0) {
            (0, affirm_js_1.default)(!this.loadComplete, 'cannot complete load twice without a reset() in-between');
            this.loadComplete = true;
            this.listeners.forEach(function (listener) { return listener(); });
        }
    };
    /**
     * Creates a lock, which is a callback that needs to be run before we can proceed.
     */
    AsyncLoader.prototype.createLock = function (object) {
        var _this = this;
        (0, affirm_js_1.default)(!this.loadComplete, 'Cannot create more locks after a stage has completed unless reset() is called');
        this.pendingLocks.push(object);
        return function () {
            (0, affirm_js_1.default)(_this.pendingLocks.includes(object), 'invalid lock');
            (0, arrayRemove_js_1.default)(_this.pendingLocks, object);
            _this.proceedIfReady();
        };
    };
    return AsyncLoader;
}());
var asyncLoader = new AsyncLoader();
phetCore_js_1.default.register('asyncLoader', asyncLoader);
exports.default = asyncLoader;
