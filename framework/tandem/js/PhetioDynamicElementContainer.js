"use strict";
// Copyright 2019-2025, University of Colorado Boulder
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
 * Supertype for containers that hold dynamic elements that are PhET-iO instrumented. This type handles common
 * features like creating the archetype for the PhET-iO API, and managing created/disposed data stream events.
 *
 * "Dynamic" is an overloaded term, so allow me to explain what it means in the context of this type. A "dynamic element"
 * is an instrumented PhET-iO Element that is conditionally in the PhET-iO API. Most commonly this is because elements
 * can be created and destroyed during the runtime of the sim. Another "dynamic element" for the PhET-iO project is when
 * an element may or may not be created based on a query parameter. In this case, even if the object then exists for the
 * lifetime of the sim, we may still call this "dynamic" as it pertains to this type, and the PhET-iO API.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var Emitter_js_1 = require("../../axon/js/Emitter.js");
var validate_js_1 = require("../../axon/js/validate.js");
var arrayRemove_js_1 = require("../../phet-core/js/arrayRemove.js");
var merge_js_1 = require("../../phet-core/js/merge.js");
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var DynamicTandem_js_1 = require("./DynamicTandem.js");
var isClearingPhetioDynamicElementsProperty_js_1 = require("./isClearingPhetioDynamicElementsProperty.js");
var isSettingPhetioStateProperty_js_1 = require("./isSettingPhetioStateProperty.js");
var PhetioIDUtils_js_1 = require("./PhetioIDUtils.js");
var PhetioObject_js_1 = require("./PhetioObject.js");
var Tandem_js_1 = require("./Tandem.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var StringIO_js_1 = require("./types/StringIO.js");
// constants
var DEFAULT_CONTAINER_SUFFIX = 'Container';
function archetypeCast(archetype) {
    if (archetype === null) {
        throw new Error('archetype should exist');
    }
    return archetype;
}
var PhetioDynamicElementContainer = /** @class */ (function (_super) {
    __extends(PhetioDynamicElementContainer, _super);
    /**
     * @param createElement - function that creates a dynamic readonly element to be housed in
     * this container. All of this dynamic element container's elements will be created from this function, including the
     * archetype.
     * @param defaultArguments - arguments passed to createElement when creating the archetype
     * @param [providedOptions] - describe the Group itself
     */
    function PhetioDynamicElementContainer(createElement, defaultArguments, providedOptions) {
        var _this = this;
        var _a;
        var options = (0, optionize_js_1.default)()({
            phetioState: false, // elements are included in state, but the container will exist in the downstream sim.
            // Many PhET-iO instrumented types live in common code used by multiple sims, and may only be instrumented in a subset of their usages.
            supportsDynamicState: true,
            containerSuffix: DEFAULT_CONTAINER_SUFFIX,
            // TODO: https://github.com/phetsims/tandem/issues/254
            // @ts-expect-error - this is filled in below
            phetioDynamicElementName: undefined
        }, providedOptions);
        assert && assert(Array.isArray(defaultArguments) || typeof defaultArguments === 'function', 'defaultArguments should be an array or a function');
        if (Array.isArray(defaultArguments)) {
            // createElement expects a Tandem as the first arg
            assert && assert(createElement.length === defaultArguments.length + 1, 'mismatched number of arguments');
        }
        assert && Tandem_js_1.default.VALIDATION && assert(!!options.phetioType, 'phetioType must be supplied');
        assert && Tandem_js_1.default.VALIDATION && assert(Array.isArray(options.phetioType.parameterTypes), 'phetioType must supply its parameter types');
        assert && Tandem_js_1.default.VALIDATION && assert(options.phetioType.parameterTypes.length === 1, 'PhetioDynamicElementContainer\'s phetioType must have exactly one parameter type');
        assert && Tandem_js_1.default.VALIDATION && assert(!!options.phetioType.parameterTypes[0], 'PhetioDynamicElementContainer\'s phetioType\'s parameterType must be truthy');
        if (assert && ((_a = options.tandem) === null || _a === void 0 ? void 0 : _a.supplied)) {
            assert && Tandem_js_1.default.VALIDATION && assert(options.tandem.name.endsWith(options.containerSuffix), 'PhetioDynamicElementContainer tandems should end with options.containerSuffix');
        }
        // options that depend on other options for their default
        if (options.tandem && !options.phetioDynamicElementName) {
            options.phetioDynamicElementName = options.tandem.name.slice(0, options.tandem.name.length - options.containerSuffix.length);
        }
        _this = _super.call(this, options) || this;
        _this.supportsDynamicState = options.supportsDynamicState;
        _this.phetioDynamicElementName = options.phetioDynamicElementName;
        _this.createElement = createElement;
        _this.defaultArguments = defaultArguments;
        // Can be used as an argument to create other archetypes, but otherwise
        // access should not be needed. This will only be non-null when generating the PhET-iO API, see createArchetype().
        _this._archetype = _this.createArchetype();
        // subtypes expected to fire this according to individual implementations
        _this.elementCreatedEmitter = new Emitter_js_1.default({
            parameters: [
                { valueType: PhetioObject_js_1.default, phetioType: options.phetioType.parameterTypes[0], name: 'element' },
                { name: 'phetioID', phetioType: StringIO_js_1.default }
            ],
            tandem: options.tandem.createTandem('elementCreatedEmitter'),
            phetioDocumentation: 'Emitter that fires whenever a new dynamic element is added to the container.'
        });
        // called on disposal of an element
        _this.elementDisposedEmitter = new Emitter_js_1.default({
            parameters: [
                { valueType: PhetioObject_js_1.default, phetioType: options.phetioType.parameterTypes[0], name: 'element' },
                { name: 'phetioID', phetioType: StringIO_js_1.default }
            ],
            tandem: options.tandem.createTandem('elementDisposedEmitter'),
            phetioDocumentation: 'Emitter that fires whenever a dynamic element is removed from the container.'
        });
        // Emit to the data stream on element creation/disposal, no need to do this in PhET brand
        if (Tandem_js_1.default.PHET_IO_ENABLED && _this.isPhetioInstrumented()) {
            _this.elementCreatedEmitter.addListener(function (element) { return _this.createdEventListener(element); });
            _this.elementDisposedEmitter.addListener(function (element) { return _this.disposedEventListener(element); });
        }
        // a way to delay creation notifications to a later time, for phet-io state engine support
        _this.notificationsDeferred = false;
        // lists to keep track of the created and disposed elements when notifications are deferred.
        // These are used to then flush notifications when they are set to no longer be deferred.
        _this.deferredCreations = [];
        _this.deferredDisposals = [];
        // provide a way to opt out of containers clearing dynamic state, useful if group elements exist for the lifetime of
        // the sim, see https://github.com/phetsims/tandem/issues/132
        if (Tandem_js_1.default.PHET_IO_ENABLED && _this.supportsDynamicState &&
            // don't clear archetypes because they are static.
            !_this.phetioIsArchetype && _this.isPhetioInstrumented()) {
            assert && assert(_.hasIn(window, 'phet.phetio.phetioEngine.phetioStateEngine'), 'PhetioDynamicElementContainers must be created once phetioEngine has been constructed');
            var phetioStateEngine = phet.phetio.phetioEngine.phetioStateEngine;
            // On state start, clear out the container and set to defer notifications.
            phetioStateEngine.clearDynamicElementsEmitter.addListener(function (state, scopeTandem) {
                // Only clear if this PhetioDynamicElementContainer is in scope of the state to be set
                if (_this.tandem.hasAncestor(scopeTandem)) {
                    _this.clear({
                        phetioState: state
                    });
                    _this.setNotificationsDeferred(true);
                }
            });
            // done with state setting
            phetioStateEngine.undeferEmitter.addListener(function () {
                if (_this.notificationsDeferred) {
                    _this.setNotificationsDeferred(false);
                }
            });
            phetioStateEngine.addSetStateHelper(function (state, stillToSetIDs) {
                var creationNotified = false;
                var iterationCount = 0;
                while (_this.deferredCreations.length > 0) {
                    if (iterationCount > 200) {
                        throw new Error('Too many iterations in deferred creations, stillToSetIDs = ' + stillToSetIDs.join(', '));
                    }
                    var deferredCreatedElement = _this.deferredCreations[0];
                    if (_this.stateSetOnAllChildrenOfDynamicElement(deferredCreatedElement.tandem.phetioID, stillToSetIDs)) {
                        _this.notifyElementCreatedWhileDeferred(deferredCreatedElement);
                        creationNotified = true;
                    }
                    iterationCount++;
                }
                return creationNotified;
            });
        }
        return _this;
    }
    /**
     * @returns true if all children of a single dynamic element (based on phetioID) have had their state set already.
     */
    PhetioDynamicElementContainer.prototype.stateSetOnAllChildrenOfDynamicElement = function (dynamicElementID, stillToSetIDs) {
        for (var i = 0; i < stillToSetIDs.length; i++) {
            if (PhetioIDUtils_js_1.default.isAncestor(dynamicElementID, stillToSetIDs[i])) {
                return false;
            }
        }
        return true; // No elements in state that aren't in the completed list
    };
    /**
     * Archetypes are created to generate the baseline file, or to validate against an existing baseline file.  They are
     * PhetioObjects and registered with the phetioEngine, but not send out via notifications from PhetioEngine.phetioElementAddedEmitter(),
     * because they are intended for internal usage only.  Archetypes should not be created in production code.
     *
     * PhetioDynamicElementContainer calls this method internally to create and assign its own archetype, but this method
     * can additionally be called with alternate archetypeTandem and/or createElementArgs to create alternate archetypes.
     * This can be necessary in situations that require archetypes provided to other archetypes, or with other forms
     * of dependency injection, such as in https://github.com/phetsims/tandem/issues/312
     */
    PhetioDynamicElementContainer.prototype.createArchetype = function (archetypeTandem, createElementArgs) {
        if (archetypeTandem === void 0) { archetypeTandem = this.tandem.createTandem(Tandem_js_1.DYNAMIC_ARCHETYPE_NAME); }
        if (createElementArgs === void 0) { createElementArgs = this.defaultArguments; }
        // Once the sim has started, any archetypes being created are likely done so because they are nested PhetioGroups.
        if (_.hasIn(window, 'phet.joist.sim') && phet.joist.sim.isConstructionCompleteProperty.value) {
            assert && assert(false, 'nested DynamicElementContainers are not currently supported');
            return null;
        }
        // When generating the baseline, output the schema for the archetype
        if (Tandem_js_1.default.PHET_IO_ENABLED && phet.preloads.phetio.createArchetypes) {
            var archetypeArgs = Array.isArray(createElementArgs) ? createElementArgs : createElementArgs();
            // The create function takes a tandem plus the default args
            assert && assert(this.createElement.length === archetypeArgs.length + 1, 'mismatched number of arguments');
            var archetype = this.createElement.apply(this, __spreadArray([archetypeTandem], archetypeArgs, false));
            // Mark the archetype for inclusion in the baseline schema
            if (this.isPhetioInstrumented()) {
                archetype.markDynamicElementArchetype();
            }
            return archetype;
        }
        else {
            return null;
        }
    };
    /**
     * Create a dynamic PhetioObject element for this container
     * @param componentName
     * @param argsForCreateFunction
     * @param containerParameterType - null in PhET brand
     */
    PhetioDynamicElementContainer.prototype.createDynamicElement = function (componentName, argsForCreateFunction, containerParameterType) {
        assert && assert(Array.isArray(argsForCreateFunction), 'should be array');
        // create with default state and substructure, details will need to be set by setter methods.
        var createdObjectTandem;
        if (!this.tandem.hasChild(componentName)) {
            createdObjectTandem = new DynamicTandem_js_1.default(this.tandem, componentName, this.tandem.getExtendedOptions());
        }
        else {
            createdObjectTandem = this.tandem.createTandem(componentName, this.tandem.getExtendedOptions());
            assert && assert(createdObjectTandem instanceof DynamicTandem_js_1.default, 'createdObjectTandem should be an instance of DynamicTandem'); // eslint-disable-line phet/no-simple-type-checking-assertions
        }
        var createdObject = this.createElement.apply(this, __spreadArray([createdObjectTandem], argsForCreateFunction, false));
        // This validation is only needed for PhET-iO brand
        if (Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented()) {
            assert && assert(containerParameterType !== null, 'containerParameterType must be provided in PhET-iO brand');
            // Make sure the new group element matches the schema for elements.
            (0, validate_js_1.default)(createdObject, containerParameterType.validator);
            assert && assert(createdObject.phetioType.extends(containerParameterType), 'dynamic element container expected its created instance\'s phetioType to match its parameterType.');
        }
        assert && this.assertDynamicPhetioObject(createdObject);
        return createdObject;
    };
    /**
     * A dynamic element should be an instrumented PhetioObject with phetioDynamicElement: true
     */
    PhetioDynamicElementContainer.prototype.assertDynamicPhetioObject = function (phetioObject) {
        if (Tandem_js_1.default.PHET_IO_ENABLED && Tandem_js_1.default.VALIDATION) {
            assert && assert(phetioObject.isPhetioInstrumented(), 'instance should be instrumented');
            assert && assert(phetioObject.phetioDynamicElement, 'instance should be marked as phetioDynamicElement:true');
        }
    };
    /**
     * Emit a created or disposed event.
     */
    PhetioDynamicElementContainer.prototype.emitDataStreamEvent = function (dynamicElement, eventName, additionalData) {
        this.phetioStartEvent(eventName, {
            data: (0, merge_js_1.default)({
                phetioID: dynamicElement.tandem.phetioID
            }, additionalData)
        });
        this.phetioEndEvent();
    };
    /**
     * Emit events when dynamic elements are created.
     */
    PhetioDynamicElementContainer.prototype.createdEventListener = function (dynamicElement) {
        var additionalData = dynamicElement.phetioState ? {
            state: this.phetioType.parameterTypes[0].toStateObject(dynamicElement)
        } : null;
        this.emitDataStreamEvent(dynamicElement, 'created', additionalData);
    };
    /**
     * Emit events when dynamic elements are disposed.
     */
    PhetioDynamicElementContainer.prototype.disposedEventListener = function (dynamicElement) {
        this.emitDataStreamEvent(dynamicElement, 'disposed');
    };
    PhetioDynamicElementContainer.prototype.dispose = function () {
        // If hitting this assertion because of nested dynamic element containers, please discuss with a phet-io team member.
        assert && assert(false, 'PhetioDynamicElementContainers are not intended for disposal');
    };
    /**
     * Dispose a contained element
     */
    PhetioDynamicElementContainer.prototype.disposeElement = function (element) {
        element.dispose();
        assert && this.supportsDynamicState && _.hasIn(window, 'phet.joist.sim') && assert(
        // We do not want to be disposing dynamic elements when state setting EXCEPT when we are clearing all dynamic
        // elements (which is ok and expected to do at the beginning of setting state).
        !(isSettingPhetioStateProperty_js_1.default.value && !isClearingPhetioDynamicElementsProperty_js_1.default), 'should not dispose a dynamic element while setting phet-io state');
        if (this.notificationsDeferred) {
            this.deferredDisposals.push(element);
        }
        else {
            this.elementDisposedEmitter.emit(element, element.tandem.phetioID);
        }
    };
    /**
     * Flush a single element from the list of deferred disposals that have not yet notified about the disposal. This
     * should never be called publicly, instead see `disposeElement`
     */
    PhetioDynamicElementContainer.prototype.notifyElementDisposedWhileDeferred = function (disposedElement) {
        assert && assert(this.notificationsDeferred, 'should only be called when notifications are deferred');
        assert && assert(this.deferredDisposals.includes(disposedElement), 'disposedElement should not have been already notified');
        this.elementDisposedEmitter.emit(disposedElement, disposedElement.tandem.phetioID);
        (0, arrayRemove_js_1.default)(this.deferredDisposals, disposedElement);
    };
    /**
     * Should be called by subtypes upon element creation, see PhetioGroup as an example.
     */
    PhetioDynamicElementContainer.prototype.notifyElementCreated = function (createdElement) {
        if (this.notificationsDeferred) {
            this.deferredCreations.push(createdElement);
        }
        else {
            this.elementCreatedEmitter.emit(createdElement, createdElement.tandem.phetioID);
        }
    };
    /**
     * Flush a single element from the list of deferred creations that have not yet notified about the disposal. This
     * is only public to support specific order dependencies in the PhetioStateEngine, otherwise see `this.notifyElementCreated()`
     * (PhetioGroupTests, phet-io) - only the PhetioStateEngine should notify individual elements created.
     */
    PhetioDynamicElementContainer.prototype.notifyElementCreatedWhileDeferred = function (createdElement) {
        assert && assert(this.notificationsDeferred, 'should only be called when notifications are deferred');
        assert && assert(this.deferredCreations.includes(createdElement), 'createdElement should not have been already notified');
        this.elementCreatedEmitter.emit(createdElement, createdElement.tandem.phetioID);
        (0, arrayRemove_js_1.default)(this.deferredCreations, createdElement);
    };
    /**
     * When set to true, creation and disposal notifications will be deferred until set to false. When set to false,
     * this function will flush all the notifications for created and disposed elements (in that order) that occurred
     * while this container was deferring its notifications.
     */
    PhetioDynamicElementContainer.prototype.setNotificationsDeferred = function (notificationsDeferred) {
        assert && assert(notificationsDeferred !== this.notificationsDeferred, 'should not be the same as current value');
        // Flush all notifications when setting to be no longer deferred
        if (!notificationsDeferred) {
            while (this.deferredCreations.length > 0) {
                this.notifyElementCreatedWhileDeferred(this.deferredCreations[0]);
            }
            while (this.deferredDisposals.length > 0) {
                this.notifyElementDisposedWhileDeferred(this.deferredDisposals[0]);
            }
        }
        assert && assert(this.deferredCreations.length === 0, 'creations should be clear');
        assert && assert(this.deferredDisposals.length === 0, 'disposals should be clear');
        this.notificationsDeferred = notificationsDeferred;
    };
    Object.defineProperty(PhetioDynamicElementContainer.prototype, "archetype", {
        /**
         * @throws error if trying to access when archetypes aren't being created.
         */
        get: function () {
            return archetypeCast(this._archetype);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add the phetioDynamicElementName for API tracking
     */
    PhetioDynamicElementContainer.prototype.getMetadata = function (object) {
        var metadata = _super.prototype.getMetadata.call(this, object);
        assert && assert(!metadata.hasOwnProperty('phetioDynamicElementName'), 'PhetioDynamicElementContainer sets the phetioDynamicElementName metadata key');
        return (0, merge_js_1.default)({ phetioDynamicElementName: this.phetioDynamicElementName }, metadata);
    };
    return PhetioDynamicElementContainer;
}(PhetioObject_js_1.default));
tandemNamespace_js_1.default.register('PhetioDynamicElementContainer', PhetioDynamicElementContainer);
exports.default = PhetioDynamicElementContainer;
