"use strict";
// Copyright 2021-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var affirm_js_1 = require("../../../perennial-alias/js/browser-and-node/affirm.js");
var isInitialStateCompatible_js_1 = require("./isInitialStateCompatible.js");
var METADATA_KEY_NAME = '_metadata';
var DATA_KEY_NAME = '_data';
// Is not the reserved keys to store data/metadata on PhET-iO Elements.
var isChildKey = function (key) { return key !== METADATA_KEY_NAME && key !== DATA_KEY_NAME; };
/**
 * "up-convert" an API to be in the format of API version >=1.0. This generally is thought of as a "sparse, tree-like" API.
 * @returns - In this version, phetioElements will be structured as a tree, but will have a verbose and complete
 *                  set of all metadata keys for each element. There will not be `metadataDefaults` in each type.
 */
var toStructuredTree = function (api, _) {
    var sparseAPI = _.cloneDeep(api);
    // DUPLICATED with phetioEngine.js
    var sparseElements = {};
    Object.keys(api.phetioElements).forEach(function (phetioID) {
        var entry = api.phetioElements[phetioID];
        // API versions < 1.0, use a tandem separator of '.'  If we ever change this separator in main (hopefully not!)
        // this value wouldn't change since it reflects the prior committed versions which do use '.'
        var chain = phetioID.split('.');
        // Fill in each level
        var level = sparseElements;
        chain.forEach(function (componentName) {
            level[componentName] = level[componentName] || {};
            level = level[componentName];
        });
        level[METADATA_KEY_NAME] = {};
        Object.keys(entry).forEach(function (key) {
            // write all values without trying to factor out defaults
            // @ts-expect-error HELP!!!
            level[METADATA_KEY_NAME][key] = entry[key];
        });
    });
    sparseAPI.phetioElements = sparseElements;
    return sparseAPI;
};
var getMetadataValues = function (phetioElement, api, _) {
    var ioTypeName = phetioElement[METADATA_KEY_NAME] ? (phetioElement[METADATA_KEY_NAME].phetioTypeName || 'ObjectIO') : 'ObjectIO';
    if (api.version) {
        var defaults = getMetadataDefaults(ioTypeName, api, _);
        return _.merge(defaults, phetioElement[METADATA_KEY_NAME]);
    }
    else {
        // Dense version supplies all metadata values
        return phetioElement[METADATA_KEY_NAME];
    }
};
/**
 * @returns - defensive copy, non-mutating
 */
var getMetadataDefaults = function (typeName, api, _) {
    var entry = api.phetioTypes[typeName];
    (0, affirm_js_1.default)(entry, "entry missing: ".concat(typeName));
    if (entry.supertype) {
        return _.merge(getMetadataDefaults(entry.supertype, api, _), entry.metadataDefaults);
    }
    else {
        return _.merge({}, entry.metadataDefaults);
    }
};
/**
 * @returns  - whether or not the API is "old", meaning it uses a "flat" structure for phetioElements
 */
var isOldAPIVersion = function (api) {
    return !api.hasOwnProperty('version');
};
/**
 * Compare two APIs for breaking or design changes.
 *
 * @param referenceAPI - the "ground truth" or reference API
 * @param proposedAPI - the proposed API for comparison with referenceAPI
 * @param _ - lodash, so this can be used from different contexts.
 * @param providedOptions
 */
