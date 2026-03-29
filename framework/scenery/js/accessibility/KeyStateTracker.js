"use strict";
// Copyright 2018-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A type that will manage the state of the keyboard. This will track which keys are being held down and for how long.
 * It also offers convenience methods to determine whether or not specific keys are down like shift or enter using
 * KeyboardUtils' key schema.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Michael Barlow
 */
var Emitter_js_1 = require("../../../axon/js/Emitter.js");
var stepTimer_js_1 = require("../../../axon/js/stepTimer.js");
var platform_js_1 = require("../../../phet-core/js/platform.js");
var EventType_js_1 = require("../../../tandem/js/EventType.js");
var PhetioAction_js_1 = require("../../../tandem/js/PhetioAction.js");
var EnglishStringToCodeMap_js_1 = require("../accessibility/EnglishStringToCodeMap.js");
var EventIO_js_1 = require("../input/EventIO.js");
var KeyboardUtils_js_1 = require("../accessibility/KeyboardUtils.js");
var scenery_js_1 = require("../scenery.js");
var KeyStateTracker = /** @class */ (function () {
    function KeyStateTracker(options) {
        var _this = this;
        var _a, _b;
        // Contains info about which keys are currently pressed for how long. JavaScript doesn't handle multiple key presses,
        // with events so we have to update this object ourselves.
        this.keyState = {};
        // The KeyboardEvent.code of the last key that was pressed down when updating the key state.
        this._lastKeyDown = null;
        // Whether this KeyStateTracker is attached to the document and listening for events.
        this.attachedToDocument = false;
        // Listeners potentially attached to the document to update the state of this KeyStateTracker, see attachToWindow()
        this.documentKeyupListener = null;
        this.documentKeydownListener = null;
        this.documentBlurListener = null;
        // If the KeyStateTracker is enabled. If disabled, keyState is cleared and listeners noop.
        this._enabled = true;
        // Emits events when keyup/keydown updates are received. These will emit after any updates to the
        // keyState so that keyState is correct in time for listeners. Note the valueType is a native KeyboardEvent event.
        this.keydownEmitter = new Emitter_js_1.default({ parameters: [{ valueType: KeyboardEvent }] });
        this.keyupEmitter = new Emitter_js_1.default({ parameters: [{ valueType: KeyboardEvent }] });
        // Emits when any key "down" state changes. This is useful for when you want to know if any key is down or up.
        // Does NOT change for timeDown changes. DOES fire if the browser sends fire-on-hold down.
        this.keyDownStateChangedEmitter = new Emitter_js_1.default({ parameters: [{ valueType: [KeyboardEvent, null] }] });
        this.keydownUpdateAction = new PhetioAction_js_1.default(function (domEvent) {
            // Not all keys have a code for the browser to use, we need to be graceful and do nothing if there isn't one.
            var key = KeyboardUtils_js_1.default.getEventCode(domEvent);
            if (key) {
                // The dom event might have a modifier key that we weren't able to catch, if that is the case update the keyState.
                // This is likely to happen when pressing browser key commands like "ctrl + tab" to switch tabs.
                _this.correctModifierKeys(domEvent);
                if (assert && !KeyboardUtils_js_1.default.isShiftKey(domEvent)) {
                    assert(domEvent.shiftKey === _this.shiftKeyDown, 'shift key inconsistency between event and keyState.');
                }
                if (assert && !KeyboardUtils_js_1.default.isAltKey(domEvent)) {
                    assert(domEvent.altKey === _this.altKeyDown, 'alt key inconsistency between event and keyState.');
                }
                if (assert && !KeyboardUtils_js_1.default.isControlKey(domEvent)) {
                    assert(domEvent.ctrlKey === _this.ctrlKeyDown, 'ctrl key inconsistency between event and keyState.');
                }
                if (assert && !KeyboardUtils_js_1.default.isMetaKey(domEvent)) {
                    assert(domEvent.metaKey === _this.metaKeyDown, 'meta key inconsistency between event and keyState.');
                }
                // if the key is already down, don't do anything else (we don't want to create a new keyState object
                // for a key that is already being tracked and down)
                if (!_this.isKeyDown(key)) {
                    var key_1 = KeyboardUtils_js_1.default.getEventCode(domEvent);
                    assert && assert(key_1, 'Could not find key from domEvent');
                    _this.keyState[key_1] = {
                        key: key_1,
                        timeDown: 0 // in ms
                    };
                }
                _this._lastKeyDown = key;
                // keydown update received, notify listeners
                _this.keydownEmitter.emit(domEvent);
                _this.keyDownStateChangedEmitter.emit(domEvent);
            }
        }, {
            phetioPlayback: true,
            tandem: (_a = options === null || options === void 0 ? void 0 : options.tandem) === null || _a === void 0 ? void 0 : _a.createTandem('keydownUpdateAction'),
            parameters: [{ name: 'event', phetioType: EventIO_js_1.default }],
            phetioEventType: EventType_js_1.default.USER,
            phetioDocumentation: 'Action that executes whenever a keydown occurs from the input listeners this keyStateTracker adds (most likely to the document).'
        });
        this.keyupUpdateAction = new PhetioAction_js_1.default(function (domEvent) {
            // Not all keys have a code for the browser to use, we need to be graceful and do nothing if there isn't one.
            var key = KeyboardUtils_js_1.default.getEventCode(domEvent);
            if (key) {
                // correct keyState in case browser didn't receive keydown/keyup events for a modifier key
                _this.correctModifierKeys(domEvent);
                // Remove this key data from the state - There are many cases where we might receive a keyup before keydown like
                // on first tab into scenery Display or when using specific operating system keys with the browser or PrtScn so
                // an assertion for this is too strict. See https://github.com/phetsims/scenery/issues/918
                if (_this.isKeyDown(key)) {
                    delete _this.keyState[key];
                }
                // On MacOS, we will not get key keyup events while a meta key is pressed. So the keystate will be inaccurate
                // until the meta keys are released. If both meta keys are pressed, We just We will not get a keyup event until
                // BOTH keys are released, so this should be safe in that case.
                // See https://github.com/phetsims/scenery/issues/1555
                if (platform_js_1.default.mac && KeyboardUtils_js_1.default.isMetaKey(domEvent)) {
                    // Skip notification, since we will emit on the state change below
                    _this.clearState(true);
                }
                // keyup event received, notify listeners
                _this.keyupEmitter.emit(domEvent);
                _this.keyDownStateChangedEmitter.emit(domEvent);
            }
        }, {
            phetioPlayback: true,
            tandem: (_b = options === null || options === void 0 ? void 0 : options.tandem) === null || _b === void 0 ? void 0 : _b.createTandem('keyupUpdateAction'),
            parameters: [{ name: 'event', phetioType: EventIO_js_1.default }],
            phetioEventType: EventType_js_1.default.USER,
            phetioDocumentation: 'Action that executes whenever a keyup occurs from the input listeners this keyStateTracker adds (most likely to the document).'
        });
        var stepListener = this.step.bind(this);
        stepTimer_js_1.default.addListener(stepListener);
        this.disposeKeyStateTracker = function () {
            stepTimer_js_1.default.removeListener(stepListener);
            if (_this.attachedToDocument) {
                _this.detachFromDocument();
            }
        };
    }
    /**
     * Implements keyboard dragging when listener is attached to the Node, public so listener is attached
     * with addInputListener(). Only updated when enabled.
     *
     * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
     * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
     * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
     */
    KeyStateTracker.prototype.keydownUpdate = function (domEvent) {
        this.enabled && this.keydownUpdateAction.execute(domEvent);
    };
    /**
     * Modifier keys might be part of the domEvent but the browser may or may not have received a keydown/keyup event
     * with specifically for the modifier key. This will add or remove modifier keys in that case.
     */
    KeyStateTracker.prototype.correctModifierKeys = function (domEvent) {
        var _this = this;
        var key = KeyboardUtils_js_1.default.getEventCode(domEvent);
        assert && assert(key, 'key not found from domEvent');
        var changed = false;
        // add modifier keys if they aren't down
        if (domEvent.shiftKey && !KeyboardUtils_js_1.default.isShiftKey(domEvent) && !this.shiftKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils_js_1.default.KEY_SHIFT_LEFT];
            this.keyState[KeyboardUtils_js_1.default.KEY_SHIFT_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        if (domEvent.altKey && !KeyboardUtils_js_1.default.isAltKey(domEvent) && !this.altKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils_js_1.default.KEY_ALT_LEFT];
            this.keyState[KeyboardUtils_js_1.default.KEY_ALT_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        if (domEvent.ctrlKey && !KeyboardUtils_js_1.default.isControlKey(domEvent) && !this.ctrlKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils_js_1.default.KEY_CONTROL_LEFT];
            this.keyState[KeyboardUtils_js_1.default.KEY_CONTROL_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        if (domEvent.metaKey && !KeyboardUtils_js_1.default.isMetaKey(domEvent) && !this.metaKeyDown) {
            changed = changed || !this.keyState[KeyboardUtils_js_1.default.KEY_META_LEFT];
            this.keyState[KeyboardUtils_js_1.default.KEY_META_LEFT] = {
                key: key,
                timeDown: 0 // in ms
            };
        }
        // delete modifier keys if we think they are down
        if (!domEvent.shiftKey && this.shiftKeyDown) {
            changed = changed || !!this.keyState[KeyboardUtils_js_1.default.KEY_SHIFT_LEFT] || !!this.keyState[KeyboardUtils_js_1.default.KEY_SHIFT_RIGHT];
            delete this.keyState[KeyboardUtils_js_1.default.KEY_SHIFT_LEFT];
            delete this.keyState[KeyboardUtils_js_1.default.KEY_SHIFT_RIGHT];
        }
        if (!domEvent.altKey && this.altKeyDown) {
            changed = changed || !!this.keyState[KeyboardUtils_js_1.default.KEY_ALT_LEFT] || !!this.keyState[KeyboardUtils_js_1.default.KEY_ALT_RIGHT];
            delete this.keyState[KeyboardUtils_js_1.default.KEY_ALT_LEFT];
            delete this.keyState[KeyboardUtils_js_1.default.KEY_ALT_RIGHT];
        }
        if (!domEvent.ctrlKey && this.ctrlKeyDown) {
            changed = changed || !!this.keyState[KeyboardUtils_js_1.default.KEY_CONTROL_LEFT] || !!this.keyState[KeyboardUtils_js_1.default.KEY_CONTROL_RIGHT];
            delete this.keyState[KeyboardUtils_js_1.default.KEY_CONTROL_LEFT];
            delete this.keyState[KeyboardUtils_js_1.default.KEY_CONTROL_RIGHT];
        }
        if (!domEvent.metaKey && this.metaKeyDown) {
            changed = changed || KeyboardUtils_js_1.default.META_KEYS.some(function (key) { return !!_this.keyState[key]; });
            KeyboardUtils_js_1.default.META_KEYS.forEach(function (key) { delete _this.keyState[key]; });
        }
        if (changed) {
            this.keyDownStateChangedEmitter.emit(domEvent);
        }
    };
    /**
     * Behavior for keyboard 'up' DOM event. Public so it can be attached with addInputListener(). Only updated when
     * enabled.
     *
     * Note that this event is assigned in the constructor, and not to the prototype. As of writing this,
     * `Node.addInputListener` only supports type properties as event listeners, and not the event keys as
     * prototype methods. Please see https://github.com/phetsims/scenery/issues/851 for more information.
     */
    KeyStateTracker.prototype.keyupUpdate = function (domEvent) {
        this.enabled && this.keyupUpdateAction.execute(domEvent);
    };
    Object.defineProperty(KeyStateTracker.prototype, "movementKeysDown", {
        /**
         * Returns true if any of the movement keys are down (arrow keys or WASD keys).
         */
        get: function () {
            return this.isAnyKeyInListDown(KeyboardUtils_js_1.default.MOVEMENT_KEYS);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the KeyboardEvent.code from the last key down that updated the keystate.
     */
    KeyStateTracker.prototype.getLastKeyDown = function () {
        return this._lastKeyDown;
    };
    /**
     * Returns true if a key with the KeyboardEvent.code is currently down.
     */
    KeyStateTracker.prototype.isKeyDown = function (key) {
        return !!this.keyState[key];
    };
    /**
     * Returns true if the key with the KeyboardEvent.code is currently down.
     */
    KeyStateTracker.prototype.isEnglishKeyDown = function (key) {
        return this.isAnyKeyInListDown(EnglishStringToCodeMap_js_1.default[key]);
    };
    /**
     * Returns the set of keys that are currently down.
     *
     * NOTE: Always returns a new array, so a defensive copy is not needed.
     */
    KeyStateTracker.prototype.getKeysDown = function () {
        return Object.keys(this.keyState);
    };
    /**
     * Returns the set of EnglishKeys that are currently down.
     *
     * NOTE: Always returns a new Set, so a defensive copy is not needed.
     */
    KeyStateTracker.prototype.getEnglishKeysDown = function () {
        var englishKeySet = new Set();
        for (var _i = 0, _a = this.getKeysDown(); _i < _a.length; _i++) {
            var key = _a[_i];
            var englishKey = (0, EnglishStringToCodeMap_js_1.eventCodeToEnglishString)(key);
            if (englishKey) {
                englishKeySet.add(englishKey);
            }
        }
        return englishKeySet;
    };
    /**
     * Returns true if any of the keys in the list are currently down. Keys are the KeyboardEvent.code strings.
     */
    KeyStateTracker.prototype.isAnyKeyInListDown = function (keyList) {
        for (var i = 0; i < keyList.length; i++) {
            if (this.isKeyDown(keyList[i])) {
                return true;
            }
        }
        return false;
    };
    /**
     * Returns true if ALL of the keys in the list are currently down. Values of the keyList array are the
     * KeyboardEvent.code for the keys you are interested in.
     */
    KeyStateTracker.prototype.areKeysDown = function (keyList) {
        var keysDown = true;
        for (var i = 0; i < keyList.length; i++) {
            if (!this.isKeyDown(keyList[i])) {
                return false;
            }
        }
        return keysDown;
    };
    /**
     * Returns true if ALL keys in the list are down and ONLY the keys in the list are down. Values of keyList array
     * are the KeyboardEvent.code for keys you are interested in OR the KeyboardEvent.key in the special case of
     * modifier keys.
     *
     * (scenery-internal)
     */
    KeyStateTracker.prototype.areKeysExclusivelyDown = function (keyList) {
        var keyStateKeys = Object.keys(this.keyState);
        // quick sanity check for equality first
        if (keyStateKeys.length !== keyList.length) {
            return false;
        }
        // Now make sure that every key in the list is in the keyState
        var onlyKeyListDown = true;
        for (var i = 0; i < keyList.length; i++) {
            var initialKey = keyList[i];
            var keysToCheck = [initialKey];
            // If a modifier key, need to look for the equivalent pair of left/right KeyboardEvent.codes in the list
            // because KeyStateTracker works exclusively with codes.
            if (KeyboardUtils_js_1.default.isModifierKey(initialKey)) {
                keysToCheck = KeyboardUtils_js_1.default.MODIFIER_KEY_TO_CODE_MAP.get(initialKey);
            }
            if (_.intersection(keyStateKeys, keysToCheck).length === 0) {
                onlyKeyListDown = false;
            }
        }
        return onlyKeyListDown;
    };
    /**
     * Returns true if every key in the list is down but no other modifier keys are down, unless
     * the modifier key is in the list. For example
     * areKeysDownWithoutModifiers( [ 'ShiftLeft', 'ArrowLeft' ] ) -> true if left shift and left arrow keys are down.
     * areKeysDownWithoutModifiers( [ 'ShiftLeft', 'ArrowLeft' ] ) -> true if left shift, left arrow, and J keys are down.
     * areKeysDownWithoutModifiers( [ 'ArrowLeft' ] ) -> false if left shift and arrow left keys are down.
     * areKeysDownWithoutModifiers( [ 'ArrowLeft' ] ) -> true if the left arrow key is down.
     * areKeysDownWithoutModifiers( [ 'ArrowLeft' ] ) -> true if the left arrow and R keys are down.
     *
     * This is important for determining when keyboard events should fire listeners. Say you have two KeyboardListeners -
     * One fires from key 'c' and another fires from 'shift-c'. If the user presses 'shift-c', you do NOT want both to
     * fire.
     *
     * @param keyList - List of KeyboardEvent.code strings for keys you are interested in.
     */
    KeyStateTracker.prototype.areKeysDownWithoutExtraModifiers = function (keyList) {
        // If any modifier keys are down that are not in the keyList, return false
        for (var i = 0; i < KeyboardUtils_js_1.default.MODIFIER_KEY_CODES.length; i++) {
            var modifierKey = KeyboardUtils_js_1.default.MODIFIER_KEY_CODES[i];
            if (this.isKeyDown(modifierKey) && !keyList.includes(modifierKey)) {
                return false;
            }
        }
        // Modifier state seems OK so return true if all keys in the list are down
        return this.areKeysDown(keyList);
    };
    /**
     * Returns true if any keys are down according to teh keyState.
     */
    KeyStateTracker.prototype.keysAreDown = function () {
        return Object.keys(this.keyState).length > 0;
    };
    Object.defineProperty(KeyStateTracker.prototype, "enterKeyDown", {
        /**
         * Returns true if the "Enter" key is currently down.
         */
        get: function () {
            return this.isKeyDown(KeyboardUtils_js_1.default.KEY_ENTER);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(KeyStateTracker.prototype, "shiftKeyDown", {
        /**
         * Returns true if the shift key is currently down.
         */
        get: function () {
            return this.isAnyKeyInListDown(KeyboardUtils_js_1.default.SHIFT_KEYS);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(KeyStateTracker.prototype, "altKeyDown", {
        /**
         * Returns true if the alt key is currently down.
         */
        get: function () {
            return this.isAnyKeyInListDown(KeyboardUtils_js_1.default.ALT_KEYS);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(KeyStateTracker.prototype, "ctrlKeyDown", {
        /**
         * Returns true if the control key is currently down.
         */
        get: function () {
            return this.isAnyKeyInListDown(KeyboardUtils_js_1.default.CONTROL_KEYS);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(KeyStateTracker.prototype, "metaKeyDown", {
        /**
         * Returns true if one of the meta keys is currently down.
         */
        get: function () {
            return this.isAnyKeyInListDown(KeyboardUtils_js_1.default.META_KEYS);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns the amount of time that the provided key has been held down. Error if the key is not currently down.
     * @param key - KeyboardEvent.code for the key you are inspecting.
     */
    KeyStateTracker.prototype.timeDownForKey = function (key) {
        assert && assert(this.isKeyDown(key), 'cannot get timeDown on a key that is not pressed down');
        return this.keyState[key].timeDown;
    };
    /**
     * Clear the entire state of the key tracker, basically restarting the tracker.
     */
    KeyStateTracker.prototype.clearState = function (skipNotify) {
        this.keyState = {};
        if (!skipNotify) {
            this.keyDownStateChangedEmitter.emit(null);
        }
    };
    /**
     * Step function for the tracker. JavaScript does not natively handle multiple keydown events at once,
     * so we need to track the state of the keyboard in an Object and manage dragging in this function.
     * In order for the drag handler to work.
     *
     * @param dt - time in seconds that has passed since the last update
     */
    KeyStateTracker.prototype.step = function (dt) {
        // no-op unless a key is down
        if (this.keysAreDown()) {
            var ms = dt * 1000;
            // for each key that is still down, increment the tracked time that has been down
            for (var i in this.keyState) {
                if (this.keyState[i]) {
                    this.keyState[i].timeDown += ms;
                }
            }
        }
    };
    /**
     * Add this KeyStateTracker to the window so that it updates whenever the document receives key events. This is
     * useful if you want to observe key presses while DOM focus not within the PDOM root.
     */
    KeyStateTracker.prototype.attachToWindow = function () {
        var _this = this;
        assert && assert(!this.attachedToDocument, 'KeyStateTracker is already attached to document.');
        this.documentKeydownListener = function (event) {
            _this.keydownUpdate(event);
        };
        this.documentKeyupListener = function (event) {
            _this.keyupUpdate(event);
        };
        this.documentBlurListener = function (event) {
            // As recommended for similar situations online, we clear our key state when we get a window blur, since we
            // will not be able to track any key state changes during this time (and users will likely release any keys
            // that are pressed).
            // If shift/alt/ctrl are pressed when we regain focus, we will hopefully get a keyboard event and update their state
            // with correctModifierKeys().
            _this.clearState();
        };
        var addListenersToDocument = function () {
            // attach with useCapture so that the keyStateTracker is updated before the events dispatch within Scenery
            window.addEventListener('keyup', _this.documentKeyupListener, { capture: true });
            window.addEventListener('keydown', _this.documentKeydownListener, { capture: true });
            window.addEventListener('blur', _this.documentBlurListener, { capture: true });
            _this.attachedToDocument = true;
        };
        if (!document) {
            // attach listeners on window load to ensure that the document is defined
            var loadListener_1 = function () {
                addListenersToDocument();
                window.removeEventListener('load', loadListener_1);
            };
            window.addEventListener('load', loadListener_1);
        }
        else {
            // document is defined and we won't get another load event so attach right away
            addListenersToDocument();
        }
    };
    /**
     * The KeyState is cleared when the tracker is disabled.
     */
    KeyStateTracker.prototype.setEnabled = function (enabled) {
        if (this._enabled !== enabled) {
            this._enabled = enabled;
            // clear state when disabled
            !enabled && this.clearState();
        }
    };
    Object.defineProperty(KeyStateTracker.prototype, "enabled", {
        get: function () { return this.isEnabled(); },
        set: function (enabled) { this.setEnabled(enabled); },
        enumerable: false,
        configurable: true
    });
    KeyStateTracker.prototype.isEnabled = function () { return this._enabled; };
    /**
     * Detach listeners from the document that would update the state of this KeyStateTracker on key presses.
     */
    KeyStateTracker.prototype.detachFromDocument = function () {
        assert && assert(this.attachedToDocument, 'KeyStateTracker is not attached to window.');
        assert && assert(this.documentKeyupListener, 'keyup listener was not created or attached to window');
        assert && assert(this.documentKeydownListener, 'keydown listener was not created or attached to window.');
        assert && assert(this.documentBlurListener, 'blur listener was not created or attached to window.');
        window.removeEventListener('keyup', this.documentKeyupListener);
        window.removeEventListener('keydown', this.documentKeydownListener);
        window.removeEventListener('blur', this.documentBlurListener);
        this.documentKeyupListener = null;
        this.documentKeydownListener = null;
        this.documentBlurListener = null;
        this.attachedToDocument = false;
    };
    KeyStateTracker.prototype.dispose = function () {
        this.disposeKeyStateTracker();
    };
    return KeyStateTracker;
}());
scenery_js_1.default.register('KeyStateTracker', KeyStateTracker);
exports.default = KeyStateTracker;
