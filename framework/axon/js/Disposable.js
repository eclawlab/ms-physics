"use strict";
// Copyright 2022-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A base class to help with managing disposal. Creates a disposeEmitter that will be fired when disposing. This occurs
 * AFTER all prototype dispose() methods have been called up the hierarchy, so be aware of potential disposal order
 * issues if using disposeEmitter and dispose() logic together.
 *
 * This class also includes a public flag set to true when disposed.
 *
 * You can also opt into asserting out when disposing, preventing disposal on your class, see Disposable.isDisposable
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var axon_js_1 = require("./axon.js");
var TinyEmitter_js_1 = require("./TinyEmitter.js");
var Disposable = /** @class */ (function () {
    // Most time, Disposable should only be used by subtypes, only instantiate it if you run into multiple inheritance issues.
    function Disposable(providedOptions) {
        var _this = this;
        // Called after all code that is directly in `dispose()` methods. Be careful with mixing this pattern and the
        // `this.disposeMyClass()` pattern.
        this._disposeEmitter = new TinyEmitter_js_1.default();
        // Keep track if this instance supports disposing. If set to false, then an assertion will fire if trying to dispose
        // this instance.
        this._isDisposable = true;
        // Marked true when this Disposable has had dispose() called on it (after disposeEmitter is fired)
        this._isDisposed = false;
        providedOptions && this.initializeDisposable(providedOptions);
        if ((0, affirm_js_1.isAffirmEnabled)()) {
            // Wrap the prototype dispose method with a check. NOTE: We will not catch devious cases where the dispose() is
            // overridden after the Node constructor (which may happen).
            var protoDispose_1 = this.dispose;
            this.dispose = function () {
                (0, affirm_js_1.default)(!_this._isDisposed, 'This Disposable has already been disposed, and cannot be disposed again');
                protoDispose_1.call(_this);
                (0, affirm_js_1.default)(_this._isDisposed, 'Disposable.dispose() call is missing from an overridden dispose method');
            };
        }
    }
    Disposable.prototype.getDisposeEmitter = function () {
        return this._disposeEmitter;
    };
    Object.defineProperty(Disposable.prototype, "disposeEmitter", {
        get: function () {
            return this.getDisposeEmitter();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Disposable.prototype, "isDisposed", {
        get: function () {
            return this._isDisposed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Disposable.prototype, "isDisposable", {
        get: function () {
            return this._isDisposable;
        },
        set: function (isDisposable) {
            this._isDisposable = isDisposable;
        },
        enumerable: false,
        configurable: true
    });
    Disposable.prototype.initializeDisposable = function (options) {
        if (options && options.hasOwnProperty('isDisposable')) {
            this._isDisposable = options.isDisposable;
        }
    };
    /**
     * Add disposables that will be disposed when this instance is disposed.
     */
    Disposable.prototype.addDisposable = function () {
        var disposables = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            disposables[_i] = arguments[_i];
        }
        this.disposeEmitter.addListener(function () {
            for (var i = 0; i < disposables.length; i++) {
                disposables[i].dispose();
            }
        });
    };
    Disposable.prototype.dispose = function () {
        (0, affirm_js_1.isAffirmEnabled)() && !this._isDisposable && Disposable.assertNotDisposable();
        (0, affirm_js_1.default)(!this._isDisposed, 'Disposable can only be disposed once');
        // Unregister any disposers that were responsible for a portion of ths instance's cleanup, since it is getting
        // disposed. Do this before disposing this class.
        if (this.disposerMap) {
            for (var _i = 0, _a = this.disposerMap; _i < _a.length; _i++) {
                var disposerActionType = _a[_i][0];
                this.removeAllDisposerActions(disposerActionType);
            }
        }
        this._disposeEmitter.emit();
        this._disposeEmitter.dispose();
        this._isDisposed = true;
    };
    /**
     * Adds an action for the target to the disposeEmitter for the given disposer, so that when the disposer is disposed,
     * the unregisterAction related to this instance is also called. For instance, the unregisterAction would be the
     * corresponding removal/unlink/removeInputListener.
     * It is assumed that the target and unregisterAction are related to the memory management of this instance.
     */
    Disposable.prototype.addDisposerAction = function (disposerActionType, target, disposer, unregisterAction) {
        this.disposerMap = this.disposerMap || new Map();
        if (!this.disposerMap.has(disposerActionType)) {
            this.disposerMap.set(disposerActionType, new Map());
        }
        var entries = this.disposerMap.get(disposerActionType);
        (0, affirm_js_1.default)(!entries.has(target), "Target already registered for disposer action type: ".concat(disposerActionType), target);
        // Function that will unregister the disposer action for the target.
        var unregisterActionCallback = function () {
            entries.delete(target);
            unregisterAction();
        };
        entries.set(target, { disposer: disposer, unregisterCallback: unregisterActionCallback });
        disposer.disposeEmitter.addListener(unregisterActionCallback);
    };
    /**
     * Remove the target on the disposer's disposeEmitter. This will not call the unregistration.
     */
    Disposable.prototype.removeDisposerAction = function (disposerActionType, target) {
        if (this.disposerMap) {
            var disposers = this.disposerMap.get(disposerActionType);
            if (disposers) {
                var entry = disposers.get(target);
                // If there is no entry, that means either:
                // a) this particular target was never registered with a disposer, which is fine.
                // b) or it has already been removed via the disposeEmitter or elsewhere.
                // Graceful is best here to avoid disposal order dependencies.
                if (entry) {
                    entry.disposer.disposeEmitter.removeListener(entry.unregisterCallback);
                    disposers.delete(target);
                }
                // NOTE: Do not delete any of the Maps, as they may be used again in the future.
            }
        }
    };
    // Remove all disposer actions for a given type
    Disposable.prototype.removeAllDisposerActions = function (disposerActionType) {
        var _this = this;
        if (this.disposerMap) {
            var disposers = this.disposerMap.get(disposerActionType);
            disposers && disposers.forEach(function (_, target) { return _this.removeDisposerAction(disposerActionType, target); });
        }
    };
    Disposable.assertNotDisposable = function () {
        // eslint-disable-next-line phet/bad-sim-text
        (0, affirm_js_1.default)(false, 'dispose is not supported, exists for the lifetime of the sim');
    };
    return Disposable;
}());
axon_js_1.default.register('Disposable', Disposable);
exports.default = Disposable;
