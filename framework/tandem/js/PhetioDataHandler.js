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
 * Helper type that supports a `parameters` member.
 * This is mostly useful for PhET-iO instrumented sub-class to use that takes a variable number of parameters in their
 * IOType. With this function you gain parameter validation, PhET-iO documentation, and data stream support.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var validate_js_1 = require("../../axon/js/validate.js");
var Validation_js_1 = require("../../axon/js/Validation.js");
var assertMutuallyExclusiveOptions_js_1 = require("../../phet-core/js/assertMutuallyExclusiveOptions.js");
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var PhetioObject_js_1 = require("./PhetioObject.js");
var Tandem_js_1 = require("./Tandem.js");
var tandemNamespace_js_1 = require("./tandemNamespace.js");
var VALIDATE_OPTIONS_FALSE = { validateValidator: false };
// Simulations have thousands of Emitters, so we re-use objects where possible.
var EMPTY_ARRAY = [];
assert && Object.freeze(EMPTY_ARRAY);
// Allowed keys to options.parameters, the parameters to emit.
var PARAMETER_KEYS = [
    'name', // required for phet-io instrumented Actions
    'phetioType', // required for phet-io instrumented Actions
    'phetioDocumentation', // optional, additional documentation for this specific parameter
    // Specify this to keep the parameter private to the PhET-iO API. To support emitting and executing over the PhET-iO
    // API, phetioPrivate parameters must not ever be before a public one. For example `emit1( public1, private1, public2)`
    // is not allowed. Instead, it must be ordered like `emit( public1, public2, private1 )`
    'phetioPrivate'
].concat(Validation_js_1.default.VALIDATOR_KEYS);
// helper closures
var paramToPhetioType = function (param) { return param.phetioType; };
var paramToName = function (param) { return param.name; };
var PhetioDataHandler = /** @class */ (function (_super) {
    __extends(PhetioDataHandler, _super);
    function PhetioDataHandler(providedOptions) {
        var _this = this;
        var _a;
        var options = (0, optionize_js_1.default)()({
            // SelfOptions
            parameters: EMPTY_ARRAY,
            hasListenerOrderDependencies: false,
            // phet-io - see PhetioObject.js for doc
            phetioPlayback: PhetioObject_js_1.default.DEFAULT_OPTIONS.phetioPlayback,
            phetioEventMetadata: PhetioObject_js_1.default.DEFAULT_OPTIONS.phetioEventMetadata,
            phetioDocumentation: ''
        }, providedOptions);
        assert && PhetioDataHandler.validateParameters(options.parameters, !!((_a = options.tandem) === null || _a === void 0 ? void 0 : _a.supplied));
        assert && assert(options.phetioType === undefined, 'PhetioDataHandler sets its own phetioType. Instead provide parameter phetioTypes through `options.parameters` with a phetioOuterType');
        // list of parameters, see options.parameters. Filter out phetioPrivate parameters, all `phetioPrivate`
        // parameters will not have a `phetioType`, see `validateParameters`.
        var phetioPublicParameters = options.parameters.filter(paramToPhetioType);
        options.phetioType = options.phetioOuterType(phetioPublicParameters.map(paramToPhetioType));
        // phetioPlayback events need to know the order the arguments occur in order to call EmitterIO.emit()
        // Indicate whether the event is for playback, but leave this "sparse"--only indicate when this happens to be true
        if (options.phetioPlayback) {
            options.phetioEventMetadata = options.phetioEventMetadata || {}; // phetioEventMetadata defaults to null
            assert && assert(!options.phetioEventMetadata.hasOwnProperty('dataKeys'), 'dataKeys should be supplied by PhetioDataHandler, not elsewhere');
            options.phetioEventMetadata.dataKeys = options.parameters.map(paramToName);
        }
        options.phetioDocumentation = PhetioDataHandler.getPhetioDocumentation(options.phetioDocumentation, phetioPublicParameters);
        _this = _super.call(this, options) || this;
        // Note: one test indicates stripping this out via assert && in builds may save around 300kb heap
        _this.parameters = options.parameters;
        return _this;
    }
    /**
     * @param parameters
     * @param tandemSupplied - proxy for whether the PhetioObject is instrumented.  We cannot call
     *                                 - PhetioObject.isPhetioInstrumented() until after the supercall, so we use this beforehand.
     */
    PhetioDataHandler.validateParameters = function (parameters, tandemSupplied) {
        // validate the parameters object
        (0, validate_js_1.default)(parameters, { valueType: Array });
        // PhetioDataHandler only supports phetioPrivate parameters at the end of the emit call, so once we hit the first phetioPrivate
        // parameter, then assert that the rest of them afterwards are as well.
        var reachedPhetioPrivate = false;
        // we must iterate from the first parameter to the last parameter to support phetioPrivate
        for (var i = 0; i < parameters.length; i++) {
            var parameter = parameters[i]; // metadata about a single parameter
            assert && assert(Object.getPrototypeOf(parameter) === Object.prototype, 'Extra prototype on parameter object is a code smell');
            reachedPhetioPrivate = reachedPhetioPrivate || parameter.phetioPrivate;
            assert && reachedPhetioPrivate && assert(parameter.phetioPrivate, 'after first phetioPrivate parameter, all subsequent parameters must be phetioPrivate');
            assert && tandemSupplied && Tandem_js_1.default.VALIDATION && assert(parameter.phetioType || parameter.phetioPrivate, 'instrumented Emitters must include phetioType for each parameter or be marked as `phetioPrivate`.');
            assert && parameter.phetioType && assert(parameter.name, '`name` is a required parameter for phet-io instrumented parameters.');
            assert && (0, assertMutuallyExclusiveOptions_js_1.default)(parameter, ['phetioPrivate'], [
                'name', 'phetioType', 'phetioDocumentation'
            ]);
            assert && assert(_.intersection(Object.keys(parameter), Validation_js_1.default.VALIDATOR_KEYS).length > 0, "validator must be specified for parameter ".concat(i));
            for (var key in parameter) {
                assert && assert(PARAMETER_KEYS.includes(key), "unrecognized parameter key: ".concat(key));
            }
            // Changing after construction indicates a logic error.
            assert && Object.freeze(parameters[i]);
            // validate the options passed in to validate each PhetioDataHandler argument
            Validation_js_1.default.validateValidator(parameter);
        }
        // Changing after construction indicates a logic error.
        assert && Object.freeze(parameters);
    };
    /**
     * Validate that provided args match the expected schema given via options.parameters.
     */
    PhetioDataHandler.prototype.validateArguments = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        assert && assert(args.length === this.parameters.length, "Emitted unexpected number of args. Expected: ".concat(this.parameters.length, " and received ").concat(args.length));
        for (var i = 0; i < this.parameters.length; i++) {
            var parameter = this.parameters[i];
            assert && (0, validate_js_1.default)(args[i], parameter, VALIDATE_OPTIONS_FALSE);
            // valueType overrides the phetioType validator so we don't use that one if there is a valueType
            if (parameter.phetioType && !parameter.valueType) {
                assert && (0, validate_js_1.default)(args[i], parameter.phetioType.validator, VALIDATE_OPTIONS_FALSE);
            }
        }
    };
    /**
     * Validate that provided args match the expected schema given via options.parameters.
     */
    PhetioDataHandler.prototype.getValidationErrors = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        assert && assert(args.length === this.parameters.length, "Emitted unexpected number of args. Expected: ".concat(this.parameters.length, " and received ").concat(args.length));
        return this.parameters.map(function (parameter, index) {
            return Validation_js_1.default.getValidationError(args[index], parameter, VALIDATE_OPTIONS_FALSE);
        });
    };
    /**
     * Gets the data that will be emitted to the PhET-iO data stream, for an instrumented simulation.
     * @returns the data, keys dependent on parameter metadata
     */
    PhetioDataHandler.prototype.getPhetioData = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        assert && assert(Tandem_js_1.default.PHET_IO_ENABLED, 'should only get phet-io data in phet-io brand');
        // null if there are no arguments. dataStream.js omits null values for data
        var data = null;
        if (this.parameters.length > 0) {
            // Enumerate named argsObject for the data stream.
            data = {};
            for (var i = 0; i < this.parameters.length; i++) {
                var element = this.parameters[i];
                if (!element.phetioPrivate) {
                    assert && assert(element.name, 'name required');
                    data[element.name] = element.phetioType.toStateObject(args[i]);
                }
            }
        }
        return data;
    };
    /**
     * Get the phetioDocumentation compiled from all the parameters
     */
    PhetioDataHandler.getPhetioDocumentation = function (currentPhetioDocumentation, parameters) {
        var paramToDocString = function (param) {
            var docText = param.phetioDocumentation ? " - ".concat(param.phetioDocumentation) : '';
            return "<li>".concat(param.name, ": ").concat(_.escape(param.phetioType.typeName)).concat(docText, "</li>");
        };
        return currentPhetioDocumentation + (parameters.length === 0 ? '<br>No parameters.' : "".concat('<br>The parameters are:<br/>' +
            '<ol>').concat(parameters.map(paramToDocString).join('<br/>'), "</ol>"));
    };
    return PhetioDataHandler;
}(PhetioObject_js_1.default));
tandemNamespace_js_1.default.register('PhetioDataHandler', PhetioDataHandler);
exports.default = PhetioDataHandler;
