"use strict";
// Copyright 2013-2026, University of Colorado Boulder
/**
 * An observable property which notifies listeners when the value changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 */
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
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var IOTypeCache_js_1 = require("../../tandem/js/IOTypeCache.js");
var isClearingPhetioDynamicElementsProperty_js_1 = require("../../tandem/js/isClearingPhetioDynamicElementsProperty.js");
var isPhetioStateEngineManagingPropertyValuesProperty_js_1 = require("../../tandem/js/isPhetioStateEngineManagingPropertyValuesProperty.js");
var PhetioObject_js_1 = require("../../tandem/js/PhetioObject.js");
var Tandem_js_1 = require("../../tandem/js/Tandem.js");
var ArrayIO_js_1 = require("../../tandem/js/types/ArrayIO.js");
var BooleanIO_js_1 = require("../../tandem/js/types/BooleanIO.js");
var FunctionIO_js_1 = require("../../tandem/js/types/FunctionIO.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var NullableIO_js_1 = require("../../tandem/js/types/NullableIO.js");
var StringIO_js_1 = require("../../tandem/js/types/StringIO.js");
var VoidIO_js_1 = require("../../tandem/js/types/VoidIO.js");
var axon_js_1 = require("./axon.js");
var PropertyStateHandler_js_1 = require("./PropertyStateHandler.js");
var PropertyStatePhase_js_1 = require("./PropertyStatePhase.js");
var TinyProperty_js_1 = require("./TinyProperty.js");
var Unit_js_1 = require("./Unit.js");
var units_js_1 = require("./units.js");
var validate_js_1 = require("./validate.js");
var Validation_js_1 = require("./Validation.js");
// constants
var VALIDATE_OPTIONS_FALSE = { validateValidator: false };
// variables
var globalId = 0; // auto-incremented for unique IDs
// Cache each parameterized PropertyIO based on the parameter type, so that it is only created once
var cache = new IOTypeCache_js_1.default();
/**
 * Base class for Property, DerivedProperty, DynamicProperty.  Set methods are protected/not part of the public
 * interface.  Initial value and resetting is not defined here.
 */
var ReadOnlyProperty = /** @class */ (function (_super) {
    __extends(ReadOnlyProperty, _super);
    /**
     * This is protected to indicate to clients that subclasses should be used instead.
     * @param value - the initial value of the property
     * @param [providedOptions]
     */
    function ReadOnlyProperty(value, providedOptions) {
        var _this = this;
        var options = (0, optionize_js_1.default)()({
            units: null,
            reentrant: false,
            hasListenerOrderDependencies: false,
            reentrantNotificationStrategy: 'queue',
            disableListenerLimit: false,
            // See Validation.ts for ValueComparisonStrategy for available values. Please note that this will be used for
            // equality comparison both with validation (i.e. for validValue comparison), as well as determining if the
            // value has changed such that listeners should fire, see TinyProperty.areValuesEqual().
            valueComparisonStrategy: 'reference',
            // phet-io
            tandemNameSuffix: ['Property', Tandem_js_1.DYNAMIC_ARCHETYPE_NAME], // DYNAMIC_ARCHETYPE_NAME means that this Property is an archetype.
            phetioOuterType: ReadOnlyProperty.PropertyIO,
            phetioValueType: IOType_js_1.default.ObjectIO
        }, providedOptions);
        assert && typeof options.units === 'string' && assert(units_js_1.default.isValidUnits(options.units), "invalid units: ".concat(options.units));
        if (options.units) {
            options.phetioEventMetadata = options.phetioEventMetadata || {};
            assert && assert(!options.phetioEventMetadata.hasOwnProperty('units'), 'units should be supplied by Property, not elsewhere');
            options.phetioEventMetadata.units = (0, Unit_js_1.unitToString)(options.units);
        }
        if (assert && providedOptions) {
            // @ts-expect-error -- for checking JS code
            assert && assert(!providedOptions.phetioType, 'Set phetioType via phetioValueType');
        }
        // Construct the IOType
        if (options.phetioOuterType && options.phetioValueType) {
            options.phetioType = options.phetioOuterType(options.phetioValueType);
        }
        // Support non-validated Property
        if (!Validation_js_1.default.containsValidatorKey(options)) {
            options.isValidValue = function () { return true; };
        }
        _this = _super.call(this, options) || this;
        _this.id = globalId++;
        _this.units = options.units;
        // When running as phet-io, if the tandem is specified, the type must be specified.
        if (_this.isPhetioInstrumented()) {
            // This assertion helps in instrumenting code that has the tandem but not type
            assert && Tandem_js_1.default.VALIDATION && assert(_this.phetioType, "phetioType passed to Property must be specified. Tandem.phetioID: ".concat(_this.tandem.phetioID));
            assert && Tandem_js_1.default.VALIDATION && assert(options.phetioType.parameterTypes[0], "phetioType parameter type must be specified (only one). Tandem.phetioID: ".concat(_this.tandem.phetioID));
            assert && assert(options.phetioValueType !== IOType_js_1.default.ObjectIO, 'PhET-iO Properties must specify a phetioValueType: ' + _this.phetioID);
        }
        _this.validValues = options.validValues;
        _this.tinyProperty = new TinyProperty_js_1.default(value, null, options.hasListenerOrderDependencies, options.reentrantNotificationStrategy, options.disableListenerLimit);
        // Since we are already in the heavyweight Property, we always assign TinyProperty.valueComparisonStrategy for clarity.
        _this.tinyProperty.valueComparisonStrategy = options.valueComparisonStrategy;
        _this.notifying = false;
        _this.reentrant = options.reentrant;
        _this.isDeferred = false;
        _this.deferredValue = null;
        _this.hasDeferredValue = false;
        _this.phetioValueType = options.phetioValueType;
        _this.valueValidator = _.pick(options, Validation_js_1.default.VALIDATOR_KEYS);
        _this.valueValidator.validationMessage = _this.valueValidator.validationMessage || 'Property value not valid';
        if (_this.valueValidator.phetioType) {
            // Validate the value type's phetioType of the Property, not the PropertyIO itself.
            // For example, for PropertyIO( BooleanIO ), assign this valueValidator's phetioType to be BooleanIO's validator.
            assert && assert(!!_this.valueValidator.phetioType.parameterTypes[0], 'unexpected number of parameters for Property');
            // This is the validator for the value, not for the Property itself
            _this.valueValidator.phetioType = _this.valueValidator.phetioType.parameterTypes[0];
        }
        // Assertions regarding value validation
        if (assert) {
            Validation_js_1.default.validateValidator(_this.valueValidator);
            // validate the initial value as well as any changes in the future
            (0, validate_js_1.default)(value, _this.valueValidator, VALIDATE_OPTIONS_FALSE);
        }
        return _this;
    }
    /**
     * Returns true if the value can be set externally, using .value= or set()
     */
    ReadOnlyProperty.prototype.isSettable = function () {
        return false;
    };
    /**
     * Gets the value.
     * You can also use the es5 getter (property.value) but this means is provided for inner loops
     * or internal code that must be fast.
     */
    ReadOnlyProperty.prototype.get = function () {
        return this.tinyProperty.get();
    };
    /**
     * Sets the value and notifies listeners, unless deferred or disposed. You can also use the es5 getter
     * (property.value) but this means is provided for inner loops or internal code that must be fast. If the value
     * hasn't changed, this is a no-op.
     *
     * NOTE: For PhET-iO instrumented Properties that are phetioState: true, the value is only
     * set by the PhetioStateEngine and cannot be modified by other code while isSettingPhetioStateProperty === true.
     */
    ReadOnlyProperty.prototype.set = function (value) {
        // State is managed by the PhetioStateEngine, see https://github.com/phetsims/axon/issues/409
        var setManagedByPhetioState = isPhetioStateEngineManagingPropertyValuesProperty_js_1.default.value &&
            // We still want to set Properties when clearing dynamic elements, see https://github.com/phetsims/phet-io/issues/1906
            !isClearingPhetioDynamicElementsProperty_js_1.default.value &&
            this.isPhetioInstrumented() && this.phetioState &&
            // However, DerivedProperty should be able to update during PhET-iO state set
            this.isSettable();
        if (!setManagedByPhetioState) {
            this.unguardedSet(value);
        }
        else {
            // Uncomment while implementing PhET-iO State for your simulation to see what value-setting is being silently ignored.
            // console.warn( `Ignoring attempt to ReadOnlyProperty.set(): ${this.phetioID}` );
        }
    };
    /**
     * For usage by the IOType during PhET-iO state setting.
     */
    ReadOnlyProperty.prototype.unguardedSet = function (value) {
        if (!this.isDisposed) {
            if (this.isDeferred) {
                this.deferredValue = value;
                this.hasDeferredValue = true;
            }
            else if (!this.equalsValue(value)) {
                var oldValue = this.get();
                this.setPropertyValue(value);
                this._notifyListeners(oldValue);
            }
        }
    };
    /**
     * Sets the value without notifying any listeners. This is a place to override if a subtype performs additional work
     * when setting the value.
     */
    ReadOnlyProperty.prototype.setPropertyValue = function (value) {
        this.tinyProperty.setPropertyValue(value);
    };
    /**
     * Returns true if and only if the specified value equals the value of this property
     */
    ReadOnlyProperty.prototype.equalsValue = function (value) {
        // Ideally, we would call the equalsValue in tinyProperty, but it is protected. Furthermore, it is nice to get
        // the assertions associated with ReadOnlyProperty.get().
        return this.areValuesEqual(value, this.get());
    };
    /**
     * Determine if the two values are equal, see TinyProperty.areValuesEqual().
     */
    ReadOnlyProperty.prototype.areValuesEqual = function (a, b) {
        return this.tinyProperty.areValuesEqual(a, b);
    };
    /**
     * NOTE: a few sims are calling this even though they shouldn't
     */
    ReadOnlyProperty.prototype._notifyListeners = function (oldValue) {
        var _this = this;
        var newValue = this.get();
        // validate the before notifying listeners
        assert && (0, validate_js_1.default)(newValue, this.valueValidator, VALIDATE_OPTIONS_FALSE);
        // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
        // called so many times that it is worth the optimization for PhET brand.
        Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent(ReadOnlyProperty.CHANGED_EVENT_NAME, {
            getData: function () {
                var parameterType = _this.phetioType.parameterTypes[0];
                return {
                    oldValue: (0, NullableIO_js_1.default)(parameterType).toStateObject(oldValue),
                    newValue: parameterType.toStateObject(newValue)
                };
            }
        });
        // notify listeners, optionally detect loops where this Property is set again before this completes.
        assert && assert(!this.notifying || this.reentrant, "reentry detected, value=".concat(newValue, ", oldValue=").concat(oldValue));
        this.notifying = true;
        this.tinyProperty.emit(newValue, oldValue, this); // cannot use tinyProperty.notifyListeners because it uses the wrong this
        this.notifying = false;
        Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
    };
    /**
     * Use this method when mutating a value (not replacing with a new instance) and you want to send notifications about the change.
     * This is different from the normal axon strategy, but may be necessary to prevent memory allocations.
     * This method is unsafe for removing listeners because it assumes the listener list not modified, to save another allocation
     * Only provides the new reference as a callback (no oldValue)
     * See https://github.com/phetsims/axon/issues/6
     */
    ReadOnlyProperty.prototype.notifyListenersStatic = function () {
        this._notifyListeners(null);
    };
    /**
     * When deferred, set values do not take effect or send out notifications.  After defer ends, the Property takes
     * its deferred value (if any), and a follow-up action (return value) can be invoked to send out notifications
     * once other Properties have also taken their deferred values.
     *
     * @param isDeferred - whether the Property should be deferred or not
     * @returns - function to notify listeners after calling setDeferred(false),
     *          - null if isDeferred is true, or if the value is unchanged since calling setDeferred(true)
     */
    ReadOnlyProperty.prototype.setDeferred = function (isDeferred) {
        var _this = this;
        assert && assert(!this.isDisposed, 'cannot defer Property if already disposed.');
        if (isDeferred) {
            assert && assert(!this.isDeferred, 'Property already deferred');
            this.isDeferred = true;
        }
        else {
            assert && assert(this.isDeferred, 'Property wasn\'t deferred');
            this.isDeferred = false;
            var oldValue_1 = this.get();
            // Take the new value
            if (this.hasDeferredValue) {
                this.setPropertyValue(this.deferredValue);
                this.hasDeferredValue = false;
                this.deferredValue = null;
            }
            // If the value has changed, prepare to send out notifications (after all other Properties in this transaction
            // have their final values)
            if (!this.equalsValue(oldValue_1)) {
                return function () { return !_this.isDisposed && _this._notifyListeners(oldValue_1); };
            }
        }
        // no action to signify change
        return null;
    };
    Object.defineProperty(ReadOnlyProperty.prototype, "value", {
        get: function () {
            return this.get();
        },
        set: function (newValue) {
            this.set(newValue);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This function registers an order dependency between this Property and another. Basically this says that when
     * setting PhET-iO state, each dependency must take its final value before this Property fires its notifications.
     * See propertyStateHandlerSingleton.registerPhetioOrderDependency and https://github.com/phetsims/axon/issues/276 for more info.
     */
    ReadOnlyProperty.prototype.addPhetioStateDependencies = function (dependencies) {
        assert && assert(Array.isArray(dependencies), 'Array expected');
        for (var i = 0; i < dependencies.length; i++) {
            var dependencyProperty = dependencies[i];
            // only if running in PhET-iO brand and both Properties are instrumenting
            if (dependencyProperty instanceof ReadOnlyProperty && dependencyProperty.isPhetioInstrumented() && this.isPhetioInstrumented()) {
                // The dependency should undefer (taking deferred value) before this Property notifies.
                PropertyStateHandler_js_1.propertyStateHandlerSingleton.registerPhetioOrderDependency(dependencyProperty, PropertyStatePhase_js_1.default.UNDEFER, this, PropertyStatePhase_js_1.default.NOTIFY);
            }
        }
    };
    /**
     * Adds listener and calls it immediately. If listener is already registered, this is a no-op. The initial
     * notification provides the current value for newValue and null for oldValue.
     *
     * @param listener - a function that takes a new value, old value, and this Property as arguments
     * @param [options]
     */
    ReadOnlyProperty.prototype.link = function (listener, options) {
        if (options && options.phetioDependencies) {
            this.addPhetioStateDependencies(options.phetioDependencies);
        }
        this.tinyProperty.addListener(listener); // cannot use tinyProperty.link() because of wrong this
        this.addPropertyDisposerAction(listener, options);
        listener(this.get(), null, this); // null should be used when an object is expected but unavailable
    };
    /**
     * Add a listener to the Property, without calling it back right away. This is used when you need to register a
     * listener without an immediate callback.
     */
    ReadOnlyProperty.prototype.lazyLink = function (listener, options) {
        if (options && options.phetioDependencies) {
            this.addPhetioStateDependencies(options.phetioDependencies);
        }
        this.tinyProperty.lazyLink(listener); // Note: do not pass through the disposer options
        this.addPropertyDisposerAction(listener, options);
    };
    /**
     * Removes a listener. If listener is not registered, this is a no-op.
     */
    ReadOnlyProperty.prototype.unlink = function (listener) {
        this.tinyProperty.unlink(listener);
        // undo addDisposer (see above)
        this.removeDisposerAction('link', listener);
    };
    /**
     * Removes all listeners. If no listeners are registered, this is a no-op.
     */
    ReadOnlyProperty.prototype.unlinkAll = function () {
        this.tinyProperty.unlinkAll();
        // undo addDisposer (see above)
        this.removeAllDisposerActions('link');
    };
    /**
     * Links an object's named attribute to this property.  Returns a handle so it can be removed using Property.unlink();
     * Example: modelVisibleProperty.linkAttribute(view,'visible');
     *
     * NOTE: Duplicated with TinyProperty.linkAttribute
     */
    ReadOnlyProperty.prototype.linkAttribute = function (object, attributeName) {
        var handle = function (value) { object[attributeName] = value; };
        this.link(handle);
        return handle;
    };
    /**
     * Provide toString for console debugging, see http://stackoverflow.com/questions/2485632/valueof-vs-tostring-in-javascript
     */
    ReadOnlyProperty.prototype.toString = function () {
        return "Property#".concat(this.id, "{").concat(this.get(), "}");
    };
    /**
     * Convenience function for debugging a Property's value. It prints the new value on registration and when changed.
     * @param name - debug name to be printed on the console
     * @returns - the handle to the linked listener in case it needs to be removed later
     */
    ReadOnlyProperty.prototype.debug = function (name) {
        var listener = function (value) { return console.log(name, value); };
        this.link(listener);
        return listener;
    };
    ReadOnlyProperty.prototype.isValueValid = function (value) {
        return this.getValidationError(value) === null;
    };
    ReadOnlyProperty.prototype.getValidationError = function (value) {
        return Validation_js_1.default.getValidationError(value, this.valueValidator, VALIDATE_OPTIONS_FALSE);
    };
    // If a disposer is specified, then automatically remove this listener when the disposer is disposed.
    ReadOnlyProperty.prototype.addPropertyDisposerAction = function (listener, options) {
        var _this = this;
        (options === null || options === void 0 ? void 0 : options.disposer) && this.addDisposerAction('link', listener, options.disposer, function () { return _this.unlink(listener); });
    };
    // Ensures that the Property is eligible for GC
    ReadOnlyProperty.prototype.dispose = function () {
        // unregister any order dependencies for this Property for PhET-iO state
        if (this.isPhetioInstrumented()) {
            PropertyStateHandler_js_1.propertyStateHandlerSingleton.unregisterOrderDependenciesForProperty(this);
        }
        _super.prototype.dispose.call(this);
        this.tinyProperty.dispose();
    };
    /**
     * Checks whether a listener is registered with this Property
     */
    ReadOnlyProperty.prototype.hasListener = function (listener) {
        return this.tinyProperty.hasListener(listener);
    };
    /**
     * Returns the number of listeners.
     */
    ReadOnlyProperty.prototype.getListenerCount = function () {
        return this.tinyProperty.getListenerCount();
    };
    /**
     * Invokes a callback once for each listener
     * @param callback - takes the listener as an argument
     */
    ReadOnlyProperty.prototype.forEachListener = function (callback) {
        this.tinyProperty.forEachListener(callback);
    };
    /**
     * Returns true if there are any listeners.
     */
    ReadOnlyProperty.prototype.hasListeners = function () {
        assert && assert(arguments.length === 0, 'Property.hasListeners should be called without arguments');
        return this.tinyProperty.hasListeners();
    };
    Object.defineProperty(ReadOnlyProperty.prototype, "valueComparisonStrategy", {
        get: function () {
            return this.tinyProperty.valueComparisonStrategy;
        },
        set: function (valueComparisonStrategy) {
            this.tinyProperty.valueComparisonStrategy = valueComparisonStrategy;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Implementation of serialization for PhET-iO support. Override this function to customize how this state
     * behaves (but be careful!).
     *
     * This function is parameterized to support subtyping. That said, it is a bit useless, since we don't want to
     * parameterize ReadOnlyProperty in general to the IOType's state type, so please bear with us.
     */
    ReadOnlyProperty.prototype.toStateObject = function () {
        assert && assert(this.phetioValueType.toStateObject, "toStateObject doesn't exist for ".concat(this.phetioValueType.typeName));
        return {
            value: this.phetioValueType.toStateObject(this.value),
            validValues: (0, NullableIO_js_1.default)((0, ArrayIO_js_1.default)(this.phetioValueType)).toStateObject(this.validValues === undefined ? null : this.validValues),
            units: (0, NullableIO_js_1.default)(StringIO_js_1.default).toStateObject((0, Unit_js_1.unitToStringOrNull)(this.units))
        };
    };
    /**
     * Implementation of serialization for PhET-iO support. Override this function to customize how this state
     * behaves (but be careful!).
     */
    ReadOnlyProperty.prototype.applyState = function (stateObject) {
        assert && assert(this.isSettable(), 'Property should be settable');
        this.unguardedSet(this.phetioValueType.fromStateObject(stateObject.value));
    };
    /**
     * An observable Property that triggers notifications when the value changes.
     * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
     */
    ReadOnlyProperty.PropertyIO = function (parameterType) {
        assert && assert(parameterType, 'PropertyIO needs parameterType');
        if (!cache.has(parameterType)) {
            cache.set(parameterType, new IOType_js_1.default("PropertyIO<".concat(parameterType.typeName, ">"), {
                // We want PropertyIO to work for DynamicProperty and DerivedProperty, but they extend ReadOnlyProperty
                valueType: ReadOnlyProperty,
                documentation: 'Observable values that send out notifications when the value changes. This differs from the ' +
                    'traditional listener pattern in that added listeners also receive a callback with the current value ' +
                    'when the listeners are registered. This is a widely-used pattern in PhET-iO simulations.',
                methodOrder: ['link', 'lazyLink'],
                events: [ReadOnlyProperty.CHANGED_EVENT_NAME],
                parameterTypes: [parameterType],
                toStateObject: function (property) {
                    return property.toStateObject();
                },
                applyState: function (property, stateObject) {
                    property.applyState(stateObject);
                },
                stateSchema: {
                    value: parameterType,
                    validValues: (0, NullableIO_js_1.default)((0, ArrayIO_js_1.default)(parameterType)),
                    units: (0, NullableIO_js_1.default)(StringIO_js_1.default)
                },
                apiStateKeys: ['validValues', 'units'],
                methods: {
                    getValue: {
                        returnType: parameterType,
                        parameterTypes: [],
                        implementation: ReadOnlyProperty.prototype.get,
                        documentation: 'Gets the current value.'
                    },
                    getValidationError: {
                        returnType: (0, NullableIO_js_1.default)(StringIO_js_1.default),
                        parameterTypes: [parameterType],
                        implementation: function (value) {
                            return this.getValidationError(value);
                        },
                        documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
                    },
                    setValue: {
                        returnType: VoidIO_js_1.default,
                        parameterTypes: [parameterType],
                        implementation: function (value) {
                            this.set(value);
                        },
                        documentation: 'Sets the value of the Property. If the value differs from the previous value, listeners are ' +
                            'notified with the new value.',
                        invocableForReadOnlyElements: false
                    },
                    link: {
                        returnType: VoidIO_js_1.default,
                        // oldValue will start as "null" the first time called
                        parameterTypes: [(0, FunctionIO_js_1.default)(VoidIO_js_1.default, [parameterType, (0, NullableIO_js_1.default)(parameterType)])],
                        implementation: ReadOnlyProperty.prototype.link,
                        documentation: 'Adds a listener which will be called when the value changes. On registration, the listener is ' +
                            'also called with the current value. The listener takes two arguments, the new value and the ' +
                            'previous value.'
                    },
                    lazyLink: {
                        returnType: VoidIO_js_1.default,
                        // oldValue will start as "null" the first time called
                        parameterTypes: [(0, FunctionIO_js_1.default)(VoidIO_js_1.default, [parameterType, (0, NullableIO_js_1.default)(parameterType)])],
                        implementation: ReadOnlyProperty.prototype.lazyLink,
                        documentation: 'Adds a listener which will be called when the value changes. This method is like "link", but ' +
                            'without the current-value callback on registration. The listener takes two arguments, the new ' +
                            'value and the previous value.'
                    },
                    unlink: {
                        returnType: VoidIO_js_1.default,
                        parameterTypes: [(0, FunctionIO_js_1.default)(VoidIO_js_1.default, [parameterType])],
                        implementation: ReadOnlyProperty.prototype.unlink,
                        documentation: 'Removes a listener.'
                    }
                },
                fuzzElement: function (element, shouldLog) {
                    var _a;
                    if (((_a = element.phetioType.parameterTypes) === null || _a === void 0 ? void 0 : _a.length) === 1 &&
                        element.phetioType.parameterTypes[0] === BooleanIO_js_1.default && // We want this more general than in BooleanProperty
                        element.isSettable()) {
                        var oldValue = element.value;
                        var newValue = !oldValue;
                        shouldLog && console.log("".concat(element.phetioID, ":"), oldValue, '->', newValue);
                        // @ts-expect-error
                        element.value = newValue;
                    }
                }
            }));
        }
        return cache.get(parameterType);
    };
    /**
     * Support treating ourselves as an autoselectable entity for the "strings" selection mode.
     */
    ReadOnlyProperty.prototype.getPhetioMouseHitTarget = function (fromLinking) {
        if (fromLinking === void 0) { fromLinking = false; }
        if (phet.tandem.phetioElementSelectionProperty.value === 'string') {
            // As of this writing, the only way to get to this function is for Properties that have a value of strings, but
            // in the future that may not be the case. SR and MK still think it is preferable to keep this general, as false
            // positives for autoselect are generally better than false negatives.
            return this.getPhetioMouseHitTargetSelf();
        }
        return _super.prototype.getPhetioMouseHitTarget.call(this, fromLinking);
    };
    /**
     * A lightweight derived property that updates when this property updates. NOTE: this does not support phet-io,
     * disposal, or other features provided by the options, so only use this when features like those are not needed.
     */
    ReadOnlyProperty.prototype.derived = function (derivation) {
        var readOnlyProperty = new ReadOnlyProperty(derivation(this.value));
        this.lazyLink(function (value) { return readOnlyProperty.set(derivation(value)); });
        return readOnlyProperty;
    };
    ReadOnlyProperty.CHANGED_EVENT_NAME = 'changed';
    return ReadOnlyProperty;
}(PhetioObject_js_1.default));
exports.default = ReadOnlyProperty;
axon_js_1.default.register('ReadOnlyProperty', ReadOnlyProperty);
