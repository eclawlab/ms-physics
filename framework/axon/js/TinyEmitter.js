"use strict";
// Copyright 2015-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Lightweight event & listener abstraction for a single event type.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var dotRandom_js_1 = require("../../dot/js/dotRandom.js");
var Random_js_1 = require("../../dot/js/Random.js");
var Pool_js_1 = require("../../phet-core/js/Pool.js");
var axon_js_1 = require("./axon.js");
// constants
var listenerOrder = _.hasIn(window, 'phet.chipper.queryParameters') && phet.chipper.queryParameters.listenerOrder;
var listenerLimit = _.hasIn(window, 'phet.chipper.queryParameters') && phet.chipper.queryParameters.listenerLimit;
var EMIT_CONTEXT_MAX_LENGTH = 1000;
var random = null;
if (listenerOrder && listenerOrder.startsWith('random')) {
    // NOTE: this regular expression must be maintained in initialize-globals as well.
    var match = listenerOrder.match(/random(?:%28|\()(\d+)(?:%29|\))/);
    var seed = match ? Number(match[1]) : dotRandom_js_1.default.nextInt(1000000);
    random = new Random_js_1.default({ seed: seed });
    console.log('listenerOrder random seed: ' + seed);
}
// Store the number of listeners from the single TinyEmitter instance that has the most listeners in the whole runtime.
var maxListenerCount = 0;
var TinyEmitter = /** @class */ (function () {
    // Null on parameters is a no-op
    function TinyEmitter(onBeforeNotify, hasListenerOrderDependencies, reentrantNotificationStrategy, disableListenerLimit) {
        // During emit() keep track of iteration progress and guard listeners if mutated during emit()
        this.emitContexts = [];
        if (onBeforeNotify) {
            this.onBeforeNotify = onBeforeNotify;
        }
        if (hasListenerOrderDependencies) {
            this.hasListenerOrderDependencies = hasListenerOrderDependencies;
        }
        if (reentrantNotificationStrategy) {
            this.reentrantNotificationStrategy = reentrantNotificationStrategy;
        }
        if (disableListenerLimit) {
            this.disableListenerLimit = disableListenerLimit;
        }
        // Listener order is preserved in Set
        this.listeners = new Set();
        // for production memory concerns; no need to keep this around.
        if (assert) {
            this.isDisposed = false;
        }
    }
    /**
     * Disposes an Emitter. All listeners are removed.
     */
    TinyEmitter.prototype.dispose = function () {
        this.removeAllListeners();
        if (assert) {
            this.isDisposed = true;
        }
    };
    /**
     * Notify listeners
     */
    TinyEmitter.prototype.emit = function () {
        var _a, _b;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        assert && assert(!this.isDisposed, 'TinyEmitter.emit() should not be called if disposed.');
        // optional callback, before notifying listeners
        this.onBeforeNotify && this.onBeforeNotify.apply(null, args);
        // Support for a query parameter that shuffles listeners, but bury behind assert so it will be stripped out on build
        // so it won't impact production performance.
        if (assert && listenerOrder && (listenerOrder !== 'default') && !this.hasListenerOrderDependencies) {
            var asArray = Array.from(this.listeners);
            var reorderedListeners = listenerOrder.startsWith('random') ? random.shuffle(asArray) : asArray.reverse();
            this.listeners = new Set(reorderedListeners);
        }
        // Notify wired-up listeners, if any
        if (this.listeners.size > 0) {
            // We may not be able to emit right away. If we are already emitting and this is a recursive call, then that
            // first emit needs to finish notifying its listeners before we start our notifications (in queue mode), so store
            // the args for later. No slice needed, we're not modifying the args array.
            var emitContext = EmitContext.create(0, args);
            this.emitContexts.push(emitContext);
            if (this.reentrantNotificationStrategy === 'queue') {
                // This handles all reentrancy here (with a while loop), instead of doing so with recursion. If not the first context, then no-op because a previous call will handle this call's listener notifications.
                if (this.emitContexts.length === 1) {
                    while (this.emitContexts.length) {
                        // Don't remove it from the list here. We need to be able to guardListeners.
                        var emitContext_1 = this.emitContexts[0];
                        // It is possible that this emitContext is later on in the while loop, and has already had a listenerArray set
                        var listeners = emitContext_1.hasListenerArray ? emitContext_1.listenerArray : this.listeners;
                        this.notifyLoop(emitContext_1, listeners);
                        (_a = this.emitContexts.shift()) === null || _a === void 0 ? void 0 : _a.freeToPool();
                    }
                }
                else {
                    assert && assert(this.emitContexts.length <= EMIT_CONTEXT_MAX_LENGTH, "emitting reentrant depth of ".concat(EMIT_CONTEXT_MAX_LENGTH, " seems like a infinite loop to me!"));
                }
            }
            else if (!this.reentrantNotificationStrategy || this.reentrantNotificationStrategy === 'stack') {
                this.notifyLoop(emitContext, this.listeners);
                (_b = this.emitContexts.pop()) === null || _b === void 0 ? void 0 : _b.freeToPool();
            }
            else {
                assert && assert(false, "Unknown reentrantNotificationStrategy: ".concat(this.reentrantNotificationStrategy));
            }
        }
    };
    /**
     * Execute the notification of listeners (from the provided context and list). This function supports guarding against
     * if listener order changes during the notification process, see guardListeners.
     */
    TinyEmitter.prototype.notifyLoop = function (emitContext, listeners) {
        var _a;
        var args = emitContext.args;
        for (var _i = 0, listeners_1 = listeners; _i < listeners_1.length; _i++) {
            var listener = listeners_1[_i];
            listener.apply(void 0, args);
            emitContext.index++;
            // If a listener was added or removed, we cannot continue processing the mutated Set, we must switch to
            // iterate over the guarded array
            if (emitContext.hasListenerArray) {
                break;
            }
        }
        // If the listeners were guarded during emit, we bailed out on the for..of and continue iterating over the original
        // listeners in order from where we left off.
        if (emitContext.hasListenerArray) {
            for (var i = emitContext.index; i < emitContext.listenerArray.length; i++) {
                (_a = emitContext.listenerArray)[i].apply(_a, args);
            }
        }
    };
    /**
     * Adds a listener which will be called during emit.
     */
    TinyEmitter.prototype.addListener = function (listener) {
        assert && assert(!this.isDisposed, 'Cannot add a listener to a disposed TinyEmitter');
        assert && assert(!this.hasListener(listener), 'Cannot add the same listener twice');
        // If a listener is added during an emit(), we must make a copy of the current list of listeners--the newly added
        // listener will be available for the next emit() but not the one in progress.  This is to match behavior with
        // removeListener.
        this.guardListeners();
        this.listeners.add(listener);
        this.changeCount && this.changeCount(1);
        if (assert && !this.disableListenerLimit && listenerLimit && isFinite(listenerLimit) && maxListenerCount < this.listeners.size) {
            maxListenerCount = this.listeners.size;
            console.log("Max TinyEmitter listeners: ".concat(maxListenerCount));
            assert(maxListenerCount <= listenerLimit, "listener count of ".concat(maxListenerCount, " above ?listenerLimit=").concat(listenerLimit));
        }
    };
    /**
     * Removes a listener
     */
    TinyEmitter.prototype.removeListener = function (listener) {
        // Throw an error when removing a non-listener (except when the Emitter has already been disposed, see
        // https://github.com/phetsims/sun/issues/394#issuecomment-419998231
        if (assert && !this.isDisposed) {
            assert(this.listeners.has(listener), 'tried to removeListener on something that wasn\'t a listener');
        }
        this.guardListeners();
        this.listeners.delete(listener);
        this.changeCount && this.changeCount(-1);
    };
    /**
     * Removes all the listeners
     */
    TinyEmitter.prototype.removeAllListeners = function () {
        var size = this.listeners.size;
        this.guardListeners();
        this.listeners.clear();
        this.changeCount && this.changeCount(-size);
    };
    /**
     * If listeners are added/removed while emit() is in progress, we must make a defensive copy of the array of listeners
     * before changing the array, and use it for the rest of the notifications until the emit call has completed.
     */
    TinyEmitter.prototype.guardListeners = function () {
        var _a;
        for (var i = this.emitContexts.length - 1; i >= 0; i--) {
            var emitContext = this.emitContexts[i];
            // Once we meet a level that was already guarded, we can stop, since all previous levels were already guarded
            if (emitContext.hasListenerArray) {
                break;
            }
            // Mark copies as 'guarded' so that it will use the original listeners when emit started and not the modified
            // list.
            (_a = emitContext.listenerArray).push.apply(_a, this.listeners);
            emitContext.hasListenerArray = true;
        }
    };
    /**
     * Checks whether a listener is registered with this Emitter
     */
    TinyEmitter.prototype.hasListener = function (listener) {
        assert && assert(arguments.length === 1, 'Emitter.hasListener should be called with 1 argument');
        return this.listeners.has(listener);
    };
    /**
     * Returns true if there are any listeners.
     */
    TinyEmitter.prototype.hasListeners = function () {
        assert && assert(arguments.length === 0, 'Emitter.hasListeners should be called without arguments');
        return this.listeners.size > 0;
    };
    /**
     * Returns the number of listeners.
     */
    TinyEmitter.prototype.getListenerCount = function () {
        return this.listeners.size;
    };
    /**
     * Invokes a callback once for each listener - meant for Property's use
     */
    TinyEmitter.prototype.forEachListener = function (callback) {
        this.listeners.forEach(callback);
    };
    return TinyEmitter;
}());
exports.default = TinyEmitter;
/**
 * Utility class for managing the context of an emit call. This is used to manage the state of the emit call, and
 * especially to handle reentrant emit calls (through the stack/queue notification strategies)
 */
