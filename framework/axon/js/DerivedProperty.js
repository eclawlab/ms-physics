"use strict";
// Copyright 2013-2026, University of Colorado Boulder
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
exports.DerivedProperty5 = exports.DerivedProperty4 = exports.DerivedProperty3 = exports.DerivedProperty2 = exports.DerivedProperty1 = void 0;
/**
 * A DerivedProperty is computed based on other Properties.  This implementation inherits from Property to (a) simplify
 * implementation and (b) ensure it remains consistent. Note that the setters should not be called directly, so the
 * setters (set, reset and es5 setter) throw an error if used directly.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var IOTypeCache_js_1 = require("../../tandem/js/IOTypeCache.js");
var PhetioObject_js_1 = require("../../tandem/js/PhetioObject.js");
var Tandem_js_1 = require("../../tandem/js/Tandem.js");
var IOType_js_1 = require("../../tandem/js/types/IOType.js");
var VoidIO_js_1 = require("../../tandem/js/types/VoidIO.js");
var axon_js_1 = require("./axon.js");
var Property_js_1 = require("./Property.js");
var PropertyStateHandler_js_1 = require("./PropertyStateHandler.js");
var PropertyStatePhase_js_1 = require("./PropertyStatePhase.js");
var ReadOnlyProperty_js_1 = require("./ReadOnlyProperty.js");
var TReadOnlyProperty_js_1 = require("./TReadOnlyProperty.js");
var DERIVED_PROPERTY_IO_PREFIX = 'DerivedPropertyIO';
/**
 * Compute the derived value given a derivation and an array of dependencies
 */
function getDerivedValue(derivation, dependencies) {
    // @ts-expect-error
    return derivation.apply(void 0, dependencies.map(function (property) { return property.get(); }));
}
/**
 * T = type of the derived value
 * Parameters[] = types of the callback parameters, e.g. [ Vector2, number, boolean ]
 */
