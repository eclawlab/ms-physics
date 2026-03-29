"use strict";
// Copyright 2022-2025, University of Colorado Boulder
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
/**
 * An instrumented class that wraps a function that does "work" that needs to be interoperable with PhET-iO.
 * PhetioAction supports the following features:
 *
 * 1. Data stream support: The function will be wrapped in an `executed` event and added to the data stream, nesting
 * subsequent events the action's "work" cascades to as child events.
 * 2. Interopererability: PhetioActionIO supports the `execute` method so that PhetioAction instances can be executed
 * from the PhET-iO wrapper.
 * 3. It also has an emitter if you want to listen to when the action is done doing its work, https://github.com/phetsims/phet-io/issues/1543
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var Emitter_js_1 = require("../../axon/js/Emitter.js");
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var IOTypeCache_js_1 = require("./IOTypeCache.js");
var PhetioDataHandler_js_1 = require("./PhetioDataHandler.js");
var PhetioObject_js_1 = require("./PhetioObject.js");
var Tandem_js_1 = require("./Tandem.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var ArrayIO_js_1 = require("./types/ArrayIO.js");
var IOType_js_1 = require("./types/IOType.js");
var NullableIO_js_1 = require("./types/NullableIO.js");
var StringIO_js_1 = require("./types/StringIO.js");
var VoidIO_js_1 = require("./types/VoidIO.js");
var EMPTY_ARRAY = [];
// By default, PhetioActions are not stateful
var PHET_IO_STATE_DEFAULT = false;
var PhetioAction = /** @class */ (function (_super) {
    __extends(PhetioAction, _super);
    /**
     * @param action - the function that is called when this PhetioAction occurs
     * @param providedOptions
     */
    function PhetioAction(action, providedOptions) {
        var _this = this;
        var _a;
        var options = (0, optionize_js_1.default)()({
            // We need to define this here in addition to PhetioDataHandler to pass to executedEmitter
            parameters: EMPTY_ARRAY,
            // PhetioDataHandler
            phetioOuterType: PhetioAction.PhetioActionIO,
            // PhetioObject
            phetioState: PHET_IO_STATE_DEFAULT,
            phetioReadOnly: PhetioObject_js_1.default.DEFAULT_OPTIONS.phetioReadOnly,
            phetioHighFrequency: PhetioObject_js_1.default.DEFAULT_OPTIONS.phetioHighFrequency,
            phetioEventType: PhetioObject_js_1.default.DEFAULT_OPTIONS.phetioEventType,
            phetioDocumentation: 'A class that wraps a function, adding API to execute that function and data stream capture.'
        }, providedOptions);
        _this = _super.call(this, options) || this;
        _this.action = action;
        _this.isExecutingCount = 0;
        _this.disposeOnExecuteCompletion = false;
        _this.executedEmitter = new Emitter_js_1.default({
            parameters: options.parameters,
            tandem: (_a = options.tandem) === null || _a === void 0 ? void 0 : _a.createTandem('executedEmitter'),
            hasListenerOrderDependencies: options.hasListenerOrderDependencies,
            phetioState: options.phetioState,
            phetioReadOnly: options.phetioReadOnly,
            phetioHighFrequency: options.phetioHighFrequency,
            phetioEventType: options.phetioEventType,
            phetioDocumentation: 'Emitter that emits when this actions work is complete'
        });
        _this.disposePhetioAction = function () {
            _this.executedEmitter.dispose();
        };
        return _this;
    }
    /**
     * Invokes the action.
     * @params - expected parameters are based on options.parameters, see constructor
     */
    PhetioAction.prototype.execute = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        assert && assert(!this.isDisposed, 'should not be called if disposed');
        // We delay the disposal of composed entities to handle reentrant cases of disposing ourself.
        assert && assert(!this.executedEmitter.isDisposed, 'self should not be disposed');
        this.isExecutingCount++;
        assert && _super.prototype.validateArguments.apply(this, args);
        // Although this is not the idiomatic pattern (since it is guarded in the phetioStartEvent), this function is
        // called so many times that it is worth the optimization for PhET brand.
        Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioStartEvent('executed', {
            data: this.getPhetioData.apply(this, args)
        });
        this.action.apply(null, args);
        (_a = this.executedEmitter).emit.apply(_a, args);
        Tandem_js_1.default.PHET_IO_ENABLED && this.isPhetioInstrumented() && this.phetioEndEvent();
        this.isExecutingCount--;
        if (this.disposeOnExecuteCompletion && this.isExecutingCount === 0) {
            this.disposePhetioAction();
            this.disposeOnExecuteCompletion = false;
        }
    };
    /**
     * Note: Be careful about adding disposal logic directly to this function, it is likely preferred to add it to
     * disposePhetioAction instead, see disposeOnExecuteCompletion for details.
     */
    PhetioAction.prototype.dispose = function () {
        if (this.isExecutingCount > 0) {
            // Defer disposing components until executing is completed, see disposeOnExecuteCompletion.
            this.disposeOnExecuteCompletion = true;
        }
        else {
            this.disposePhetioAction();
        }
        // Always dispose the object itself, or PhetioObject will assert out.
        _super.prototype.dispose.call(this);
    };
    PhetioAction.PhetioActionIO = function (parameterTypes) {
        var key = parameterTypes.map(getTypeName).join(',');
        if (!cache.has(key)) {
            cache.set(key, new IOType_js_1.default("PhetioActionIO<".concat(parameterTypes.map(getTypeName).join(', '), ">"), {
                valueType: PhetioAction,
                documentation: 'Executes when an event occurs',
                events: ['executed'],
                parameterTypes: parameterTypes,
                metadataDefaults: {
                    phetioState: PHET_IO_STATE_DEFAULT
                },
                methods: {
                    execute: {
                        returnType: VoidIO_js_1.default,
                        parameterTypes: parameterTypes,
                        implementation: function () {
                            var values = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                values[_i] = arguments[_i];
                            }
                            this.execute.apply(this, values);
                        },
                        documentation: 'Executes the function the PhetioAction is wrapping.',
                        invocableForReadOnlyElements: false
                    },
                    getValidationErrors: {
                        returnType: (0, ArrayIO_js_1.default)((0, NullableIO_js_1.default)(StringIO_js_1.default)),
                        parameterTypes: parameterTypes,
                        implementation: function () {
                            var values = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                values[_i] = arguments[_i];
                            }
                            return this.getValidationErrors.apply(this, values);
                        },
                        documentation: 'Checks to see if the proposed values are valid. Returns an array of length N where each element is an error (string) or null if the value is valid.'
                    }
                }
            }));
        }
        return cache.get(key);
    };
    return PhetioAction;
}(PhetioDataHandler_js_1.default));
var getTypeName = function (ioType) { return ioType.typeName; };
// cache each parameterized IOType so that it is only created once.
var cache = new IOTypeCache_js_1.default();
tandemNamespace_js_1.default.register('PhetioAction', PhetioAction);
exports.default = PhetioAction;