var EmitContext = /** @class */ (function () {
    function EmitContext(index, args) {
        // Whether we should act like there is a listenerArray (has it been copied?)
        this.hasListenerArray = false;
        // Only use this if hasListenerArray is true. NOTE: for performance, we're not using getters/etc.
        this.listenerArray = [];
        this.initialize(index, args);
    }
    EmitContext.prototype.initialize = function (index, args) {
        this.index = index;
        this.args = args;
        this.hasListenerArray = false;
        return this;
    };
    EmitContext.prototype.freeToPool = function () {
        EmitContext.pool.freeToPool(this);
        // NOTE: If we have fewer concerns about memory in the future, we could potentially improve performance by
        // removing the clearing out of memory here. We don't seem to create many EmitContexts, HOWEVER if we have ONE
        // "more re-entrant" case on sim startup that references a BIG BIG object, it could theoretically keep that
        // object alive forever.
        // We want to null things out to prevent memory leaks. Don't tell TypeScript!
        // (It will have the correct types after the initialization, so this works well with our pooling pattern).
        this.args = null;
        // Clear out the listeners array, so we don't leak memory while we are in the pool. If we have less concerns
        this.listenerArray.length = 0;
    };
    EmitContext.create = function (index, args) {
        // TypeScript doesn't need to know that we're using this for different types. When it is "active", it will be
        // the correct type.
        return EmitContext.pool.create(index, args);
    };
    EmitContext.pool = new Pool_js_1.default(EmitContext, {
        initialize: EmitContext.prototype.initialize
    });
    return EmitContext;
}());
axon_js_1.default.register('TinyEmitter', TinyEmitter);