var phetioCompareAPIs = function (referenceAPI, proposedAPI, _, providedOptions) {
    // If the proposed version predates 1.0, then bring it forward to the structured tree with metadata under `_metadata`.
    if (isOldAPIVersion(proposedAPI)) {
        proposedAPI = toStructuredTree(proposedAPI, _);
    }
    if (isOldAPIVersion(referenceAPI)) {
        referenceAPI = toStructuredTree(referenceAPI, _);
    }
    var options = _.assignIn({
        compareDesignedAPIChanges: true,
        compareBreakingAPIChanges: true
    }, providedOptions);
    var breakingProblems = [];
    var designedProblems = [];
    var appendProblem = function (problemString, isDesignedProblem) {
        if (isDesignedProblem === void 0) { isDesignedProblem = false; }
        if (isDesignedProblem && options.compareDesignedAPIChanges) {
            designedProblems.push(problemString);
        }
        else if (!isDesignedProblem && options.compareBreakingAPIChanges) {
            breakingProblems.push(problemString);
        }
    };
    var appendBothProblems = function (problemString, isDesignedElement) {
        appendProblem(problemString, false);
        isDesignedElement && appendProblem(problemString, true);
    };
    /**
     * Visit one element along the APIs.
     * @param trail - the path of tandem componentNames
     * @param reference - current value in the referenceAPI
     * @param proposed - current value in the proposedAPI
     * @param isDesignedElement - are we testing for designed changes, or for breaking changes.
     */
    var visit = function (trail, reference, proposed, isDesignedElement) {
        var _a;
        var phetioID = trail.join('.');
        // Detect an instrumented instance
        if (reference.hasOwnProperty(METADATA_KEY_NAME)) {
            // Override isDesigned, if specified. Once on, you cannot turn off a subtree.
            isDesignedElement = isDesignedElement || reference[METADATA_KEY_NAME].phetioDesigned;
            var referenceCompleteMetadata_1 = getMetadataValues(reference, referenceAPI, _);
            var proposedCompleteMetadata_1 = getMetadataValues(proposed, proposedAPI, _);
            /**
             * Push any problems that may exist for the provided metadataKey.
             * @param metadataKey - See PhetioObject.getMetadata()
             * @param isDesignedChange - if the difference is from a design change, and not from a breaking change test
             * @param invalidProposedValue - an optional new value that would signify a breaking change. Any other value would be acceptable.
             */
            var reportDifferences_1 = function (metadataKey, isDesignedChange, invalidProposedValue) {
                var referenceValue = referenceCompleteMetadata_1[metadataKey];
                // Gracefully handle missing metadata from the <1.0 API format
                var proposedValue = proposedCompleteMetadata_1 ? proposedCompleteMetadata_1[metadataKey] : {};
                if (referenceValue !== proposedValue) {
                    // if proposed API is older (no version specified), ignore phetioArchetypePhetioID changed from null to undefined
                    // because it used to be sparse, and in version 1.0 it became a default.
                    var ignoreBrokenProposed = isOldAPIVersion(proposedAPI) &&
                        metadataKey === 'phetioArchetypePhetioID' &&
                        referenceValue === null &&
                        proposedValue === undefined;
                    var ignoreBrokenReference = isOldAPIVersion(referenceAPI) &&
                        metadataKey === 'phetioArchetypePhetioID' &&
                        proposedValue === null &&
                        referenceValue === undefined;
                    var ignore = ignoreBrokenProposed || ignoreBrokenReference;
                    if (!ignore) {
                        if (invalidProposedValue === undefined || isDesignedChange) {
                            appendProblem("".concat(phetioID, ".").concat(metadataKey, " changed from \"").concat(JSON.stringify(referenceValue), "\" to \"").concat(JSON.stringify(proposedValue), "\""), isDesignedChange);
                        }
                        else if (!isDesignedChange) {
                            if (proposedValue === invalidProposedValue) {
                                appendProblem("".concat(phetioID, ".").concat(metadataKey, " changed from \"").concat(JSON.stringify(referenceValue), "\" to \"").concat(JSON.stringify(proposedValue), "\""));
                            }
                            else {
                                // value changed, but it was a widening API (adding something to state, or making something read/write)
                            }
                        }
                    }
                }
            };
            // Check for breaking changes
            reportDifferences_1('phetioTypeName', false);
            reportDifferences_1('phetioEventType', false);
            reportDifferences_1('phetioPlayback', false);
            reportDifferences_1('phetioDynamicElement', false);
            reportDifferences_1('phetioIsArchetype', false);
            reportDifferences_1('phetioArchetypePhetioID', false);
            reportDifferences_1('phetioState', false, false); // Only report if something became non-stateful
            reportDifferences_1('phetioReadOnly', false, true); // Only need to report if something became readOnly
            // The following metadata keys are non-breaking:
            // 'phetioDocumentation'
            // 'phetioFeatured'
            // 'phetioHighFrequency', non-breaking, assuming clients with data have the full data stream
            // Check for design changes
            if (isDesignedElement) {
                Object.keys(referenceCompleteMetadata_1).forEach(function (metadataKey) {
                    reportDifferences_1(metadataKey, true);
                });
            }
            // If the reference file declares an initial state, check that it hasn't changed
            if (reference._data && reference._data.initialState) {
                // Detect missing expected state
                if (!proposed._data || !proposed._data.initialState) {
                    // apiStateKeys "transition" means error more loudly, since we cannot test the apiStateKeys themselves
                    if (apiSupportsAPIStateKeys(referenceAPI) !== apiSupportsAPIStateKeys(proposedAPI)) {
                        // Missing but expected state is a breaking problem
                        // It is also a designed problem if we expected state in a designed subtree
                        appendBothProblems("".concat(phetioID, "._data.initialState is missing from proposed API"), false);
                    }
                }
                else {
                    // initialState comparison
                    var referencesInitialState_1 = reference._data.initialState;
                    var proposedInitialState_1 = proposed._data.initialState;
                    var testInitialState = function (testDesigned) {
                        var isCompatible = _.isEqualWith(referencesInitialState_1, proposedInitialState_1, function (referenceState, proposedState) {
                            // Top level object comparison of the entire state (not a component piece)
                            if (referencesInitialState_1 === referenceState && proposedInitialState_1 === proposedState) {
                                // The validValues of the localeProperty changes each time a new translation is submitted for a sim.
                                if (phetioID === trail[0] + '.general.model.localeProperty') {
                                    // We do not worry about the notion of "designing" available locales. For breaking changes: the sim
                                    // must have all expected locales, but it is acceptable to add new one without API error.
                                    return testDesigned || referenceState.validValues.every(function (validValue) { return proposedState.validValues.includes(validValue); });
                                }
                                else if (testDesigned) {
                                    return undefined; // Meaning use the default lodash algorithm for comparison.
                                }
                                else {
                                    // Breaking change test uses the general algorithm for initial state compatibility.
                                    // referenceState is the ground truth for compatibility
                                    return (0, isInitialStateCompatible_js_1.default)(referenceState, proposedState);
                                }
                            }
                            return undefined; // Meaning use the default lodash algorithm for comparison.
                        });
                        if (!isCompatible) {
                            var problemString = "".concat(phetioID, "._data.initialState differs. \nExpected:\n").concat(JSON.stringify(reference._data.initialState), "\n actual:\n").concat(JSON.stringify(proposed._data.initialState), "\n");
                            // Report only designed problems if on a designed element.
                            var reportTheProblem = !testDesigned || isDesignedElement;
                            reportTheProblem && appendProblem(problemString, testDesigned);
                        }
                    };
                    // It is also a designed problem if the proposed values deviate from the specified designed values
                    testInitialState(true);
                    // A changed state value could break a client wrapper, so identify it with breaking changes.
                    testInitialState(false);
                }
            }
        }
        else if ((_a = proposed._data) === null || _a === void 0 ? void 0 : _a.initialState) {
            // We don't have reference state, but do have a new initialState. this is a designed change
            isDesignedElement && appendProblem("".concat(phetioID, "._data.initialState is not in reference API but is in proposed"), true);
        }
        // Recurse to children
        for (var componentName in reference) {
            if (reference.hasOwnProperty(componentName) && isChildKey(componentName)) {
                if (!proposed.hasOwnProperty(componentName)) {
                    appendBothProblems("PhET-iO Element missing: ".concat(phetioID, ".").concat(componentName), isDesignedElement);
                }
                else {
                    visit(trail.concat(componentName), reference[componentName], proposed[componentName], isDesignedElement);
                }
            }
        }
        for (var componentName in proposed) {
            if (isDesignedElement && proposed.hasOwnProperty(componentName) && isChildKey(componentName) && !reference.hasOwnProperty(componentName)) {
                appendProblem("New PhET-iO Element (or uninstrumented intermediate container) not in reference: ".concat(phetioID, ".").concat(componentName), true);
            }
        }
    };
    visit([], referenceAPI.phetioElements, proposedAPI.phetioElements, false);
    var _loop_1 = function (typeName) {
        // TODO: We need a notion of phetioDesigned for Type comparison. https://github.com/phetsims/phet-io/issues/1999
        // TODO: add comparison for stateSchema https://github.com/phetsims/phet-io/issues/1999
        if (referenceAPI.phetioTypes.hasOwnProperty(typeName)) {
            // make sure we have the desired type
            if (!proposedAPI.phetioTypes.hasOwnProperty(typeName)) {
                appendProblem("Type missing: ".concat(typeName));
            }
            else {
                var referenceType = referenceAPI.phetioTypes[typeName];
                var proposedType = proposedAPI.phetioTypes[typeName];
                // make sure we have all of the methods
                var referenceMethods = referenceType.methods;
                var proposedMethods = proposedType.methods;
                for (var referenceMethod in referenceMethods) {
                    if (referenceMethods.hasOwnProperty(referenceMethod)) {
                        if (!proposedMethods.hasOwnProperty(referenceMethod)) {
                            appendProblem("Method missing, type=".concat(typeName, ", method=").concat(referenceMethod));
                        }
                        else {
                            // check parameter types (exact match)
                            var referenceParams = referenceMethods[referenceMethod].parameterTypes;
                            var proposedParams = proposedMethods[referenceMethod].parameterTypes;
                            if (referenceParams.join(',') !== proposedParams.join(',')) {
                                appendProblem("".concat(typeName, ".").concat(referenceMethod, " has different parameter types: [").concat(referenceParams.join(', '), "] => [").concat(proposedParams.join(', '), "]"));
                            }
                            var referenceReturnType = referenceMethods[referenceMethod].returnType;
                            var proposedReturnType = proposedMethods[referenceMethod].returnType;
                            if (referenceReturnType !== proposedReturnType) {
                                appendProblem("".concat(typeName, ".").concat(referenceMethod, " has a different return type ").concat(referenceReturnType, " => ").concat(proposedReturnType));
                            }
                        }
                    }
                }
                // make sure we have all of the events (OK to add more)
                var referenceEvents = referenceType.events;
                var proposedEvents_1 = proposedType.events;
                referenceEvents.forEach(function (event) {
                    if (!proposedEvents_1.includes(event)) {
                        appendProblem("".concat(typeName, " is missing event: ").concat(event));
                    }
                });
                if (apiSupportsAPIStateKeys(referenceAPI) &&
                    apiSupportsAPIStateKeys(proposedAPI)) {
                    if (!!referenceType.apiStateKeys !== !!proposedType.apiStateKeys) {
                        var result = referenceType.apiStateKeys ? 'present' : 'absent';
                        var problemString = "".concat(typeName, " apiStateKeys unexpectedly ").concat(result);
                        appendProblem(problemString, true);
                        // Breaking if we lost apiStateKeys
                        referenceType.apiStateKeys && appendProblem(problemString, false);
                    }
                    else {
                        var referenceAPIStateKeys = referenceType.apiStateKeys;
                        var proposedAPIStateKeys_1 = proposedType.apiStateKeys;
                        if (!_.isEqual(referenceAPIStateKeys, proposedAPIStateKeys_1)) {
                            var inReferenceNotProposed = _.difference(referenceAPIStateKeys, proposedAPIStateKeys_1);
                            var inProposedNotReference = _.difference(proposedAPIStateKeys_1, referenceAPIStateKeys);
                            appendProblem("".concat(typeName, " apiStateKeys differ:\n") +
                                "  In reference: ".concat(inReferenceNotProposed, "\n") +
                                "  In proposed: ".concat(inProposedNotReference), true);
                            // It is only breaking if we lost an apiStateKey
                            if (!_.every(referenceAPIStateKeys, function (reference) { return proposedAPIStateKeys_1.includes(reference); })) {
                                appendProblem("".concat(typeName, " apiStateKeys missing from proposed: ").concat(inReferenceNotProposed), false);
                            }
                        }
                    }
                }
                // make sure we have matching supertype names
                var referenceSupertypeName = referenceType.supertype;
                var proposedSupertypeName = proposedType.supertype;
                if (referenceSupertypeName !== proposedSupertypeName) {
                    appendProblem("".concat(typeName, " supertype changed from \"").concat(referenceSupertypeName, "\" to \"").concat(proposedSupertypeName, "\". This may or may not \n          be a breaking change, but we are reporting it just in case."));
                }
                // make sure we have matching parameter types
                var referenceParameterTypes = referenceType.parameterTypes || [];
                var proposedParameterTypes = proposedType.parameterTypes;
                if (!_.isEqual(referenceParameterTypes, proposedParameterTypes)) {
                    appendProblem("".concat(typeName, " parameter types changed from [").concat(referenceParameterTypes.join(', '), "] to [").concat(proposedParameterTypes.join(', '), "]. This may or may not \n          be a breaking change, but we are reporting it just in case."));
                }
                // This check assumes that each API will be of a version that has metadataDefaults
                if (referenceAPI.version && proposedAPI.version) {
                    // Check whether the default values have changed. See https://github.com/phetsims/phet-io/issues/1753
                    var referenceDefaults_1 = referenceAPI.phetioTypes[typeName].metadataDefaults;
                    var proposedDefaults_1 = proposedAPI.phetioTypes[typeName].metadataDefaults;
                    if (!!referenceDefaults_1 !== !!proposedDefaults_1) {
                        appendProblem("".concat(typeName, " metadata defaults not found from \"").concat(JSON.stringify(referenceDefaults_1), "\" to \n\"").concat(JSON.stringify(proposedDefaults_1), "\". This may or may not be a breaking change, but we are reporting it just in case."));
                    }
                    else if (referenceDefaults_1 && proposedDefaults_1) {
                        Object.keys(referenceDefaults_1).forEach(function (key) {
                            if (referenceDefaults_1[key] !== proposedDefaults_1[key]) {
                                appendProblem("".concat(typeName, " metadata value ").concat(key, " changed from \"").concat(referenceDefaults_1[key], "\" to \"").concat(proposedDefaults_1[key], "\". This may or may not be a breaking change, but we are reporting it just in case."));
                            }
                        });
                    }
                }
            }
        }
    };
    // Check for: missing IOTypes, missing methods, or differing parameter types or return types
    for (var typeName in referenceAPI.phetioTypes) {
        _loop_1(typeName);
    }
    return {
        breakingProblems: breakingProblems,
        designedProblems: designedProblems
    };
};
var apiSupportsAPIStateKeys = function (api) { return api.version && api.version.major >= 1 && api.version.minor >= 1; };
// used to "up-convert" an old versioned API to the new (version >=1), structured tree API.
phetioCompareAPIs.toStructuredTree = toStructuredTree;
exports.default = phetioCompareAPIs;
