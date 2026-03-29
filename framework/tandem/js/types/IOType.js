"use strict";
// Copyright 2020-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * IOTypes form a synthetic type system used to describe PhET-iO Elements. A PhET-iO Element is an instrumented PhetioObject
 * that is interoperable from the "wrapper" frame (outside the sim frame). An IOType includes documentation, methods,
 * names, serialization, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var validate_js_1 = require("../../../axon/js/validate.js");
var Validation_js_1 = require("../../../axon/js/Validation.js");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
var PhetioConstants_js_1 = require("../PhetioConstants.js");
var TandemConstants_js_1 = require("../TandemConstants.js");
var tandemNamespace_js_1 = require("../tandemNamespace.js");
var StateSchema_js_1 = require("./StateSchema.js");
// constants
var VALIDATE_OPTIONS_FALSE = { validateValidator: false };
var truthy = function (x) { return !!x; };
// Global flag that triggers pruning the state object down to only that which gets tracked by the PhET-iO API, see
// apiStateKeys to opt into api state tracking
var GETTING_STATE_FOR_API = false;
var API_STATE_NESTED_COUNT = 0;
/**
 * Estimate the core type name from a given IOType name.
 */
var getCoreTypeName = function (ioTypeName) {
    var index = ioTypeName.indexOf(PhetioConstants_js_1.default.IO_TYPE_SUFFIX);
    assert && assert(index >= 0, 'IO should be in the type name');
    return ioTypeName.substring(0, index);
};
// StateType is the whole thing, SelfStateType is just at this level
var IOType = /** @class */ (function () {
    /**
     * @param typeName - The name that this IOType will have in the public PhET-iO API. In general, this should
     *    only be word characters, ending in "IO". Parametric types are a special subset of IOTypes that include their
     *    parameters in their typeName. If an IOType's parameters are other IOType(s), then they should be included within
     *    angle brackets, like "PropertyIO<BooleanIO>". Some other types use a more custom format for displaying their
     *    parameter types, in this case the parameter section of the type name (immediately following "IO") should begin
     *    with an open paren, "(". Thus, the schema for a typeName could be defined (using regex) as `[A-Z]\w*IO([(<].*){0,1}`.
     *    Parameterized types should also include a `parameterTypes` field on the IOType.
     * @param providedOptions
     */
    function IOType(typeName, providedOptions) {
        var _this = this;
        var _a, _b;
        this.typeName = typeName;
        // For reference in the options
        var supertype = providedOptions.supertype || IOType.ObjectIO;
        var toStateObjectSupplied = !!(providedOptions.toStateObject);
        var applyStateSupplied = !!(providedOptions.applyState);
        var stateSchemaSupplied = !!(providedOptions.stateSchema);
        var options = (0, optionize_js_1.default)()({
            supertype: IOType.ObjectIO,
            methods: {},
            events: [],
            metadataDefaults: {},
            //  Most likely this will remain PhET-iO internal, and shouldn't need to be used when creating IOTypes outside of tandem/.
            dataDefaults: {},
            methodOrder: [],
            parameterTypes: [],
            documentation: "PhET-iO Type for ".concat(getCoreTypeName(typeName)),
            isFunctionType: false,
            fuzzElement: null,
            /**** STATE ****/
            toStateObject: null,
            fromStateObject: null,
            stateObjectToCreateElementArguments: null,
            applyState: null,
            stateSchema: null,
            apiStateKeys: null,
            defaultDeserializationMethod: 'fromStateObject',
            addChildElement: supertype && supertype.addChildElement
        }, providedOptions);
        if (assert && supertype) {
            Object.keys(options.metadataDefaults).forEach(function (metadataDefaultKey) {
                assert && supertype.getAllMetadataDefaults().hasOwnProperty(metadataDefaultKey) &&
                    assert(supertype.getAllMetadataDefaults()[metadataDefaultKey] !== options.metadataDefaults[metadataDefaultKey], "".concat(metadataDefaultKey, " should not have the same default value as the ancestor metadata default."));
            });
        }
        this.supertype = supertype;
        this.documentation = options.documentation;
        this.methods = options.methods;
        this.events = options.events;
        this.metadataDefaults = options.metadataDefaults;
        this.dataDefaults = options.dataDefaults;
        this.methodOrder = options.methodOrder;
        this.parameterTypes = options.parameterTypes;
        this.fuzzElement = options.fuzzElement;
        // Validation
        this.validator = _.pick(options, Validation_js_1.default.VALIDATOR_KEYS);
        this.validator.validationMessage = this.validator.validationMessage || "Validation failed IOType Validator: ".concat(this.typeName);
        this.defaultDeserializationMethod = options.defaultDeserializationMethod;
        if (options.stateSchema === null || options.stateSchema instanceof StateSchema_js_1.default) {
            this.stateSchema = options.stateSchema;
        }
        else {
            var compositeSchema = typeof options.stateSchema === 'function' ? options.stateSchema(this) : options.stateSchema;
            this.stateSchema = new StateSchema_js_1.default({
                compositeSchema: compositeSchema,
                apiStateKeys: options.apiStateKeys
            });
        }
        // Assert that toStateObject method is provided for value StateSchemas. Do this with the following logic:
        // 1. It is acceptable to not provide a stateSchema (for IOTypes that aren't stateful)
        // 2. You must either provide a toStateObject, or have a composite StateSchema. Composite state schemas support default serialization methods.
        assert && assert(!this.stateSchema || (toStateObjectSupplied || this.stateSchema.isComposite()), 'toStateObject method must be provided for value StateSchemas');
        this.toStateObjectOption = options.toStateObject;
        this.fromStateObjectOption = options.fromStateObject;
        this.applyStateOption = options.applyState;
        this.stateObjectToCreateElementArgumentsOption = options.stateObjectToCreateElementArguments;
        this.toStateObjectSupplied = toStateObjectSupplied;
        this.applyStateSupplied = applyStateSupplied;
        this.stateSchemaSupplied = stateSchemaSupplied;
        this.isFunctionType = options.isFunctionType;
        this.addChildElement = options.addChildElement;
        if (assert) {
            assert && assert(supertype || this.typeName === 'ObjectIO', 'supertype is required');
            assert && assert(!this.typeName.includes('.'), 'Dots should not appear in type names');
            assert && assert(this.typeName.split(/[<(]/)[0].endsWith(PhetioConstants_js_1.default.IO_TYPE_SUFFIX), "IOType name must end with ".concat(PhetioConstants_js_1.default.IO_TYPE_SUFFIX));
            assert && assert(this.hasOwnProperty('typeName'), 'this.typeName is required');
            // assert that each public method adheres to the expected schema
            this.methods && Object.values(this.methods).forEach(function (methodObject) {
                if (typeof methodObject === 'object') {
                    assert && methodObject.invocableForReadOnlyElements && assert(typeof methodObject.invocableForReadOnlyElements === 'boolean', "invocableForReadOnlyElements must be of type boolean: ".concat(methodObject.invocableForReadOnlyElements));
                }
            });
            assert && assert(this.documentation.length > 0, 'documentation must be provided');
            this.methods && this.hasOwnProperty('methodOrder') && this.methodOrder.forEach(function (methodName) {
                assert && assert(_this.methods[methodName], "methodName not in public methods: ".concat(methodName));
            });
            if (supertype) {
                var typeHierarchy_1 = supertype.getTypeHierarchy();
                assert && this.events && this.events.forEach(function (event) {
                    // Make sure events are not listed again
                    assert && assert(!_.some(typeHierarchy_1, function (t) { return t.events.includes(event); }), "IOType should not declare event that parent also has: ".concat(event));
                });
                if ((_a = this.stateSchema) === null || _a === void 0 ? void 0 : _a.apiStateKeys) {
                    var supertypeAPIKeys_1 = supertype.getAllAPIStateKeys();
                    (_b = this.stateSchema) === null || _b === void 0 ? void 0 : _b.apiStateKeys.forEach(function (apiStateKey) {
                        assert && assert(!supertypeAPIKeys_1.includes(apiStateKey), "apiStateKey is already in the super: ".concat(apiStateKey));
                    });
                }
            }
            else {
                // The root IOType must supply all 4 state methods.
                assert && assert(typeof options.toStateObject === 'function', 'toStateObject must be defined');
                assert && assert(typeof options.fromStateObject === 'function', 'fromStateObject must be defined');
                assert && assert(typeof options.stateObjectToCreateElementArguments === 'function', 'stateObjectToCreateElementArguments must be defined');
                assert && assert(typeof options.applyState === 'function', 'applyState must be defined');
            }
        }
    }
    IOType.prototype.toStateObject = function (coreObject) {
        API_STATE_NESTED_COUNT++;
        // validate( coreObject, this.validator, VALIDATE_OPTIONS_FALSE );
        var stateObject;
        // Only do this non-standard toStateObject function if there is a stateSchema but no toStateObject provided
        if (!this.toStateObjectSupplied && this.stateSchemaSupplied && this.stateSchema && this.stateSchema.isComposite()) {
            stateObject = this.defaultToStateObject(coreObject);
        }
        else {
            assert && !this.toStateObjectOption && assert(this.supertype, 'supertype expected if no toStateObject option is provided');
            stateObject = this.toStateObjectOption ? this.toStateObjectOption(coreObject) : this.supertype.toStateObject(coreObject);
        }
        // Do not validate the api state, which get's pruned based on provided apiStateKeys, only validate the complete state
        if (assert && !GETTING_STATE_FOR_API &&
            // only if this IOType instance has more to validate than the supertype
            (this.toStateObjectSupplied || this.stateSchemaSupplied)) {
            // Only validate the stateObject if it is phetioState:true.
            // This is an n*m algorithm because for each time toStateObject is called and needs validation, this.validateStateObject
            // looks all the way up the IOType hierarchy. This is not efficient, but gains us the ability to make sure that
            // the stateObject doesn't have any superfluous, unexpected keys. The "m" portion is based on how many sub-properties
            // in a state call `toStateObject`, and the "n" portion is based on how many IOTypes in the hierarchy define a
            // toStateObject or stateSchema. In the future we could potentially improve performance by having validateStateObject
            // only check against the schema at this level, but then extra keys in the stateObject would not be caught. From work done in https://github.com/phetsims/phet-io/issues/1774
            this.validateStateObject(stateObject);
        }
        var resolvedStateObject;
        // When getting API state, prune out any state that don't opt in as desired for API tracking, see apiStateKeys
        if (GETTING_STATE_FOR_API && this.isCompositeStateSchema() &&
            // When running a nested toStateObject call while generating api state, values should be opt in, because the
            // element state has asked for these values. For example PropertyIO<RangeIO> wants to see min/max state in
            // its validValues.
            !(API_STATE_NESTED_COUNT > 1 && this.apiStateKeysProvided())) {
            resolvedStateObject = _.pick(stateObject, this.getAllAPIStateKeys());
        }
        else {
            resolvedStateObject = stateObject;
        }
        API_STATE_NESTED_COUNT--;
        return resolvedStateObject;
    };
    IOType.prototype.fromStateObject = function (stateObject) {
        if (this.fromStateObjectOption) {
            return this.fromStateObjectOption(stateObject);
        }
        assert && assert(this.supertype);
        return this.supertype.fromStateObject(stateObject);
    };
    IOType.prototype.applyState = function (coreObject, stateObject) {
        (0, validate_js_1.default)(coreObject, this.validator, VALIDATE_OPTIONS_FALSE);
        // Validate, but only if this IOType instance has more to validate than the supertype
        if (this.applyStateSupplied || this.stateSchemaSupplied) {
            // Validate that the provided stateObject is of the expected schema
            // NOTE: Cannot use this.validateStateObject because options adopts supertype.applyState, which is bounds to the
            // parent IOType. This prevents correct validation because the supertype doesn't know about the subtype schemas.
            // @ts-expect-error we cannot type check against PhetioObject from this file
            assert && coreObject.phetioType && coreObject.phetioType.validateStateObject(stateObject);
        }
        // Only do this non-standard applyState function from stateSchema if there is a stateSchema but no applyState provided
        if (!this.applyStateSupplied && this.stateSchemaSupplied && this.stateSchema && this.stateSchema.isComposite()) {
            this.defaultApplyState(coreObject, stateObject);
        }
        else {
            assert && !this.applyStateOption && assert(this.supertype, 'supertype expected if no applyState option is provided');
            this.applyStateOption ? this.applyStateOption(coreObject, stateObject) : this.supertype.applyState(coreObject, stateObject);
        }
    };
    IOType.prototype.stateObjectToCreateElementArguments = function (stateObject) {
        if (this.stateObjectToCreateElementArgumentsOption) {
            return this.stateObjectToCreateElementArgumentsOption(stateObject);
        }
        assert && assert(this.supertype);
        return this.supertype.stateObjectToCreateElementArguments(stateObject);
    };
    // Include state from all composite state schemas up and down the type hierarchy (children overriding parents).
    IOType.prototype.defaultToStateObject = function (coreObject) {
        var superStateObject = {};
        if (this.supertype) {
            superStateObject = this.supertype.defaultToStateObject(coreObject);
        }
        if (this.stateSchema && this.stateSchema.isComposite()) {
            return _.merge(superStateObject, this.stateSchema.defaultToStateObject(coreObject));
        }
        else {
            return superStateObject;
        }
    };
    // Include state from all composite state schemas up and down the type hierarchy (children overriding parents).
    IOType.prototype.defaultApplyState = function (coreObject, stateObject) {
        if (this.supertype) {
            this.supertype.defaultApplyState(coreObject, stateObject);
        }
        if (this.stateSchema && this.stateSchema.isComposite()) {
            this.stateSchema.defaultApplyState(coreObject, stateObject);
        }
    };
    /**
     * Gets an array of IOTypes of the self type and all the supertype ancestors.
     */
    IOType.prototype.getTypeHierarchy = function () {
        var array = [];
        var ioType = this; // eslint-disable-line consistent-this, @typescript-eslint/no-this-alias
        while (ioType) {
            array.push(ioType);
            ioType = ioType.supertype;
        }
        return array;
    };
    /**
     * Returns true if this IOType is a subtype of the passed-in type (or if they are the same).
     */
    IOType.prototype.extends = function (type) {
        // memory-based implementation OK since this method is only used in assertions
        return this.getTypeHierarchy().includes(type);
    };
    /**
     * Return all the metadata defaults (for the entire IOType hierarchy)
     */
    IOType.prototype.getAllMetadataDefaults = function () {
        return _.merge({}, this.supertype ? this.supertype.getAllMetadataDefaults() : {}, this.metadataDefaults);
    };
    /**
     * Return all the data defaults (for the entire IOType hierarchy)
     */
    IOType.prototype.getAllDataDefaults = function () {
        return _.merge({}, this.supertype ? this.supertype.getAllDataDefaults() : {}, this.dataDefaults);
    };
    /**
     * This cannot be in stateSchema, because some IOTypes do not have stateSchema instances, but their supertype does.
     */
    IOType.prototype.isCompositeStateSchema = function () {
        var _a, _b;
        return ((_a = this.supertype) === null || _a === void 0 ? void 0 : _a.isCompositeStateSchema()) || !!((_b = this.stateSchema) === null || _b === void 0 ? void 0 : _b.compositeSchema);
    };
    /**
     * Return all the apiStateKey option values (for the entire IOType hierarchy)
     * For example:
     *  [ null, null, ['validValues'], null ] if there were three supertypes, and your parent was the only IOType with apiStateKeys
     */
    IOType.prototype.getAllAPIStateKeyValues = function (apiStateKeysPerLevel) {
        var _a;
        if (apiStateKeysPerLevel === void 0) { apiStateKeysPerLevel = []; }
        this.supertype && this.supertype.getAllAPIStateKeyValues(apiStateKeysPerLevel);
        apiStateKeysPerLevel.push(((_a = this.stateSchema) === null || _a === void 0 ? void 0 : _a.apiStateKeys) || null);
        return apiStateKeysPerLevel;
    };
    /**
     * See if any IOType up the hierarchy actually supplied apiStateKeys, even in `[]`, meaning "don't opt-in to nested
     * API state.
     */
    IOType.prototype.apiStateKeysProvided = function () {
        return this.getAllAPIStateKeyValues().filter(truthy).length === 0;
    };
    /**
     * Return all the apiStateKeys (for the entire IOType hierarchy) in one array.
     */
    IOType.prototype.getAllAPIStateKeys = function () {
        return _.concat.apply(_, this.getAllAPIStateKeyValues().map(function (x) { return x || []; }));
    };
    /**
     * Get the state object for a PhET-iO Element, but only the entries that should be tracked by the PhET-iO API. See
     * StateSchema.apiStateKeys for details. This implementation sets a global to make sure that nested state also only
     * selects the apiStateKeys for api tracking (PropertyIO<RangeIO> could have validValues of PointIO that shouldn't
     * include non-tracked values of PointIO, if there are any).
     */
    IOType.prototype.toStateObjectForAPI = function (coreObject) {
        assert && assert(!GETTING_STATE_FOR_API, 'API state cannot nest due to limitation of the global');
        GETTING_STATE_FOR_API = true;
        assert && assert(API_STATE_NESTED_COUNT === 0, 'not nested before getting API state');
        var stateObjectForAPIOnly = this.toStateObject(coreObject);
        assert && assert(API_STATE_NESTED_COUNT === 0, 'not nested after getting API state');
        GETTING_STATE_FOR_API = false;
        return stateObjectForAPIOnly;
    };
    /**
     * @param stateObject - the stateObject to validate against
     * @param toAssert=false - whether to assert when invalid
     * @param schemaKeysPresentInStateObject=[]
     * @returns if the stateObject is valid or not.
     */
    IOType.prototype.isStateObjectValid = function (stateObject, toAssert, schemaKeysPresentInStateObject) {
        if (toAssert === void 0) { toAssert = false; }
        if (schemaKeysPresentInStateObject === void 0) { schemaKeysPresentInStateObject = []; }
        // Set to false when invalid
        var valid = true;
        // make sure the stateObject has everything the schema requires and nothing more
        if (this.stateSchema) {
            var validSoFar = this.stateSchema.checkStateObjectValid(stateObject, toAssert, schemaKeysPresentInStateObject);
            // null as a marker to keep checking up the hierarchy, otherwise we reached our based case because the stateSchema was a value, not a composite
            if (validSoFar !== null) {
                return validSoFar;
            }
        }
        if (this.supertype) {
            return valid && this.supertype.isStateObjectValid(stateObject, toAssert, schemaKeysPresentInStateObject);
        }
        // When we reach the root, make sure there isn't anything in the stateObject that isn't described by a schema
        if (!this.supertype && stateObject && typeof stateObject !== 'string' && !Array.isArray(stateObject)) {
            // Visit the state
            Object.keys(stateObject).forEach(function (key) {
                var keyValid = schemaKeysPresentInStateObject.includes(key);
                if (!keyValid) {
                    valid = false;
                }
                assert && toAssert && assert(keyValid, "stateObject provided a key that is not in the schema: ".concat(key));
            });
            return valid;
        }
        return true;
    };
    /**
     * Assert if the provided stateObject is not valid to this IOType's stateSchema
     */
    IOType.prototype.validateStateObject = function (stateObject) {
        this.isStateObjectValid(stateObject, true);
    };
    IOType.prototype.toString = function () {
        return this.typeName;
    };
    /**
     * Return an object that indicates the API type, including documentation, methods & signatures, supertypes, etc.
     * The object is intended for serialization via JSON.stringify().
     *
     * This function could be static, but that doesn't work well with the singleton pattern, so keep in on the prototype.
     */
    IOType.prototype.getAPI = function () {
        // Enumerate the methods specific to the type (not for supertype).
        var methods = {};
        var methodNames = _.keys(this.methods);
        // iterate over each method
        for (var i = 0; i < methodNames.length; i++) {
            var methodName = methodNames[i];
            var method = this.methods[methodName];
            var m = {
                // Return names for parameter types and return types to prevent loops in type graph
                returnType: method.returnType.typeName,
                parameterTypes: method.parameterTypes.map(mapAPIForType),
                documentation: method.documentation
            };
            // invocableForReadOnlyElements===false is opt-in
            if (method.invocableForReadOnlyElements === false) {
                m.invocableForReadOnlyElements = false;
            }
            methods[methodName] = m;
        }
        var supertype = this.supertype;
        // Return all parts of the API as an object
        var phetioType = {
            methods: methods,
            supertype: supertype ? supertype.typeName : supertype,
            typeName: this.typeName,
            documentation: this.documentation,
            events: this.events,
            metadataDefaults: this.metadataDefaults,
            dataDefaults: this.dataDefaults,
            methodOrder: this.methodOrder
        };
        if (this.stateSchema) {
            phetioType.stateSchema = this.stateSchema.getStateSchemaAPI();
            if (this.stateSchema.apiStateKeys && this.stateSchema.apiStateKeys.length > 0) {
                phetioType.apiStateKeys = this.stateSchema.apiStateKeys;
            }
        }
        // This way we don't have this key unless there are parameterTypes possible (empty array allowed)
        if (this.parameterTypes) {
            phetioType.parameterTypes = this.parameterTypes.map(mapAPIForType);
        }
        return phetioType;
    };
    return IOType;
}());
exports.default = IOType;
var mapAPIForType = function (parameterType) { return parameterType.typeName; };
// default state value
var DEFAULT_STATE = null;
// This must be declared after the class declaration to avoid a circular dependency with PhetioObject.
// @readonly
IOType.ObjectIO = new IOType(TandemConstants_js_1.default.OBJECT_IO_TYPE_NAME, {
    isValidValue: function () { return true; },
    supertype: null,
    documentation: 'The root of the PhET-iO Type hierarchy',
    toStateObject: function (coreObject) {
        if (phet && phet.tandem && phet.tandem.Tandem.VALIDATION) {
            assert && assert(coreObject.tandem, 'coreObject must be PhET-iO object');
            assert && assert(!coreObject.phetioState, "fell back to root serialization state for ".concat(coreObject.tandem.phetioID, ". Potential solutions:\n         * mark the type as phetioState: false\n         * create a custom toStateObject method in your IOType\n         * perhaps you have everything right, but forgot to pass in the IOType via phetioType in the constructor"));
        }
        return DEFAULT_STATE;
    },
    fromStateObject: function () {
        throw new Error('ObjectIO.fromStateObject should not be called');
    },
    stateObjectToCreateElementArguments: function () { return []; },
    applyState: _.noop,
    metadataDefaults: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS,
    dataDefaults: {
        initialState: DEFAULT_STATE
    },
    stateSchema: null
});
tandemNamespace_js_1.default.register('IOType', IOType);
