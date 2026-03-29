"use strict";
// Copyright 2017-2025, University of Colorado Boulder
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
exports.LinkedElement = exports.default = void 0;
/**
 * Base type that provides PhET-iO features. An instrumented PhetioObject is referred to on the wrapper side/design side
 * as a "PhET-iO Element".  Note that sims may have hundreds or thousands of PhetioObjects, so performance and memory
 * considerations are important.  For this reason, initializePhetioObject is only called in PhET-iO brand, which means
 * many of the getters such as `phetioState` and `phetioDocumentation` will not work in other brands. We have opted
 * to have these getters throw assertion errors in other brands to help identify problems if these are called
 * unexpectedly.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var animationFrameTimer_js_1 = require("../../axon/js/animationFrameTimer.js");
var Disposable_js_1 = require("../../axon/js/Disposable.js");
var validate_js_1 = require("../../axon/js/validate.js");
var arrayRemove_js_1 = require("../../phet-core/js/arrayRemove.js");
var assertMutuallyExclusiveOptions_js_1 = require("../../phet-core/js/assertMutuallyExclusiveOptions.js");
var merge_js_1 = require("../../phet-core/js/merge.js");
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var EventType_js_1 = require("./EventType.js");
var LinkedElementIO_js_1 = require("./LinkedElementIO.js");
var PhetioIDUtils_js_1 = require("./PhetioIDUtils.js");
var Tandem_js_1 = require("./Tandem.js");
var TandemConstants_js_1 = require("./TandemConstants.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var IOType_js_1 = require("./types/IOType.js");
// constants
var PHET_IO_ENABLED = Tandem_js_1.default.PHET_IO_ENABLED;
var IO_TYPE_VALIDATOR = { valueType: IOType_js_1.default, validationMessage: 'phetioType must be an IOType' };
var BOOLEAN_VALIDATOR = { valueType: 'boolean' };
// use "<br>" instead of newlines
var PHET_IO_DOCUMENTATION_VALIDATOR = {
    valueType: 'string',
    isValidValue: function (doc) { return !doc.includes('\n'); },
    validationMessage: 'phetioDocumentation must be provided in the right format'
};
var PHET_IO_EVENT_TYPE_VALIDATOR = {
    valueType: EventType_js_1.default,
    validationMessage: 'invalid phetioEventType'
};
var OBJECT_VALIDATOR = { valueType: [Object, null] };
var objectToPhetioID = function (phetioObject) { return phetioObject.tandem.phetioID; };
// When an event is suppressed from the data stream, we keep track of it with this token.
var SKIPPING_MESSAGE = -1;
var DEFAULTS = {
    tandem: Tandem_js_1.default.OPTIONAL, // Subtypes can use `Tandem.REQUIRED` to require a named tandem passed in
    phetioType: IOType_js_1.default.ObjectIO,
    phetioDocumentation: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDocumentation,
    phetioState: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioState,
    phetioReadOnly: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioReadOnly,
    phetioEventType: EventType_js_1.default.MODEL,
    phetioHighFrequency: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioHighFrequency,
    phetioPlayback: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioPlayback,
    phetioFeatured: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioFeatured,
    phetioDynamicElement: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDynamicElement,
    phetioDesigned: TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioDesigned,
    phetioEventMetadata: null,
    tandemNameSuffix: null
};
assert && assert(EventType_js_1.default.phetioType.toStateObject(DEFAULTS.phetioEventType) === TandemConstants_js_1.default.PHET_IO_OBJECT_METADATA_DEFAULTS.phetioEventType, 'phetioEventType must have the same default as the default metadata values.');
var PhetioObject = /** @class */ (function (_super) {
    __extends(PhetioObject, _super);
    function PhetioObject(options) {
        var _this = _super.call(this) || this;
        _this.tandem = DEFAULTS.tandem;
        _this.phetioID = _this.tandem.phetioID;
        _this.phetioObjectInitialized = false;
        if (options) {
            _this.initializePhetioObject({}, options);
        }
        return _this;
    }
    /**
     * Like SCENERY/Node, PhetioObject can be configured during construction or later with a mutate call.
     * Noop if provided options keys don't intersect with any key in DEFAULTS; baseOptions are ignored for this calculation.
     */
    PhetioObject.prototype.initializePhetioObject = function (baseOptions, providedOptions) {
        var _this = this;
        assert && assert(!baseOptions.hasOwnProperty('isDisposable'), 'baseOptions should not contain isDisposable');
        this.initializeDisposable(providedOptions);
        assert && assert(providedOptions, 'initializePhetioObject must be called with providedOptions');
        // call before we exit early to support logging unsupplied Tandems.
        providedOptions.tandem && Tandem_js_1.default.onMissingTandem(providedOptions.tandem);
        // Make sure that required tandems are supplied
        if (assert && Tandem_js_1.default.VALIDATION && providedOptions.tandem && providedOptions.tandem.required) {
            assert(providedOptions.tandem.supplied, 'required tandems must be supplied');
        }
        // The presence of `tandem` indicates if this PhetioObject can be initialized. If not yet initialized, perhaps
        // it will be initialized later on, as in Node.mutate().
        if (!(PHET_IO_ENABLED && providedOptions.tandem && providedOptions.tandem.supplied)) {
            // In this case, the PhetioObject is not initialized, but still set tandem to maintain a consistent API for
            // creating the Tandem tree.
            if (providedOptions.tandem) {
                this.tandem = providedOptions.tandem;
                this.phetioID = this.tandem.phetioID;
            }
            return;
        }
        assert && assert(!this.phetioObjectInitialized, 'cannot initialize twice');
        // Guard validation on assert to avoid calling a large number of no-ops when assertions are disabled, see https://github.com/phetsims/tandem/issues/200
        assert && (0, validate_js_1.default)(providedOptions.tandem, { valueType: Tandem_js_1.default });
        var defaults = (0, optionize_js_1.combineOptions)({}, DEFAULTS, baseOptions);
        var options = (0, optionize_js_1.default)()(defaults, providedOptions);
        // validate options before assigning to properties
        assert && (0, validate_js_1.default)(options.phetioType, IO_TYPE_VALIDATOR);
        assert && (0, validate_js_1.default)(options.phetioState, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioState must be a boolean' }));
        assert && (0, validate_js_1.default)(options.phetioReadOnly, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioReadOnly must be a boolean' }));
        assert && (0, validate_js_1.default)(options.phetioEventType, PHET_IO_EVENT_TYPE_VALIDATOR);
        assert && (0, validate_js_1.default)(options.phetioDocumentation, PHET_IO_DOCUMENTATION_VALIDATOR);
        assert && (0, validate_js_1.default)(options.phetioHighFrequency, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioHighFrequency must be a boolean' }));
        assert && (0, validate_js_1.default)(options.phetioPlayback, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioPlayback must be a boolean' }));
        assert && (0, validate_js_1.default)(options.phetioFeatured, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioFeatured must be a boolean' }));
        assert && (0, validate_js_1.default)(options.phetioEventMetadata, (0, merge_js_1.default)({}, OBJECT_VALIDATOR, { validationMessage: 'object literal expected' }));
        assert && (0, validate_js_1.default)(options.phetioDynamicElement, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioDynamicElement must be a boolean' }));
        assert && (0, validate_js_1.default)(options.phetioDesigned, (0, merge_js_1.default)({}, BOOLEAN_VALIDATOR, { validationMessage: 'phetioDesigned must be a boolean' }));
        assert && assert(this.linkedElements !== null, 'this means addLinkedElement was called before instrumentation of this PhetioObject');
        // optional - Indicates that an object is a archetype for a dynamic class. Settable only by
        // PhetioEngine and by classes that create dynamic elements when creating their archetype (like PhetioGroup) through
        // PhetioObject.markDynamicElementArchetype().
        // if true, items will be excluded from phetioState. This applies recursively automatically.
        this.phetioIsArchetype = false;
        // (phetioEngine)
        // Store the full baseline for usage in validation or for usage in studio.  Do this before applying overrides. The
        // baseline is created when a sim is run with assertions to assist in phetioAPIValidation.  However, even when
        // assertions are disabled, some wrappers such as studio need to generate the baseline anyway.
        // not all metadata are passed through via options, so store baseline for these additional properties
        this.phetioBaselineMetadata = (Tandem_js_1.default.apiValidationEnabled || phet.preloads.phetio.queryParameters.phetioEmitAPIBaseline) ?
            this.getMetadata((0, merge_js_1.default)({
                phetioIsArchetype: this.phetioIsArchetype,
                phetioArchetypePhetioID: this.phetioArchetypePhetioID
            }, options)) :
            null;
        // Dynamic elements should compare to their "archetypal" counterparts.  For example, this means that a Particle
        // in a PhetioGroup will take its overrides from the PhetioGroup archetype.
        var archetypalPhetioID = options.tandem.getArchetypalPhetioID();
        // Overrides are only defined for simulations, not for unit tests.  See https://github.com/phetsims/phet-io/issues/1461
        // Patch in the desired values from overrides, if any.
        if (window.phet.preloads.phetio.phetioElementsOverrides) {
            var overrides = window.phet.preloads.phetio.phetioElementsOverrides[archetypalPhetioID];
            if (overrides) {
                // No need to make a new object, since this "options" variable was created in the previous merge call above.
                options = (0, optionize_js_1.default)()(options, overrides);
            }
        }
        // (read-only) see docs at DEFAULTS declaration
        this.tandem = options.tandem;
        this.phetioID = this.tandem.phetioID;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioType = options.phetioType;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioState = options.phetioState;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioReadOnly = options.phetioReadOnly;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioDocumentation = options.phetioDocumentation;
        // see docs at DEFAULTS declaration
        this._phetioEventType = options.phetioEventType;
        // see docs at DEFAULTS declaration
        this._phetioHighFrequency = options.phetioHighFrequency;
        // see docs at DEFAULTS declaration
        this._phetioPlayback = options.phetioPlayback;
        // (PhetioEngine) see docs at DEFAULTS declaration - in order to recursively pass this value to
        // children, the setPhetioDynamicElement() function must be used instead of setting this attribute directly
        this._phetioDynamicElement = options.phetioDynamicElement;
        // (read-only) see docs at DEFAULTS declaration
        this._phetioFeatured = options.phetioFeatured;
        this._phetioEventMetadata = options.phetioEventMetadata;
        this._phetioDesigned = options.phetioDesigned;
        // for phetioDynamicElements, the corresponding phetioID for the element in the archetype subtree
        this.phetioArchetypePhetioID = null;
        //keep track of LinkedElements for disposal. Null out to support asserting on
        // edge error cases, see this.addLinkedElement()
        this.linkedElements = [];
        // (phet-io) set to true when this PhetioObject has been sent over to the parent.
        this.phetioNotifiedObjectCreated = false;
        // tracks the indices of started messages so that dataStream can check that ends match starts.
        this.phetioMessageStack = [];
        // Make sure playback shows in the phetioEventMetadata
        if (this._phetioPlayback) {
            this._phetioEventMetadata = this._phetioEventMetadata || {};
            assert && assert(!this._phetioEventMetadata.hasOwnProperty('playback'), 'phetioEventMetadata.playback should not already exist');
            this._phetioEventMetadata.playback = true;
        }
        // Alert that this PhetioObject is ready for cross-frame communication (thus becoming a "PhET-iO Element" on the wrapper side.
        this.tandem.addPhetioObject(this);
        this.phetioObjectInitialized = true;
        if (assert && Tandem_js_1.default.VALIDATION && this.isPhetioInstrumented() && options.tandemNameSuffix) {
            var suffixArray = Array.isArray(options.tandemNameSuffix) ? options.tandemNameSuffix : [options.tandemNameSuffix];
            var matches = suffixArray.filter(function (suffix) {
                return _this.tandem.name.endsWith(suffix) ||
                    _this.tandem.name.endsWith(PhetioObject.swapCaseOfFirstCharacter(suffix));
            });
            assert && assert(matches.length > 0, 'Incorrect Tandem suffix, expected = ' + suffixArray.join(', ') + '. actual = ' + this.tandem.phetioID);
        }
    };
    PhetioObject.swapCaseOfFirstCharacter = function (string) {
        var firstChar = string[0];
        var newFirstChar = firstChar === firstChar.toLowerCase() ? firstChar.toUpperCase() : firstChar.toLowerCase();
        return newFirstChar + string.substring(1);
    };
    Object.defineProperty(PhetioObject.prototype, "phetioType", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioType only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioState", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioState only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioState;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioReadOnly", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioReadOnly only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioReadOnly;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioDocumentation", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDocumentation only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioDocumentation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioEventType", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventType only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioEventType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioHighFrequency", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioHighFrequency only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioHighFrequency;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioPlayback", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioPlayback only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioPlayback;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioDynamicElement", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDynamicElement only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioDynamicElement;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioFeatured", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioFeatured only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioFeatured;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioEventMetadata", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioEventMetadata only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioEventMetadata;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PhetioObject.prototype, "phetioDesigned", {
        // throws an assertion error in brands other than PhET-iO
        get: function () {
            assert && assert(PHET_IO_ENABLED && this.isPhetioInstrumented(), 'phetioDesigned only accessible for instrumented objects in PhET-iO brand.');
            return this._phetioDesigned;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Start an event for the nested PhET-iO data stream.
     *
     * @param event - the name of the event
     * @param [providedOptions]
     */
    PhetioObject.prototype.phetioStartEvent = function (event, providedOptions) {
        if (PHET_IO_ENABLED && this.isPhetioInstrumented()) {
            // only one or the other can be provided
            assert && (0, assertMutuallyExclusiveOptions_js_1.default)(providedOptions, ['data'], ['getData']);
            var options = (0, optionize_js_1.default)()({
                data: null,
                // function that, when called gets the data.
                getData: null
            }, providedOptions);
            assert && assert(this.phetioObjectInitialized, 'phetioObject should be initialized');
            assert && options.data && assert(typeof options.data === 'object');
            assert && options.getData && assert(typeof options.getData === 'function');
            assert && assert(arguments.length === 1 || arguments.length === 2, 'Prevent usage of incorrect signature');
            // TODO: don't drop PhET-iO events if they are created before we have a dataStream global. https://github.com/phetsims/phet-io/issues/1875
            if (!_.hasIn(window, 'phet.phetio.dataStream')) {
                // If you hit this, then it is likely related to https://github.com/phetsims/scenery/issues/1124 and we would like to know about it!
                // assert && assert( false, 'trying to create an event before the data stream exists' );
                this.phetioMessageStack.push(SKIPPING_MESSAGE);
                return;
            }
            // Opt out of certain events if queryParameter override is provided. Even for a low frequency data stream, high
            // frequency events can still be emitted when they have a low frequency ancestor.
            var skipHighFrequencyEvent = this.phetioHighFrequency &&
                _.hasIn(window, 'phet.preloads.phetio.queryParameters') &&
                !window.phet.preloads.phetio.queryParameters.phetioEmitHighFrequencyEvents &&
                !phet.phetio.dataStream.isEmittingLowFrequencyEvent();
            // TODO: If there is no dataStream global defined, then we should handle this differently as to not drop the event that is triggered, see https://github.com/phetsims/phet-io/issues/1846
            var skipFromUndefinedDatastream = !_.hasIn(window, 'phet.phetio.dataStream');
            if (assert) {
                skipFromUndefinedDatastream = false;
            }
            if (skipHighFrequencyEvent || this.phetioEventType === EventType_js_1.default.OPT_OUT || skipFromUndefinedDatastream) {
                this.phetioMessageStack.push(SKIPPING_MESSAGE);
                return;
            }
            // Only get the args if we are actually going to send the event.
            var data = options.getData ? options.getData() : options.data;
            this.phetioMessageStack.push(phet.phetio.dataStream.start(this.phetioEventType, this.tandem.phetioID, this.phetioType, event, data, this.phetioEventMetadata, this.phetioHighFrequency));
            // To support PhET-iO playback, any potential playback events downstream of this playback event must be marked as
            // non playback events. This is to prevent the PhET-iO playback engine from repeating those events. See
            // https://github.com/phetsims/phet-io/issues/1693
            this.phetioPlayback && phet.phetio.dataStream.pushNonPlaybackable();
        }
    };
    /**
     * End an event on the nested PhET-iO data stream. It this object was disposed or dataStream.start was not called,
     * this is a no-op.
     */
    PhetioObject.prototype.phetioEndEvent = function (assertCorrectIndices) {
        if (assertCorrectIndices === void 0) { assertCorrectIndices = false; }
        if (PHET_IO_ENABLED && this.isPhetioInstrumented()) {
            assert && assert(this.phetioMessageStack.length > 0, 'Must have messages to pop');
            var topMessageIndex = this.phetioMessageStack.pop();
            // The message was started as a high frequency event to be skipped, so the end is a no-op
            if (topMessageIndex === SKIPPING_MESSAGE) {
                return;
            }
            this.phetioPlayback && phet.phetio.dataStream.popNonPlaybackable();
            phet.phetio.dataStream.end(topMessageIndex, assertCorrectIndices);
        }
    };
    /**
     * Set any instrumented descendants of this PhetioObject to the same value as this.phetioDynamicElement.
     */
    PhetioObject.prototype.propagateDynamicFlagsToDescendants = function () {
        var _this = this;
        assert && assert(Tandem_js_1.default.PHET_IO_ENABLED, 'phet-io should be enabled');
        assert && assert(phet.phetio && phet.phetio.phetioEngine, 'Dynamic elements cannot be created statically before phetioEngine exists.');
        var phetioEngine = phet.phetio.phetioEngine;
        // in the same order as bufferedPhetioObjects
        var unlaunchedPhetioIDs = !Tandem_js_1.default.launched ? Tandem_js_1.default.bufferedPhetioObjects.map(objectToPhetioID) : [];
        this.tandem.iterateDescendants(function (tandem) {
            var phetioID = tandem.phetioID;
            if (phetioEngine.hasPhetioObject(phetioID) || (!Tandem_js_1.default.launched && unlaunchedPhetioIDs.includes(phetioID))) {
                assert && assert(_this.isPhetioInstrumented());
                var phetioObject = phetioEngine.hasPhetioObject(phetioID) ? phetioEngine.getPhetioElement(phetioID) :
                    Tandem_js_1.default.bufferedPhetioObjects[unlaunchedPhetioIDs.indexOf(phetioID)];
                assert && assert(phetioObject, 'should have a phetioObject here');
                // Order matters here! The phetioIsArchetype needs to be first to ensure that the setPhetioDynamicElement
                // setter can opt out for archetypes.
                phetioObject.phetioIsArchetype = _this.phetioIsArchetype;
                phetioObject.setPhetioDynamicElement(_this.phetioDynamicElement);
                if (phetioObject.phetioBaselineMetadata) {
                    phetioObject.phetioBaselineMetadata.phetioIsArchetype = _this.phetioIsArchetype;
                }
            }
        });
    };
    /**
     * Used in PhetioEngine
     */
    PhetioObject.prototype.setPhetioDynamicElement = function (phetioDynamicElement) {
        assert && assert(!this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.');
        assert && assert(this.isPhetioInstrumented());
        // All archetypes are static (non-dynamic)
        this._phetioDynamicElement = this.phetioIsArchetype ? false : phetioDynamicElement;
        // For dynamic elements, indicate the corresponding archetype element so that clients like Studio can leverage
        // the archetype metadata. Static elements don't have archetypes.
        this.phetioArchetypePhetioID = phetioDynamicElement ? this.tandem.getArchetypalPhetioID() : null;
        // Keep the baseline metadata in sync.
        if (this.phetioBaselineMetadata) {
            this.phetioBaselineMetadata.phetioDynamicElement = this.phetioDynamicElement;
        }
    };
    /**
     * Mark this PhetioObject as an archetype for dynamic elements.
     */
    PhetioObject.prototype.markDynamicElementArchetype = function () {
        assert && assert(!this.phetioNotifiedObjectCreated, 'should not change dynamic element flags after notifying this PhetioObject\'s creation.');
        this.phetioIsArchetype = true;
        this.setPhetioDynamicElement(false); // because archetypes aren't dynamic elements
        if (this.phetioBaselineMetadata) {
            this.phetioBaselineMetadata.phetioIsArchetype = this.phetioIsArchetype;
        }
        // recompute for children also, but only if phet-io is enabled
        Tandem_js_1.default.PHET_IO_ENABLED && this.propagateDynamicFlagsToDescendants();
    };
    /**
     * A PhetioObject will only be instrumented if the tandem that was passed in was "supplied". See Tandem.supplied
     * for more info.
     */
    PhetioObject.prototype.isPhetioInstrumented = function () {
        return this.tandem && this.tandem.supplied;
    };
    // Some PhetioObject forward to another by composition for PhET-iO support. For instance, FluentConstant forwards to
    // a PhET-iO instrumented LocalizedStringProperty, which is instrumented by default.
    PhetioObject.prototype.hasTargetProperty = function () { return false; };
    /**
     * When an instrumented PhetioObject is linked with another instrumented PhetioObject, this creates a one-way
     * association which is rendered in Studio as a "symbolic" link or hyperlink. Many common code UI elements use this
     * automatically. To keep client sites simple, this has a graceful opt-out mechanism which makes this function a
     * no-op if either this PhetioObject or the target PhetioObject is not instrumented.
     *
     * You can specify the tandem one of three ways:
     * 1. Without specifying tandemName or tandem, it will pluck the tandem.name from the target element
     * 2. If tandemName is specified in the options, it will use that tandem name and nest the tandem under this PhetioObject's tandem
     * 3. If tandem is specified in the options (not recommended), it will use that tandem and nest it anywhere that tandem exists.
     *    Use this option with caution since it allows you to nest the tandem anywhere in the tree.
     *
     * @param element - the target element. Must be instrumented for a LinkedElement to be created-- otherwise gracefully opts out
     * @param [providedOptions]
     */
    PhetioObject.prototype.addLinkedElement = function (element, providedOptions) {
        // For elements that delegate PhET-iO responsibility to a target property, substitute the target for the element.
        // This is used in cases like FluentConstant, where the target is a PhET-iO instrumented LocalizedStringProperty.
        if (element.hasTargetProperty()) {
            element = element.targetProperty;
        }
        if (!this.isPhetioInstrumented()) {
            // set this to null so that you can't addLinkedElement on an uninitialized PhetioObject and then instrument
            // it afterward.
            this.linkedElements = null;
            return;
        }
        // In some cases, UI components need to be wired up to a private (internal) Property which should neither be
        // instrumented nor linked.
        if (PHET_IO_ENABLED && element.isPhetioInstrumented()) {
            var options = (0, optionize_js_1.default)()({}, providedOptions);
            assert && assert(Array.isArray(this.linkedElements), 'linkedElements should be an array');
            var tandem = null;
            if (providedOptions && providedOptions.tandem) {
                tandem = providedOptions.tandem;
            }
            else if (providedOptions && providedOptions.tandemName) {
                tandem = this.tandem.createTandem(providedOptions.tandemName);
            }
            else if (!providedOptions && element.tandem) {
                tandem = this.tandem.createTandem(element.tandem.name);
            }
            if (tandem) {
                options.tandem = tandem;
            }
            this.linkedElements.push(new LinkedElement(element, options));
        }
    };
    /**
     * Remove all linked elements linking to the provided PhetioObject. This will dispose all removed LinkedElements. This
     * will be graceful, and doesn't assume or assert that the provided PhetioObject has LinkedElement(s), it will just
     * remove them if they are there.
     */
    PhetioObject.prototype.removeLinkedElements = function (potentiallyLinkedElement) {
        var _this = this;
        if (this.isPhetioInstrumented() && this.linkedElements) {
            assert && assert(potentiallyLinkedElement.isPhetioInstrumented());
            var toRemove = this.linkedElements.filter(function (linkedElement) { return linkedElement.element === potentiallyLinkedElement; });
            toRemove.forEach(function (linkedElement) {
                linkedElement.dispose();
                (0, arrayRemove_js_1.default)(_this.linkedElements, linkedElement);
            });
        }
    };
    /**
     * Performs cleanup after the sim's construction has finished.
     */
    PhetioObject.prototype.onSimulationConstructionCompleted = function () {
        // deletes the phetioBaselineMetadata, as it's no longer needed since validation is complete.
        this.phetioBaselineMetadata = null;
    };
    /**
     * Overrideable so that subclasses can return a different PhetioObject for studio autoselect. This method is called
     * when there is a scene graph hit. Return the corresponding target that matches the PhET-iO filters.  Note this means
     * that if PhET-iO Studio is looking for a featured item and this is not featured, it will return 'phetioNotSelectable'.
     * Something is 'phetioNotSelectable' if it is not instrumented or if it does not match the "featured" filtering.
     *
     * The `fromLinking` flag allows a cutoff to prevent recursive linking chains in 'linked' mode. Given these linked elements:
     * cardNode -> card -> cardValueProperty
     * We don't want 'linked' mode to map from cardNode all the way to cardValueProperty (at least automatically), see https://github.com/phetsims/tandem/issues/300
     */
    PhetioObject.prototype.getPhetioMouseHitTarget = function (fromLinking) {
        if (fromLinking === void 0) { fromLinking = false; }
        assert && assert(phet.tandem.phetioElementSelectionProperty.value !== 'none', 'getPhetioMouseHitTarget should not be called when phetioElementSelectionProperty is none');
        // Don't get a linked element for a linked element (recursive link element searching)
        if (!fromLinking && phet.tandem.phetioElementSelectionProperty.value === 'linked') {
            var linkedElement = this.getCorrespondingLinkedElement();
            if (linkedElement !== 'noCorrespondingLinkedElement') {
                return linkedElement.getPhetioMouseHitTarget(true);
            }
            else if (this.tandem.parentTandem) {
                // Look for a sibling linkedElement if there are no child linkages, see https://github.com/phetsims/studio/issues/246#issuecomment-1018733408
                var parent_1 = phet.phetio.phetioEngine.phetioElementMap[this.tandem.parentTandem.phetioID];
                if (parent_1) {
                    var linkedParentElement = parent_1.getCorrespondingLinkedElement();
                    if (linkedParentElement !== 'noCorrespondingLinkedElement') {
                        return linkedParentElement.getPhetioMouseHitTarget(true);
                    }
                }
            }
            // Otherwise fall back to the view element, don't return here
        }
        if (phet.tandem.phetioElementSelectionProperty.value === 'string') {
            return 'phetioNotSelectable';
        }
        return this.getPhetioMouseHitTargetSelf();
    };
    /**
     * Determine if this instance should be selectable
     */
    PhetioObject.prototype.getPhetioMouseHitTargetSelf = function () {
        return this.isPhetioMouseHitSelectable() ? this : 'phetioNotSelectable';
    };
    /**
     * Factored out function returning if this instance is phetio selectable
     */
    PhetioObject.prototype.isPhetioMouseHitSelectable = function () {
        // We are not selectable if we are unfeatured and we are only displaying featured elements.
        // To prevent a circular dependency. We need to have a Property (which is a PhetioObject) in order to use it.
        // This should remain a hard failure if we have not loaded this display Property by the time we want a mouse-hit target.
        var featuredFilterCorrect = phet.tandem.phetioElementsDisplayProperty.value !== 'featured' || this.isDisplayedInFeaturedTree();
        return this.isPhetioInstrumented() && featuredFilterCorrect;
    };
    /**
     * This function determines not only if this PhetioObject is phetioFeatured, but if any descendant of this
     * PhetioObject is phetioFeatured, this will influence if this instance is displayed while showing phetioFeatured,
     * since featured children will cause the parent to be displayed as well.
     */
    PhetioObject.prototype.isDisplayedInFeaturedTree = function () {
        if (this.isPhetioInstrumented() && this.phetioFeatured) {
            return true;
        }
        var displayed = false;
        this.tandem.iterateDescendants(function (descendantTandem) {
            var parent = phet.phetio.phetioEngine.phetioElementMap[descendantTandem.phetioID];
            if (parent && parent.isPhetioInstrumented() && parent.phetioFeatured) {
                displayed = true;
            }
        });
        return displayed;
    };
    /**
     * Acquire the linkedElement that most closely relates to this PhetioObject, given some heuristics. First, if there is
     * only a single LinkedElement child, use that. Otherwise, select hard coded names that are likely to be most important.
     */
    PhetioObject.prototype.getCorrespondingLinkedElement = function () {
        var _this = this;
        var children = Object.keys(this.tandem.children);
        var linkedChildren = [];
        children.forEach(function (childName) {
            var childPhetioID = PhetioIDUtils_js_1.default.append(_this.tandem.phetioID, childName);
            // Note that if it doesn't find a phetioID, that may be a synthetic node with children but not itself instrumented.
            var phetioObject = phet.phetio.phetioEngine.phetioElementMap[childPhetioID];
            if (phetioObject instanceof LinkedElement) {
                linkedChildren.push(phetioObject);
            }
        });
        var linkedTandemNames = linkedChildren.map(function (linkedElement) {
            return PhetioIDUtils_js_1.default.getComponentName(linkedElement.phetioID);
        });
        var linkedChild = null;
        if (linkedChildren.length === 1) {
            linkedChild = linkedChildren[0];
        }
        else if (linkedTandemNames.includes('property')) {
            // Prioritize a linked child named "property"
            linkedChild = linkedChildren[linkedTandemNames.indexOf('property')];
        }
        else if (linkedTandemNames.includes('valueProperty')) {
            // Next prioritize "valueProperty", a common name for the controlling Property of a view component
            linkedChild = linkedChildren[linkedTandemNames.indexOf('valueProperty')];
        }
        else {
            // Either there are no linked children, or too many to know which one to select.
            return 'noCorrespondingLinkedElement';
        }
        assert && assert(linkedChild, 'phetioElement is needed');
        return linkedChild.element;
    };
    /**
     * Remove this phetioObject from PhET-iO. After disposal, this object is no longer interoperable. Also release any
     * other references created during its lifetime.
     *
     * In order to support the structured data stream, PhetioObjects must end the messages in the correct
     * sequence, without being interrupted by dispose() calls.  Therefore, we do not clear out any of the state
     * related to the endEvent.  Note this means it is acceptable (and expected) for endEvent() to be called on
     * disposed PhetioObjects.
     */
    PhetioObject.prototype.dispose = function () {
        var _this = this;
        // The phetioEvent stack should resolve by the next frame, so that's when we check it.
        if (assert && Tandem_js_1.default.PHET_IO_ENABLED && this.tandem.supplied) {
            var descendants_1 = [];
            this.tandem.iterateDescendants(function (tandem) {
                if (phet.phetio.phetioEngine.hasPhetioObject(tandem.phetioID)) {
                    descendants_1.push(phet.phetio.phetioEngine.getPhetioElement(tandem.phetioID));
                }
            });
            animationFrameTimer_js_1.default.runOnNextTick(function () {
                // Uninstrumented PhetioObjects don't have a phetioMessageStack attribute.
                assert && assert(!_this.hasOwnProperty('phetioMessageStack') || _this.phetioMessageStack.length === 0, 'phetioMessageStack should be clear');
                descendants_1.forEach(function (descendant) {
                    assert && assert(descendant.isDisposed, "All descendants must be disposed by the next frame: ".concat(descendant.tandem.phetioID));
                });
            });
        }
        // Detach from listeners and dispose the corresponding tandem. This must happen in PhET-iO brand and PhET brand
        // because in PhET brand, PhetioDynamicElementContainer dynamic elements would memory leak tandems (parent tandems
        // would retain references to their children).
        this.tandem.removePhetioObject(this);
        // Dispose LinkedElements
        if (this.linkedElements) {
            this.linkedElements.forEach(function (linkedElement) { return linkedElement.dispose(); });
            this.linkedElements.length = 0;
        }
        _super.prototype.dispose.call(this);
    };
    /**
     * JSONifiable metadata that describes the nature of the PhetioObject.  We must be able to read this
     * for baseline (before object fully constructed we use object) and after fully constructed
     * which includes overrides.
     * @param [object] - used to get metadata keys, can be a PhetioObject, or an options object
     *                          (see usage initializePhetioObject). If not provided, will instead use the value of "this"
     * @returns - metadata plucked from the passed in parameter
     */
    PhetioObject.prototype.getMetadata = function (object) {
        object = object || this;
        var metadata = {
            phetioTypeName: object.phetioType.typeName,
            phetioDocumentation: object.phetioDocumentation,
            phetioState: object.phetioState,
            phetioReadOnly: object.phetioReadOnly,
            phetioEventType: EventType_js_1.default.phetioType.toStateObject(object.phetioEventType),
            phetioHighFrequency: object.phetioHighFrequency,
            phetioPlayback: object.phetioPlayback,
            phetioDynamicElement: object.phetioDynamicElement,
            phetioIsArchetype: object.phetioIsArchetype,
            phetioFeatured: object.phetioFeatured,
            phetioDesigned: object.phetioDesigned
        };
        if (object.phetioArchetypePhetioID) {
            metadata.phetioArchetypePhetioID = object.phetioArchetypePhetioID;
        }
        return metadata;
    };
    PhetioObject.create = function (options) {
        return new PhetioObject(options);
    };
    PhetioObject.DEFAULT_OPTIONS = DEFAULTS;
    // Public facing documentation, no need to include metadata that may we don't want clients knowing about
    PhetioObject.METADATA_DOCUMENTATION = 'Get metadata about the PhET-iO Element. This includes the following keys:<ul>' +
        '<li><strong>phetioTypeName:</strong> The name of the PhET-iO Type\n</li>' +
        '<li><strong>phetioDocumentation:</strong> default - null. Useful notes about a PhET-iO Element, shown in the PhET-iO Studio Wrapper</li>' +
        '<li><strong>phetioState:</strong> default - true. When true, includes the PhET-iO Element in the PhET-iO state\n</li>' +
        '<li><strong>phetioReadOnly:</strong> default - false. When true, you can only get values from the PhET-iO Element; no setting allowed.\n</li>' +
        '<li><strong>phetioEventType:</strong> default - MODEL. The category of event that this element emits to the PhET-iO Data Stream.\n</li>' +
        '<li><strong>phetioDynamicElement:</strong> default - false. If this element is a "dynamic element" that can be created and destroyed throughout the lifetime of the sim (as opposed to existing forever).\n</li>' +
        '<li><strong>phetioIsArchetype:</strong> default - false. If this element is an archetype for a dynamic element.\n</li>' +
        '<li><strong>phetioFeatured:</strong> default - false. If this is a featured PhET-iO Element.\n</li>' +
        '<li><strong>phetioArchetypePhetioID:</strong> default - \'\'. If an applicable dynamic element, this is the phetioID of its archetype.\n</li></ul>';
    return PhetioObject;
}(Disposable_js_1.default));
exports.default = PhetioObject;
/**
 * Internal class to avoid cyclic dependencies.
 */
var LinkedElement = /** @class */ (function (_super) {
    __extends(LinkedElement, _super);
    function LinkedElement(coreElement, providedOptions) {
        var _this = this;
        assert && assert(!!coreElement, 'coreElement should be defined');
        var options = (0, optionize_js_1.default)()({
            phetioType: LinkedElementIO_js_1.default,
            phetioState: true,
            // By default, LinkedElements are as featured as their coreElements are.
            phetioFeatured: coreElement.phetioFeatured
        }, providedOptions);
        // References cannot be changed by PhET-iO
        assert && assert(!options.hasOwnProperty('phetioReadOnly'), 'phetioReadOnly set by LinkedElement');
        options.phetioReadOnly = true;
        _this = _super.call(this, options) || this;
        _this.element = coreElement;
        return _this;
    }
    return LinkedElement;
}(PhetioObject));
exports.LinkedElement = LinkedElement;
tandemNamespace_js_1.default.register('PhetioObject', PhetioObject);
