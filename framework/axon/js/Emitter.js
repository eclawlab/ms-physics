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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Event & listener abstraction for a single "event" type. The type provides extra functionality beyond just notifying
 * listeners. It adds PhET-iO instrumentation capabilities as well as validation. For the lightest-weight, fastest
 * solution with the smallest memory footprint, see `TinyEmitter`.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var IOTypeCache_js_1 = require("../../tandem/js/IOTypeCache.js");
var PhetioDataHandler_js_1 = require("../../tandem/js/PhetioDataHandler.js");
var Tandem_js_1 = require("../../tandem/js/Tandem.js");
var ArrayIO_js_1 = require("../../tandem/js/types/ArrayIO.js");
var FunctionIO_js_1 = require("../../tandem/js/types/FunctionIO.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var NullableIO_js_1 = require("../../tandem/js/types/NullableIO.js");
var StringIO_js_1 = require("../../tandem/js/types/StringIO.js");
var VoidIO_js_1 = require("../../tandem/js/types/VoidIO.js");
var axon_js_1 = require("./axon.js");
var TinyEmitter_js_1 = require("./TinyEmitter.js");
// By default, Emitters are not stateful
var PHET_IO_STATE_DEFAULT = false;
var Emitter = /** @class */ (function (_super) {
    __extends(Emitter, _super);
    function Emitter(providedOptions) {
        var _this = this;
        var options = (0, optionize_js_1.default)()({
            reentrantNotificationStrategy: 'stack',
            disableListenerLimit: false,
            phetioOuterType: Emitter.EmitterIO,
            phetioState: PHET_IO_STATE_DEFAULT
        }, providedOptions);
        _this = _super.call(this, options) || this;
        _this.tinyEmitter = new TinyEmitter_js_1.default(null, options.hasListenerOrderDependencies, options.reentrantNotificationStrategy);
        return _this;
    }
    /**
     * Emit to notify listeners
     */
    Emitter.prototype.emit = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        assert && assert(this.tinyEmitter instanceof TinyEmitter_js_1.default, 'Emitter should not emit until constructor complete');
        assert && this.validateArguments.apply(this, args);
        // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
        // called so many times that it is worth the optimization for PhET brand.
        Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent('emitted', {
            data: this.getPhetioData.apply(this, args)
        });
        (_a = this.tinyEmitter).emit.apply(_a, args);
        Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
    };
    /**
     * Disposes an Emitter. All listeners are removed.
     */
    Emitter.prototype.dispose = function () {
        this.tinyEmitter.dispose();
        _super.prototype.dispose.call(this);
    };
    /**
     * Adds a listener which will be called during emit.
     */
    Emitter.prototype.addListener = function (listener, options) {
        var _this = this;
        this.tinyEmitter.addListener(listener);
        // If a disposer is specified, then automatically remove this listener when the disposer is disposed.
        (options === null || options === void 0 ? void 0 : options.disposer) && this.addDisposerAction('listener', listener, options.disposer, function () { return _this.removeListener(listener); });
    };
    /**
     * Removes a listener
     */
    Emitter.prototype.removeListener = function (listener) {
        this.tinyEmitter.removeListener(listener);
        // undo addDisposer (see above)
        this.removeDisposerAction('listener', listener);
    };
    /**
     * Removes all the listeners
     */
    Emitter.prototype.removeAllListeners = function () {
        this.tinyEmitter.removeAllListeners();
        // undo addDisposer (see above)
        this.removeAllDisposerActions('listener');
    };
    /**
     * Checks whether a listener is registered with this Emitter
     */
    Emitter.prototype.hasListener = function (listener) {
        return this.tinyEmitter.hasListener(listener);
    };
    /**
     * Returns true if there are any listeners.
     */
    Emitter.prototype.hasListeners = function () {
        return this.tinyEmitter.hasListeners();
    };
    /**
     * Returns the number of listeners.
     */
    Emitter.prototype.getListenerCount = function () {
        return this.tinyEmitter.getListenerCount();
    };
    /**
     * Convenience function for debugging a Property's value. It prints the new value on registration and when changed.
     * @param name - debug name to be printed on the console
     * @returns - the handle to the listener added in case it needs to be removed later
     */
    Emitter.prototype.debug = function (name) {
        var listener = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return console.log.apply(console, __spreadArray([name], args, false));
        };
        this.addListener(listener);
        return listener;
    };
    /**
     * PhET-iO Type for Emitter.
     *
     * Providing validators to instrumented Emitters:
     * Instrumented Emitters should have their `validators` for each argument passed via EmitterIO (the phetioType).
     * To provide validators, there are two methods. First, by default each IOType has its own
     * validator that will be used. So specifying an argument object like `{ type: NumberIO }` will automatically use
     * `NumberIO.validator` as the validator. This can be overridden with the `validator` key (second option), like
     * { type: NumberIO, validator: { isValidValue: v=> typeof v === 'number' &&  v < 5 } }`
     * NOTE: currently the implementation is either/or, if a validator is provided via the `validator` key, the validator
     * from the `type` will be ignored.
     * see https://github.com/phetsims/axon/issues/204 for more details.
     *
     * @author Sam Reid (PhET Interactive Simulations)
     * @author Michael Kauzmann (PhET Interactive Simulations)
     * @author Andrew Adare (PhET Interactive Simulations)
     */
    Emitter.EmitterIO = function (parameterTypes) {
        var key = parameterTypes.map(getTypeName).join(',');
        if (!cache.has(key)) {
            cache.set(key, new IOType_js_1.default("EmitterIO<".concat(parameterTypes.map(getTypeName).join(', '), ">"), {
                valueType: Emitter,
                documentation: 'Emits when an event occurs and calls added listeners.',
                parameterTypes: parameterTypes,
                events: ['emitted'],
                metadataDefaults: {
                    phetioState: PHET_IO_STATE_DEFAULT
                },
                methods: {
                    addListener: {
                        returnType: VoidIO_js_1.default,
                        parameterTypes: [(0, FunctionIO_js_1.default)(VoidIO_js_1.default, parameterTypes)],
                        implementation: Emitter.prototype.addListener,
                        documentation: 'Adds a listener which will be called when the emitter emits.'
                    },
                    removeListener: {
                        returnType: VoidIO_js_1.default,
                        parameterTypes: [(0, FunctionIO_js_1.default)(VoidIO_js_1.default, parameterTypes)],
                        implementation: Emitter.prototype.removeListener,
                        documentation: 'Remove a listener.'
                    },
                    emit: {
                        returnType: VoidIO_js_1.default,
                        parameterTypes: parameterTypes,
                        // Match `Emitter.emit`'s dynamic number of arguments
                        implementation: function () {
                            var values = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                values[_i] = arguments[_i];
                            }
                            this.emit.apply(this, values);
                        },
                        documentation: 'Emits a single event to all listeners.',
                        invocableForReadOnlyElements: false
                    },
                    getValidationErrors: {
                        returnType: (0, ArrayIO_js_1.default)((0, NullableIO_js_1.default)(StringIO_js_1.default)),
                        parameterTypes: parameterTypes,
                        implementation: function () {
                            var values = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                values[_i] = arguments[_i];
                            }
                            return this.getValidationErrors.apply(this, values);
                        },
                        documentation: 'Checks to see if the proposed values are valid. Returns an array of length N where each element is an error (string) or null if the value is valid.'
                    }
                }
            }));
        }
        return cache.get(key);
    };
    return Emitter;
}(PhetioDataHandler_js_1.default));
exports.default = Emitter;
var getTypeName = function (ioType) { return ioType.typeName; };
// {Map.<string, IOType>} - Cache each parameterized IOType so that
// it is only created once.
var cache = new IOTypeCache_js_1.default();
axon_js_1.default.register('Emitter', Emitter);
