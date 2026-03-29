"use strict";
// Copyright 2019-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var axon_js_1 = require("./axon.js");
var Validation_js_1 = require("./Validation.js");
/**
 * If assertions are enabled, assert out if the value does not adhere to the validator. No-op without assertions.
 * @deprecated - this solution is worse than a direct assertion (or otherwise call Validation.getValidationError directly)
 */
var validate = function (value, validator, providedOptions) {
    if (assert) {
        // Throws an error if not valid
        var result = Validation_js_1.default.getValidationError(value, validator, providedOptions);
        if (result) {
            // Just pick the helpful keys to print for the assertion message, so stub out the type of this
            var validatorKeys = _.pick(validator, Validation_js_1.default.VALIDATOR_KEYS);
            if (validatorKeys.phetioType) {
                validatorKeys.phetioType = _.pick(validator.phetioType, ['validator', 'typeName']);
            }
            var prunedValidator = JSON.stringify(validatorKeys, null, 2);
            assert && assert(false, 'validation failed for value:', value, result, 'prunedValidator:', prunedValidator);
        }
    }
};
axon_js_1.default.register('validate', validate);
exports.default = validate;
