"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Class responsible for storing information about the schema of PhET-iO state. See IOType stateSchema option for usage
 * and more information.
 *
 * There are two types of StateSchema:
 * - The first is a stateSchema "value". This is when the state of an IOType is itself a value in the state. In
 * effect, this just serves as boilerplate, and isn't the primary usage of stateSchema. For example, a StringIO or
 * NumberIO.
 * - The second is a "composite", where the state of an IOType is made from subcomponents, each of which have an IOType.
 * A composite schema was named because it is a sum of its parts. For example a BunnyIO has multiple components that
 * make it up (mother/father/age/etc). Check which type of StateSchema your instance is with StateSchema.isComposite().
 *
 * When stored in the API, StateSchema values are stored as strings, see StateSchema.asValue, and composite state schemas
 * are stored as objects with values that are each IOType names.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var Validation_js_1 = require("../../../axon/js/Validation.js");
var assertMutuallyExclusiveOptions_js_1 = require("../../../phet-core/js/assertMutuallyExclusiveOptions.js");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var StateSchema = /** @class */ (function () {
    function StateSchema(providedOptions) {
        // Either create with compositeSchema, or specify a that this state is just a value
        assert && (0, assertMutuallyExclusiveOptions_js_1.default)(providedOptions, ['compositeSchema', 'apiStateKeys'], ['displayString', 'validator']);
        var options = (0, optionize_js_1.default)()({
            displayString: '',
            validator: null,
            compositeSchema: null,
            apiStateKeys: null
        }, providedOptions);
        this.displayString = options.displayString;
        this.validator = options.validator;
        this.compositeSchema = options.compositeSchema;
        this.apiStateKeys = options.apiStateKeys;
        if (assert && options.apiStateKeys) {
            assert && assert(options.compositeSchema, 'apiStateKeys can only be specified by a composite state schema.');
            assert && options.apiStateKeys.forEach(function (apiStateKey) {
                assert && assert(options.compositeSchema.hasOwnProperty(apiStateKey), "apiStateKey not part of composite state schema: ".concat(apiStateKey));
            });
        }
    }
    /**
     * This method provides a default implementation for setting a stateObject onto an object from the stateSchema information.
     * It supports the coreObject keys as private, underscore-prefixed field, as
     * well as if the coreObject has an es5 setter instead of an actual field.
     */
    StateSchema.prototype.defaultApplyState = function (coreObject, stateObject) {
        assert && assert(this.isComposite(), 'defaultApplyState from stateSchema only applies to composite stateSchemas');
        for (var stateKey in this.compositeSchema) {
            if (this.compositeSchema.hasOwnProperty(stateKey)) {
                assert && assert(stateObject.hasOwnProperty(stateKey), "stateObject does not have expected schema key: ".concat(stateKey));
                // The IOType for the key in the composite.
                var schemaIOType = this.compositeSchema[stateKey];
                var coreObjectAccessorName = this.getCoreObjectAccessorName(stateKey, coreObject);
                // Using fromStateObject to deserialize sub-component
                if (schemaIOType.defaultDeserializationMethod === 'fromStateObject') {
                    // @ts-expect-error, I don't know how to tell typescript that we are accessing an expected key on the PhetioObject subtype. Likely there is no way with making things generic.
                    coreObject[coreObjectAccessorName] = this.compositeSchema[stateKey].fromStateObject(stateObject[stateKey]);
                }
                else {
                    assert && assert(schemaIOType.defaultDeserializationMethod === 'applyState', 'unexpected deserialization method');
                    // Using applyState to deserialize sub-component
                    // @ts-expect-error, I don't know how to tell typescript that we are accessing an expected key on the PhetioObject subtype. Likely there is no way with making things generic.
                    this.compositeSchema[stateKey].applyState(coreObject[coreObjectAccessorName], stateObject[stateKey]);
                }
            }
        }
    };
    /**
     * This method provides a default implementation for creating a stateObject from the stateSchema by accessing those
     * same key names on the coreObject instance. It supports those keys as private, underscore-prefixed field, as
     * well as if the coreObject has an es5 getter instead of an actual field.
     */
    StateSchema.prototype.defaultToStateObject = function (coreObject) {
        assert && assert(this.isComposite(), 'defaultToStateObject from stateSchema only applies to composite stateSchemas');
        var stateObject = {};
        for (var stateKey in this.compositeSchema) {
            if (this.compositeSchema.hasOwnProperty(stateKey)) {
                var coreObjectAccessorName = this.getCoreObjectAccessorName(stateKey, coreObject);
                if (assert) {
                    var descriptor = Object.getOwnPropertyDescriptor(coreObject, coreObjectAccessorName);
                    var isGetter = false;
                    // @ts-expect-error Subtype T for this method better
                    if (coreObject.constructor.prototype) {
                        // The prototype is what has the getter on it
                        // @ts-expect-error Subtype T for this method better
                        var prototypeDescriptor = Object.getOwnPropertyDescriptor(coreObject.constructor.prototype, coreObjectAccessorName);
                        isGetter = !!prototypeDescriptor && !!prototypeDescriptor.get;
                    }
                    var isValue = !!descriptor && descriptor.hasOwnProperty('value') && descriptor.writable;
                    assert && assert(isValue || isGetter, "cannot get state because coreObject does not have expected schema key: ".concat(coreObjectAccessorName));
                }
                // @ts-expect-error https://github.com/phetsims/tandem/issues/261
                stateObject[stateKey] = this.compositeSchema[stateKey].toStateObject(coreObject[coreObjectAccessorName]);
            }
        }
        return stateObject;
    };
    /**
     * Provide the member string key that should be used to get/set an instance's field. Used only internally for the
     * default implementations of toStateObject and applyState.
     */
    StateSchema.prototype.getCoreObjectAccessorName = function (stateKey, coreObject) {
        assert && assert(!stateKey.startsWith('__'), 'State keys should not start with too many underscores: ' + stateKey + '. When serializing ', coreObject);
        // Does the class field start with an underscore? We need to cover two cases here. The first is where the underscore
        // was added to make a private state key. The second, is where the core class only has the underscore-prefixed
        // field key name available for setting. The easiest algorithm to cover all cases is to see if the coreObject has
        // the underscore-prefixed key name, and use that if available, otherwise use the stateKey without an underscore.
        var noUnderscore = stateKey.startsWith('_') ? stateKey.substring(1) : stateKey;
        var underscored = "_".concat(noUnderscore);
        var coreObjectAccessorName;
        // @ts-expect-error - T is not specific to composite schemas, so NumberIO doesn't actually need a hasOwnProperty method
        if (coreObject.hasOwnProperty(underscored)) {
            coreObjectAccessorName = underscored;
        }
        else {
            coreObjectAccessorName = noUnderscore;
        }
        return coreObjectAccessorName;
    };
    /**
     * True if the StateSchema is a composite schema. See the header documentation in this file for the definition
     * of "composite" schema.
     */
    StateSchema.prototype.isComposite = function () {
        return !!this.compositeSchema;
    };
    /**
     * Check if a given stateObject is as valid as can be determined by this StateSchema. Will return null if valid, but
     * needs more checking up and down the hierarchy.
     *
     * @param stateObject - the stateObject to validate against
     * @param toAssert - whether to assert when invalid
     * @param schemaKeysPresentInStateObject - to be populated with any keys this StateSchema is responsible for.
     * @returns boolean if validity can be checked, null if valid, but next in the hierarchy is needed
     */
    StateSchema.prototype.checkStateObjectValid = function (stateObject, toAssert, schemaKeysPresentInStateObject) {
        if (this.isComposite()) {
            var compositeStateObject_1 = stateObject;
            var schema_1 = this.compositeSchema;
            var valid_1 = null;
            if (!compositeStateObject_1) {
                assert && toAssert && assert(false, 'There was no stateObject, but there was a state schema saying there should be', schema_1);
                valid_1 = false;
                return valid_1;
            }
            var keys = Object.keys(schema_1);
            keys.forEach(function (key) {
                if (typeof key === 'string') {
                    if (!compositeStateObject_1.hasOwnProperty(key)) {
                        assert && toAssert && assert(false, "".concat(key, " in state schema but not in the state object"));
                        valid_1 = false;
                    }
                    else {
                        if (!schema_1[key].isStateObjectValid(compositeStateObject_1[key], false)) {
                            assert && toAssert && assert(false, "stateObject is not valid for ".concat(key, ". stateObject="), compositeStateObject_1[key], 'schema=', schema_1[key]);
                            valid_1 = false;
                        }
                    }
                    schemaKeysPresentInStateObject.push(key);
                }
                else {
                    console.error('key should be a string', key);
                    assert && assert(false, 'key should be a string');
                }
            });
            return valid_1;
        }
        else {
            assert && assert(this.validator, 'validator must be present if not composite');
            var valueStateObject = stateObject;
            if (assert && toAssert) {
                var validationError = Validation_js_1.default.getValidationError(valueStateObject, this.validator);
                assert(validationError === null, 'valueStateObject failed validation', valueStateObject, validationError);
            }
            return Validation_js_1.default.isValueValid(valueStateObject, this.validator);
        }
    };
    /**
     * Get a list of all IOTypes associated with this StateSchema
     */
    StateSchema.prototype.getRelatedTypes = function () {
        var _this = this;
        var relatedTypes = [];
        if (this.compositeSchema) {
            var keys = Object.keys(this.compositeSchema);
            keys.forEach(function (stateSchemaKey) {
                relatedTypes.push(_this.compositeSchema[stateSchemaKey]);
            });
        }
        return relatedTypes;
    };
    /**
     * Returns a unique identified for this stateSchema, or an object of the stateSchemas for each sub-component in the composite
     * (phet-io internal)
     */
    StateSchema.prototype.getStateSchemaAPI = function () {
        if (this.isComposite()) {
            return _.mapValues(this.compositeSchema, function (value) { return value.typeName; });
        }
        else {
            return this.displayString;
        }
    };
    /**
     * Factory function for StateSchema instances that represent a single value of state. This is opposed to a composite
     * schema of sub-components.
     */
    StateSchema.asValue = function (displayString, validator) {
        assert && assert(validator, 'validator required');
        return new StateSchema({
            validator: validator,
            displayString: displayString
        });
    };
    return StateSchema;
}());
exports.default = StateSchema;
tandemNamespace_js_1.default.register('StateSchema', StateSchema);