var DerivedProperty = /** @class */ (function (_super) {
    __extends(DerivedProperty, _super);
    function DerivedProperty(dependencies, derivation, providedOptions) {
        var _this = this;
        var options = (0, optionize_js_1.default)()({
            phetioReadOnly: true, // derived properties can be read but not set by PhET-iO
            phetioOuterType: DerivedProperty.DerivedPropertyIO,
            phetioLinkDependencies: true
        }, providedOptions);
        assert && assert(dependencies.every(_.identity), 'dependencies should all be truthy');
        assert && assert(dependencies.length === _.uniq(dependencies).length, 'duplicate dependencies');
        assert && assert(options.phetioReadOnly, 'DerivedProperty must be read-only');
        var initialValue = getDerivedValue(derivation, dependencies);
        // We must pass supertype tandem to parent class so addInstance is called only once in the subclassiest constructor.
        _this = _super.call(this, initialValue, options) || this;
        if (Tandem_js_1.default.VALIDATION && _this.isPhetioInstrumented()) {
            // The phetioType should be a concrete (instantiated) DerivedPropertyIO, hence we must check its outer type
            assert && assert(_this.phetioType.typeName.startsWith('DerivedPropertyIO'), 'phetioType should be DerivedPropertyIO');
        }
        _this.dependencies = dependencies;
        _this.derivation = derivation;
        _this.derivedPropertyListener = _this.getDerivedPropertyListener.bind(_this);
        dependencies.forEach(function (dependency) {
            dependency.lazyLink(_this.derivedPropertyListener);
            // If the dependency delegates PhET-iO responsibility to a target property, use it. For instance, FluentConstant
            // is backed by an instrumented PhET-iO LocalizedStringProperty.
            if (dependency instanceof PhetioObject_js_1.default && dependency.hasTargetProperty()) {
                // @ts-expect-error
                dependency = dependency.targetProperty;
            }
            if (Tandem_js_1.default.PHET_IO_ENABLED && _this.isPhetioInstrumented() && dependency instanceof PhetioObject_js_1.default && dependency.isPhetioInstrumented()) {
                if (dependency instanceof ReadOnlyProperty_js_1.default) {
                    // Dependencies should have taken their correct values before this DerivedProperty undefers, so it will be sure
                    // to have the right value.
                    // NOTE: Do not mark the beforePhase as NOTIFY, as this will potentially cause interdependence bugs when used
                    // with Multilinks. See Projectile Motion's use of MeasuringTapeNode for an example.
                    PropertyStateHandler_js_1.propertyStateHandlerSingleton.registerPhetioOrderDependency(dependency, PropertyStatePhase_js_1.default.UNDEFER, _this, PropertyStatePhase_js_1.default.UNDEFER);
                }
                if (options.tandem && options.phetioLinkDependencies) {
                    var dependenciesTandem = options.tandem.createTandem('dependencies');
                    _this.addLinkedElement(dependency, {
                        phetioFeatured: Tandem_js_1.default.PHET_IO_ENABLED ? dependency.phetioFeatured && _this.phetioFeatured : false,
                        tandem: dependenciesTandem.createTandemFromPhetioID(dependency.tandem.phetioID)
                    });
                }
            }
        });
        return _this;
    }
    /**
     * Determines whether this DerivedProperty has a specific dependency.
     */
    DerivedProperty.prototype.hasDependency = function (dependency) {
        return this.definedDependencies.includes(dependency);
    };
    Object.defineProperty(DerivedProperty.prototype, "definedDependencies", {
        /**
         * Returns dependencies that are guaranteed to be defined internally.
         */
        get: function () {
            assert && assert(this.dependencies !== null, 'Dependencies should be defined, has this Property been disposed?');
            return this.dependencies;
        },
        enumerable: false,
        configurable: true
    });
    // for bind
    DerivedProperty.prototype.getDerivedPropertyListener = function () {
        // Don't try to recompute if we are disposed, see https://github.com/phetsims/axon/issues/432
        if (this.isDisposed) {
            return;
        }
        // Just mark that there is a deferred value, then calculate the derivation below when setDeferred() is called.
        // This is in part supported by the PhET-iO state engine because it can account for intermediate states, such
        // that this Property won't notify until after it is undeferred and has taken its final value.
        if (this.isDeferred) {
            this.hasDeferredValue = true;
        }
        else {
            _super.prototype.set.call(this, getDerivedValue(this.derivation, this.definedDependencies));
        }
    };
    /**
     * Allows forcing a recomputation (as a possible workaround to listener order). This works well if you have a
     * non-Property event that should trigger a value change for this Property.
     *
     * For example:
     * myEmitter.addListener( () => myDerivedProperty.recomputeDerivation() );
     * myObservableArray.addItemAddedListener( () => myDerivedProperty.recomputeDerivation() );
     */
    DerivedProperty.prototype.recomputeDerivation = function () {
        this.getDerivedPropertyListener();
    };
    DerivedProperty.prototype.dispose = function () {
        var dependencies = this.definedDependencies;
        // Unlink from dependent Properties
        for (var i = 0; i < dependencies.length; i++) {
            var dependency = dependencies[i];
            if (dependency.hasListener(this.derivedPropertyListener)) {
                dependency.unlink(this.derivedPropertyListener);
            }
        }
        this.dependencies = null;
        _super.prototype.dispose.call(this);
    };
    /**
     * Support deferred DerivedProperty by only calculating the derivation once when it is time to undefer it and fire
     * notifications. This way we don't have intermediate derivation calls during PhET-iO state setting.
     */
    DerivedProperty.prototype.setDeferred = function (isDeferred) {
        if (this.isDeferred && !isDeferred) {
            this.deferredValue = getDerivedValue(this.derivation, this.definedDependencies);
        }
        return _super.prototype.setDeferred.call(this, isDeferred);
    };
    /**
     * Creates a derived boolean Property whose value is true iff firstProperty's value is equal to secondProperty's
     * value.
     */
    DerivedProperty.valueEquals = function (firstProperty, secondProperty, options) {
        return new DerivedProperty([firstProperty, secondProperty], function (u, v) { return u === v; }, options);
    };
    /**
     * Creates a derived boolean Property whose value is true iff firstProperty's value is not equal to the
     * secondProperty's value.
     */
    DerivedProperty.valueNotEquals = function (firstProperty, secondProperty, options) {
        return new DerivedProperty([firstProperty, secondProperty], function (u, v) { return u !== v; }, options);
    };
    /**
     * Creates a derived boolean Property whose value is true iff firstProperty's value is equal to a constant value.
     */
    DerivedProperty.valueEqualsConstant = function (firstProperty, value, options) {
        return new DerivedProperty([firstProperty], function (u) { return u === value; }, options);
    };
    /**
     * Creates a derived boolean Property whose value is true iff firstProperty's value is not equal to a constant value.
     */
    DerivedProperty.valueNotEqualsConstant = function (firstProperty, value, options) {
        return new DerivedProperty([firstProperty], function (u) { return u !== value; }, options);
    };
    /**
     * Creates a derived boolean Property whose value is true iff every input Property value is true.
     */
    DerivedProperty.and = function (properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, function () { return _.reduce(properties, andFunction, true); }, options);
    };
    /**
     * Creates a derived boolean Property whose value is true iff any input Property value is true.
     */
    DerivedProperty.or = function (properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, function () { return _.reduce(properties, orFunction, false); }, options);
    };
    /**
     * Creates a derived number Property whose value is the result of multiplying all (number) dependencies together.
     */
    DerivedProperty.multiply = function (properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, function () { return _.reduce(properties, multiplyFunction, 1); }, options);
    };
    /**
     * Creates a derived number Property whose value is the result of adding all (number) dependencies together.
     */
    DerivedProperty.add = function (properties, options) {
        assert && assert(properties.length > 0, 'must provide a dependency');
        return DerivedProperty.deriveAny(properties, function () { return _.reduce(properties, addFunction, 0); }, options);
    };
    /**
     * Creates a derived boolean Property whose value is the inverse of the provided property.
     */
    DerivedProperty.not = function (propertyToInvert, options) {
        return new DerivedProperty([propertyToInvert], function (x) { return !x; }, options);
    };
    /**
     * Creates a derived property based on a record lookup. When evaluated, the DerivedProperty returns the value of
     * the Property in the record corresponding to the key's current value.
     *
     * Record values can also be non-Property values, in which case the DerivedProperty will return that value.
     *
     * @param key - A property whose current value corresponds to one of the keys in the record.
     * @param record - A record mapping keys to Properties or values.
     * @param options - Optional settings for the DerivedProperty
     */
    DerivedProperty.fromRecord = function (key, record, options) {
        // All the dependencies that are Properties
        var m = Object.values(record).filter(function (value) { return (0, TReadOnlyProperty_js_1.isTReadOnlyProperty)(value); });
        return DerivedProperty.deriveAny(__spreadArray([key], m, true), function () {
            assert && assert(key.value in record, "key ".concat(String(key.value), " not found in record from DerivedProperty.fromRecord"));
            var value = record[key.value];
            if ((0, TReadOnlyProperty_js_1.isTReadOnlyProperty)(value)) {
                return value.value;
            }
            else {
                return value;
            }
        }, options); // The type checker can't infer that the return type is B
    };
    /**
     * Create a DerivedProperty from any number of dependencies.  This is parallel to Multilink.multilinkAny
     */
    DerivedProperty.deriveAny = function (dependencies, derivation, providedOptions) {
        return new DerivedProperty(
        // @ts-expect-error we have to provide a mapping between an arbitrary length array and our max overload of 15 types.
        dependencies, derivation, providedOptions);
    };
    return DerivedProperty;
}(ReadOnlyProperty_js_1.default));
exports.default = DerivedProperty;
var andFunction = function (value, property) {
    return value && property.value;
};
var orFunction = function (value, property) {
    assert && assert(typeof property.value === 'boolean', 'boolean value required');
    return value || property.value;
};
var multiplyFunction = function (value, property) {
    assert && assert(typeof property.value === 'number', 'number value required');
    return value * property.value;
};
var addFunction = function (value, property) {
    assert && assert(typeof property.value === 'number', 'number value required');
    return value + property.value;
};
// Cache each parameterized DerivedPropertyIO so that it is only created once.
var cache = new IOTypeCache_js_1.default();
/**
 * Parametric IOType constructor.  Given a parameter type, this function returns an appropriate DerivedProperty
 * IOType. Unlike PropertyIO, DerivedPropertyIO cannot be set by PhET-iO clients.
 * This caching implementation should be kept in sync with the other parametric IOType caching implementations.
 * TODO: Move into static on class, https://github.com/phetsims/tandem/issues/261
 */
