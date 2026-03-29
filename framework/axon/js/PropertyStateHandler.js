"use strict";
// Copyright 2020-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyStateHandlerSingleton = void 0;
var Tandem_js_1 = require("../../tandem/js/Tandem.js");
var axon_js_1 = require("./axon.js");
var PropertyStatePhase_js_1 = require("./PropertyStatePhase.js");
var PropertyStateHandler = /** @class */ (function () {
    function PropertyStateHandler() {
        this.initialized = false;
        // Properties support setDeferred(). We defer setting their values so all changes take effect
        // at once. This keeps track of finalization actions (embodied in a PhaseCallback) that must take place after all
        // Property values have changed. This keeps track of both types of PropertyStatePhase: undeferring and notification.
        this.phaseCallbackSets = new PhaseCallbackSets();
        // each pair has a Map optimized for looking up based on the "before phetioID" and the "after phetioID"
        // of the dependency. Having a data structure set up for both directions of look-up makes each operation O(1). See https://github.com/phetsims/axon/issues/316
        this.undeferBeforeUndeferMapPair = new OrderDependencyMapPair(PropertyStatePhase_js_1.default.UNDEFER, PropertyStatePhase_js_1.default.UNDEFER);
        this.undeferBeforeNotifyMapPair = new OrderDependencyMapPair(PropertyStatePhase_js_1.default.UNDEFER, PropertyStatePhase_js_1.default.NOTIFY);
        this.notifyBeforeUndeferMapPair = new OrderDependencyMapPair(PropertyStatePhase_js_1.default.NOTIFY, PropertyStatePhase_js_1.default.UNDEFER);
        this.notifyBeforeNotifyMapPair = new OrderDependencyMapPair(PropertyStatePhase_js_1.default.NOTIFY, PropertyStatePhase_js_1.default.NOTIFY);
        // keep a list of all map pairs for easier iteration
        this.mapPairs = [
            this.undeferBeforeUndeferMapPair,
            this.undeferBeforeNotifyMapPair,
            this.notifyBeforeUndeferMapPair,
            this.notifyBeforeNotifyMapPair
        ];
    }
    PropertyStateHandler.prototype.initialize = function (phetioStateEngine, ReadOnlyPropertyConstructor) {
        var _this = this;
        assert && assert(!this.initialized, 'cannot initialize twice');
        phetioStateEngine.onBeforeApplyStateEmitter.addListener(function (phetioObject) {
            // withhold AXON/Property notifications until all values have been set to avoid inconsistent intermediate states,
            // see https://github.com/phetsims/phet-io-wrappers/issues/229
            // only do this if the PhetioObject is already not deferred
            if (phetioObject instanceof ReadOnlyPropertyConstructor && !phetioObject.isDeferred) {
                phetioObject.setDeferred(true);
                var phetioID_1 = phetioObject.tandem.phetioID;
                var listener = function () {
                    var potentialListener = phetioObject.setDeferred(false);
                    // Always add a PhaseCallback so that we can track the order dependency, even though setDeferred can return null.
                    _this.phaseCallbackSets.addNotifyPhaseCallback(new PhaseCallback(phetioID_1, PropertyStatePhase_js_1.default.NOTIFY, potentialListener || _.noop));
                };
                _this.phaseCallbackSets.addUndeferPhaseCallback(new PhaseCallback(phetioID_1, PropertyStatePhase_js_1.default.UNDEFER, listener));
            }
        });
        // It is important that nothing else adds listeners at import time before this. Properties take precedent.
        assert && assert(!phetioStateEngine.undeferEmitter.hasListeners(), 'At this time, we rely on Properties undeferring first.');
        phetioStateEngine.undeferEmitter.addListener(function (state) {
            // Properties set to final values and notify of any value changes.
            _this.undeferAndNotifyProperties(new Set(Object.keys(state)));
        });
        phetioStateEngine.isSettingStateProperty.lazyLink(function (isSettingState) {
            assert && !isSettingState && assert(_this.phaseCallbackSets.size === 0, 'PhaseCallbacks should have all been applied');
        });
        this.initialized = true;
    };
    PropertyStateHandler.validateInstrumentedProperty = function (property) {
        assert && Tandem_js_1.default.VALIDATION && assert(property.isPhetioInstrumented && property.isPhetioInstrumented(), "must be an instrumented Property: ".concat(property));
    };
    PropertyStateHandler.prototype.validatePropertyPhasePair = function (property, phase) {
        PropertyStateHandler.validateInstrumentedProperty(property);
    };
    /**
     * Get the MapPair associated with the proved PropertyStatePhases
     */
    PropertyStateHandler.prototype.getMapPairFromPhases = function (beforePhase, afterPhase) {
        var matchedPairs = this.mapPairs.filter(function (mapPair) { return beforePhase === mapPair.beforePhase && afterPhase === mapPair.afterPhase; });
        assert && assert(matchedPairs.length === 1, 'one and only one map should match the provided phases');
        return matchedPairs[0];
    };
    /**
     * Register that one Property must have a "Phase" applied for PhET-iO state before another Property's Phase. A Phase
     * is an ending state in PhET-iO state set where Property values solidify, notifications for value changes are called.
     * The PhET-iO state engine will always undefer a Property before it notifies its listeners. This is for registering
     * two different Properties.
     *
     * @param beforeProperty - the Property that needs to be set before the second; must be instrumented for PhET-iO
     * @param beforePhase
     * @param afterProperty - must be instrumented for PhET-iO
     * @param afterPhase
     */
    PropertyStateHandler.prototype.registerPhetioOrderDependency = function (beforeProperty, beforePhase, afterProperty, afterPhase) {
        if (Tandem_js_1.default.PHET_IO_ENABLED) {
            assert && assert(!(beforePhase === PropertyStatePhase_js_1.default.NOTIFY && afterPhase === PropertyStatePhase_js_1.default.UNDEFER), 'It is PhET-iO policy at this time to have all notifications occur after all state values have been applied.');
            this.validatePropertyPhasePair(beforeProperty, beforePhase);
            this.validatePropertyPhasePair(afterProperty, afterPhase);
            assert && beforeProperty === afterProperty && assert(beforePhase !== afterPhase, 'cannot set same Property to same phase');
            var mapPair = this.getMapPairFromPhases(beforePhase, afterPhase);
            mapPair.addOrderDependency(beforeProperty.tandem.phetioID, afterProperty.tandem.phetioID);
        }
    };
    /**
     * {Property} property - must be instrumented for PhET-iO
     * {boolean} - true if Property is in any order dependency
     */
    PropertyStateHandler.prototype.propertyInAnOrderDependency = function (property) {
        PropertyStateHandler.validateInstrumentedProperty(property);
        return _.some(this.mapPairs, function (mapPair) { return mapPair.usesPhetioID(property.tandem.phetioID); });
    };
    /**
     * Unregisters all order dependencies for the given Property
     * {ReadOnlyProperty} property - must be instrumented for PhET-iO
     */
    PropertyStateHandler.prototype.unregisterOrderDependenciesForProperty = function (property) {
        if (Tandem_js_1.default.PHET_IO_ENABLED) {
            PropertyStateHandler.validateInstrumentedProperty(property);
            // Be graceful if given a Property that is not registered in an order dependency.
            if (this.propertyInAnOrderDependency(property)) {
                assert && assert(this.propertyInAnOrderDependency(property), 'Property must be registered in an order dependency to be unregistered');
                this.mapPairs.forEach(function (mapPair) { return mapPair.unregisterOrderDependenciesForProperty(property); });
            }
        }
    };
    /**
     * Given registered Property Phase order dependencies, undefer all AXON/Property PhET-iO Elements to take their
     * correct values and have each notify their listeners.
     * {Set.<string>} phetioIDsInState - set of phetioIDs that were set in state
     */
    PropertyStateHandler.prototype.undeferAndNotifyProperties = function (phetioIDsInState) {
        assert && assert(this.initialized, 'must be initialized before getting called');
        // {Object.<string,boolean>} - true if a phetioID + phase pair has been applied, keys are the combination of
        // phetioIDs and phase, see PhaseCallback.getTerm()
        var completedPhases = {};
        // to support failing out instead of infinite loop
        var numberOfIterations = 0;
        // Normally we would like to undefer things before notify, but make sure this is done in accordance with the order dependencies.
        while (this.phaseCallbackSets.size > 0) {
            numberOfIterations++;
            // Error case logging
            if (numberOfIterations > 5000) {
                this.errorInUndeferAndNotifyStep(completedPhases);
            }
            // Try to undefer as much as possible before notifying
            this.attemptToApplyPhases(PropertyStatePhase_js_1.default.UNDEFER, completedPhases, phetioIDsInState);
            this.attemptToApplyPhases(PropertyStatePhase_js_1.default.NOTIFY, completedPhases, phetioIDsInState);
        }
    };
    PropertyStateHandler.prototype.errorInUndeferAndNotifyStep = function (completedPhases) {
        // combine phetioID and Phase into a single string to keep this process specific.
        var stillToDoIDPhasePairs = [];
        this.phaseCallbackSets.forEach(function (phaseCallback) { return stillToDoIDPhasePairs.push(phaseCallback.getTerm()); });
        var relevantOrderDependencies = [];
        this.mapPairs.forEach(function (mapPair) {
            var beforeMap = mapPair.beforeMap;
            var _loop_1 = function (beforePhetioID, afterPhetioIDs) {
                afterPhetioIDs.forEach(function (afterPhetioID) {
                    var beforeTerm = beforePhetioID + beforeMap.beforePhase;
                    var afterTerm = afterPhetioID + beforeMap.afterPhase;
                    if (stillToDoIDPhasePairs.includes(beforeTerm) || stillToDoIDPhasePairs.includes(afterTerm)) {
                        relevantOrderDependencies.push({
                            beforeTerm: beforeTerm,
                            afterTerm: afterTerm
                        });
                    }
                });
            };
            for (var _i = 0, beforeMap_1 = beforeMap; _i < beforeMap_1.length; _i++) {
                var _a = beforeMap_1[_i], beforePhetioID = _a[0], afterPhetioIDs = _a[1];
                _loop_1(beforePhetioID, afterPhetioIDs);
            }
        });
        var string = '';
        console.log('still to be undeferred', this.phaseCallbackSets.undeferSet);
        console.log('still to be notified', this.phaseCallbackSets.notifySet);
        console.log('order dependencies that apply to the still todos', relevantOrderDependencies);
        relevantOrderDependencies.forEach(function (orderDependency) {
            string += "".concat(orderDependency.beforeTerm, "\t").concat(orderDependency.afterTerm, "\n");
        });
        console.log('\n\nin graphable form:\n\n', string);
        var assertMessage = 'Impossible set state: from undeferAndNotifyProperties; ordering constraints cannot be satisfied';
        assert && assert(false, assertMessage);
        // We must exit here even if assertions are disabled so it wouldn't lock up the browser.
        throw new Error(assertMessage);
    };
    /**
     * Only for Testing!
     * Get the number of order dependencies registered in this class
     *
     */
    PropertyStateHandler.prototype.getNumberOfOrderDependencies = function () {
        var count = 0;
        this.mapPairs.forEach(function (mapPair) {
            mapPair.afterMap.forEach(function (valueSet) { count += valueSet.size; });
        });
        return count;
    };
    /**
     * Go through all phases still to be applied, and apply them if the order dependencies allow it. Only apply for the
     * particular phase provided. In general UNDEFER must occur before the same phetioID gets NOTIFY.
     *
     * @param phase - only apply PhaseCallbacks for this particular PropertyStatePhase
     * @param completedPhases - map that keeps track of completed phases
     * @param phetioIDsInState - set of phetioIDs that were set in state
     */
    PropertyStateHandler.prototype.attemptToApplyPhases = function (phase, completedPhases, phetioIDsInState) {
        var phaseCallbackSet = this.phaseCallbackSets.getSetFromPhase(phase);
        for (var _i = 0, phaseCallbackSet_1 = phaseCallbackSet; _i < phaseCallbackSet_1.length; _i++) {
            var phaseCallbackToPotentiallyApply = phaseCallbackSet_1[_i];
            assert && assert(phaseCallbackToPotentiallyApply.phase === phase, 'phaseCallbackSet should only include callbacks for provided phase');
            // only try to check the order dependencies to see if this has to be after something that is incomplete.
            if (this.phetioIDCanApplyPhase(phaseCallbackToPotentiallyApply.phetioID, phase, completedPhases, phetioIDsInState)) {
                // Fire the listener;
                phaseCallbackToPotentiallyApply.listener();
                // Remove it from the main list so that it doesn't get called again.
                phaseCallbackSet.delete(phaseCallbackToPotentiallyApply);
                // Keep track of all completed PhaseCallbacks
                completedPhases[phaseCallbackToPotentiallyApply.getTerm()] = true;
            }
        }
    };
    /**
     * @param phetioID - think of this as the "afterPhetioID" since there may be some phases that need to be applied before it has this phase done.
     * @param phase
     * @param completedPhases - map that keeps track of completed phases
     * @param phetioIDsInState - set of phetioIDs that were set in state
     * @param - if the provided phase can be applied given the dependency order dependencies of the state engine.
     */
    PropertyStateHandler.prototype.phetioIDCanApplyPhase = function (phetioID, phase, completedPhases, phetioIDsInState) {
        // Undefer must happen before notify
        if (phase === PropertyStatePhase_js_1.default.NOTIFY && !completedPhases[phetioID + PropertyStatePhase_js_1.default.UNDEFER]) {
            return false;
        }
        // Get a list of the maps for this phase being applies.
        var mapsToCheck = [];
        this.mapPairs.forEach(function (mapPair) {
            if (mapPair.afterPhase === phase) {
                // Use the "afterMap" because below looks up what needs to come before.
                mapsToCheck.push(mapPair.afterMap);
            }
        });
        // O(2)
        for (var i = 0; i < mapsToCheck.length; i++) {
            var mapToCheck = mapsToCheck[i];
            if (!mapToCheck.has(phetioID)) {
                return true;
            }
            var setOfThingsThatShouldComeFirst = mapToCheck.get(phetioID);
            assert && assert(setOfThingsThatShouldComeFirst, 'must have this set');
            // O(K) where K is the number of elements that should come before Property X
            for (var _i = 0, _a = setOfThingsThatShouldComeFirst; _i < _a.length; _i++) {
                var beforePhetioID = _a[_i];
                // check if the before phase for this order dependency has already been completed
                // Make sure that we only care about elements that were actually set during this state set
                if (!completedPhases[beforePhetioID + mapToCheck.beforePhase] &&
                    phetioIDsInState.has(beforePhetioID) && phetioIDsInState.has(phetioID)) {
                    return false;
                }
            }
        }
        return true;
    };
    return PropertyStateHandler;
}());
// POJSO for a callback for a specific Phase in a Property's state set lifecycle. See undeferAndNotifyProperties()
var PhaseCallback = /** @class */ (function () {
    function PhaseCallback(phetioID, phase, listener) {
        if (listener === void 0) { listener = _.noop; }
        this.phetioID = phetioID;
        this.phase = phase;
        this.listener = listener;
    }
    /**
     * {string} - unique term for the id/phase pair
     */
    PhaseCallback.prototype.getTerm = function () {
        return this.phetioID + this.phase;
    };
    return PhaseCallback;
}());
var OrderDependencyMapPair = /** @class */ (function () {
    function OrderDependencyMapPair(beforePhase, afterPhase) {
        // @ts-expect-error, it is easiest to fudge here since we are adding the PhaseMap properties just below here.
        this.beforeMap = new Map();
        this.beforeMap.beforePhase = beforePhase;
        this.beforeMap.afterPhase = afterPhase;
        // @ts-expect-error, it is easiest to fudge here since we are adding the PhaseMap properties just below here.
        this.afterMap = new Map();
        this.afterMap.beforePhase = beforePhase;
        this.afterMap.afterPhase = afterPhase;
        this.beforeMap.otherMap = this.afterMap;
        this.afterMap.otherMap = this.beforeMap;
        this.beforePhase = beforePhase;
        this.afterPhase = afterPhase;
    }
    /**
     * Register an order dependency between two phetioIDs. This will add data to maps in "both direction". If accessing
     * with just the beforePhetioID, or with the afterPhetioID.
     */
    OrderDependencyMapPair.prototype.addOrderDependency = function (beforePhetioID, afterPhetioID) {
        if (!this.beforeMap.has(beforePhetioID)) {
            this.beforeMap.set(beforePhetioID, new Set());
        }
        this.beforeMap.get(beforePhetioID).add(afterPhetioID);
        if (!this.afterMap.has(afterPhetioID)) {
            this.afterMap.set(afterPhetioID, new Set());
        }
        this.afterMap.get(afterPhetioID).add(beforePhetioID);
    };
    /**
     * Unregister all order dependencies for the provided Property
     */
    OrderDependencyMapPair.prototype.unregisterOrderDependenciesForProperty = function (property) {
        var phetioIDToRemove = property.tandem.phetioID;
        [this.beforeMap, this.afterMap].forEach(function (map) {
            map.has(phetioIDToRemove) && map.get(phetioIDToRemove).forEach(function (phetioID) {
                var setOfAfterMapIDs = map.otherMap.get(phetioID);
                setOfAfterMapIDs && setOfAfterMapIDs.delete(phetioIDToRemove);
                // Clear out empty entries to avoid having lots of empty Sets sitting around
                setOfAfterMapIDs.size === 0 && map.otherMap.delete(phetioID);
            });
            map.delete(phetioIDToRemove);
        });
        // Look through every dependency and make sure the phetioID to remove has been completely removed.
        assertSlow && [this.beforeMap, this.afterMap].forEach(function (map) {
            map.forEach(function (valuePhetioIDs, key) {
                assertSlow && assertSlow(key !== phetioIDToRemove, 'should not be a key');
                assertSlow && assertSlow(!valuePhetioIDs.has(phetioIDToRemove), 'should not be in a value list');
            });
        });
    };
    OrderDependencyMapPair.prototype.usesPhetioID = function (phetioID) {
        return this.beforeMap.has(phetioID) || this.afterMap.has(phetioID);
    };
    return OrderDependencyMapPair;
}());
// POJSO to keep track of PhaseCallbacks while providing O(1) lookup time because it is built on Set
var PhaseCallbackSets = /** @class */ (function () {
    function PhaseCallbackSets() {
        this.undeferSet = new Set();
        this.notifySet = new Set();
    }
    Object.defineProperty(PhaseCallbackSets.prototype, "size", {
        get: function () {
            return this.undeferSet.size + this.notifySet.size;
        },
        enumerable: false,
        configurable: true
    });
    PhaseCallbackSets.prototype.forEach = function (callback) {
        this.undeferSet.forEach(callback);
        this.notifySet.forEach(callback);
    };
    PhaseCallbackSets.prototype.addUndeferPhaseCallback = function (phaseCallback) {
        this.undeferSet.add(phaseCallback);
    };
    PhaseCallbackSets.prototype.addNotifyPhaseCallback = function (phaseCallback) {
        this.notifySet.add(phaseCallback);
    };
    PhaseCallbackSets.prototype.getSetFromPhase = function (phase) {
        return phase === PropertyStatePhase_js_1.default.NOTIFY ? this.notifySet : this.undeferSet;
    };
    return PhaseCallbackSets;
}());
axon_js_1.default.register('PropertyStateHandler', PropertyStateHandler);
exports.default = PropertyStateHandler;
/**
 * Singleton responsible for AXON/Property specific state logic. Use this global for the project to have a single
 * place to tap into the PhetioStateEngine, as well as a single point to register any order dependencies that Properties
 * have between each other when setting their state and applying their values/notifying.
 */
exports.propertyStateHandlerSingleton = new PropertyStateHandler();
axon_js_1.default.register('propertyStateHandlerSingleton', exports.propertyStateHandlerSingleton);