DerivedProperty.DerivedPropertyIO = function (parameterType) {
    assert && assert(parameterType, 'DerivedPropertyIO needs parameterType');
    if (!cache.has(parameterType)) {
        cache.set(parameterType, new IOType_js_1.default("".concat(DERIVED_PROPERTY_IO_PREFIX, "<").concat(parameterType.typeName, ">"), {
            valueType: DerivedProperty,
            parameterTypes: [parameterType],
            supertype: Property_js_1.default.PropertyIO(parameterType),
            documentation: 'Like PropertyIO, but not settable.  Instead it is derived from other DerivedPropertyIO or PropertyIO ' +
                'instances',
            // Override the parent implementation as a no-op.  DerivedProperty values appear in the state, but should not be set
            // back into a running simulation. See https://github.com/phetsims/phet-io/issues/1292
            applyState: _.noop,
            methods: {
                setValue: {
                    returnType: VoidIO_js_1.default,
                    parameterTypes: [parameterType],
                    // @ts-expect-error
                    implementation: DerivedProperty.prototype.set,
                    documentation: 'Errors out when you try to set a derived property.',
                    invocableForReadOnlyElements: false
                }
            }
        }));
    }
    return cache.get(parameterType);
};
// Convenience classes for subclassing DerivedProperty
var DerivedProperty1 = /** @class */ (function (_super) {
    __extends(DerivedProperty1, _super);
    function DerivedProperty1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DerivedProperty1;
}(DerivedProperty));
exports.DerivedProperty1 = DerivedProperty1;
var DerivedProperty2 = /** @class */ (function (_super) {
    __extends(DerivedProperty2, _super);
    function DerivedProperty2() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DerivedProperty2;
}(DerivedProperty));
exports.DerivedProperty2 = DerivedProperty2;
var DerivedProperty3 = /** @class */ (function (_super) {
    __extends(DerivedProperty3, _super);
    function DerivedProperty3() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DerivedProperty3;
}(DerivedProperty));
exports.DerivedProperty3 = DerivedProperty3;
var DerivedProperty4 = /** @class */ (function (_super) {
    __extends(DerivedProperty4, _super);
    function DerivedProperty4() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DerivedProperty4;
}(DerivedProperty));
exports.DerivedProperty4 = DerivedProperty4;
var DerivedProperty5 = /** @class */ (function (_super) {
    __extends(DerivedProperty5, _super);
    function DerivedProperty5() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return DerivedProperty5;
}(DerivedProperty));
exports.DerivedProperty5 = DerivedProperty5;
axon_js_1.default.register('DerivedProperty', DerivedProperty);
