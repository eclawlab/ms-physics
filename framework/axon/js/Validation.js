"use strict";
// Copyright 2019-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The definition file for "validators" used to validate values. This file holds associated logic that validates the
 * schema of the "validator" object, as well as testing if a value adheres to the restrictions provided by a validator.
 * See validate.js for usage with assertions to check that values are valid.
 *
 * Examples:
 *
 * A Validator that only accepts number values:
 * { valueType: 'number' }
 *
 * A Validator that only accepts the numbers "2" or "3":
 * { valueType: 'number', validValues: [ 2, 3 ] }
 *
 * A Validator that accepts any Object:
 * { valueType: Object }
 *
 * A Validator that accepts EnumerationDeprecated values (NOTE! This is deprecated, use the new class-based enumeration pattern as the valueType):
 * { valueType: MyEnumeration }
 * and/or
 * { validValues: MyEnumeration.VALUES }
 *
 * A Validator that accepts a string or a number greater than 2:
 * { isValidValue: value => { typeof value === 'string' || (typeof value === 'number' && value > 2)} }
 *
 * A Validator for a number that should be an even number greater than 10
 * { valueType: 'number', validators: [ { isValidValue: v => v > 10 }, { isValidValue: v => v%2 === 0 }] }
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var EnumerationDeprecated_js_1 = require("../../phet-core/js/EnumerationDeprecated.js");
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var axon_js_1 = require("./axon.js");
var TYPEOF_STRINGS = ['string', 'number', 'boolean', 'function'];
// Key names are verbose so this can be mixed into other contexts like AXON/Property. `undefined` and `null` have the
// same semantics so that we can use this feature without having extend and allocate new objects at every validation.
var VALIDATOR_KEYS = [
    'valueType',
    'validValues',
    'valueComparisonStrategy',
    'isValidValue',
    'phetioType',
    'validators'
];
var Validation = /** @class */ (function () {
    function Validation() {
    }
    /**
     * @returns an error string if incorrect, otherwise null if valid
     */
    Validation.getValidatorValidationError = function (validator) {
        if (!(validator instanceof Object)) {
            // There won't be a validationMessage on a non-object
            return 'validator must be an Object';
        }
        if (!(validator.hasOwnProperty('isValidValue') ||
            validator.hasOwnProperty('valueType') ||
            validator.hasOwnProperty('validValues') ||
            validator.hasOwnProperty('valueComparisonStrategy') ||
            validator.hasOwnProperty('phetioType') ||
            validator.hasOwnProperty('validators'))) {
            return this.combineErrorMessages("validator must have at least one of: ".concat(VALIDATOR_KEYS.join(',')), validator.validationMessage);
        }
        if (validator.hasOwnProperty('valueType')) {
            var valueTypeValidationError = Validation.getValueOrElementTypeValidationError(validator.valueType);
            if (valueTypeValidationError) {
                return this.combineErrorMessages("Invalid valueType: ".concat(validator.valueType, ", error: ").concat(valueTypeValidationError), validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('isValidValue')) {
            if (!(typeof validator.isValidValue === 'function' ||
                validator.isValidValue === null ||
                validator.isValidValue === undefined)) {
                return this.combineErrorMessages("isValidValue must be a function: ".concat(validator.isValidValue), validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('valueComparisonStrategy')) {
            // Only accepted values are below
            if (!(validator.valueComparisonStrategy === 'reference' ||
                validator.valueComparisonStrategy === 'lodashDeep' ||
                validator.valueComparisonStrategy === 'equalsFunction' ||
                typeof validator.valueComparisonStrategy === 'function')) {
                return this.combineErrorMessages("valueComparisonStrategy must be \"reference\", \"lodashDeep\", \n        \"equalsFunction\", or a comparison function: ".concat(validator.valueComparisonStrategy), validator.validationMessage);
            }
        }
        if (validator.validValues !== undefined && validator.validValues !== null) {
            if (!Array.isArray(validator.validValues)) {
                return this.combineErrorMessages("validValues must be an array: ".concat(validator.validValues), validator.validationMessage);
            }
            // Make sure each validValue matches the other rules, if any.
            var validatorWithoutValidValues = _.omit(validator, 'validValues');
            if (Validation.containsValidatorKey(validatorWithoutValidValues)) {
                for (var i = 0; i < validator.validValues.length; i++) {
                    var validValue = validator.validValues[i];
                    var validValueValidationError = Validation.getValidationError(validValue, validatorWithoutValidValues);
                    if (validValueValidationError) {
                        return this.combineErrorMessages("Item not valid in validValues: ".concat(validValue, ", error: ").concat(validValueValidationError), validator.validationMessage);
                    }
                }
            }
        }
        if (validator.hasOwnProperty('phetioType')) {
            if (!validator.phetioType) {
                return this.combineErrorMessages('falsey phetioType provided', validator.validationMessage);
            }
            if (!validator.phetioType.validator) {
                return this.combineErrorMessages("validator needed for phetioType: ".concat(validator.phetioType.typeName), validator.validationMessage);
            }
            var phetioTypeValidationError = Validation.getValidatorValidationError(validator.phetioType.validator);
            if (phetioTypeValidationError) {
                return this.combineErrorMessages(phetioTypeValidationError, validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('validators')) {
            var validators = validator.validators;
            for (var i = 0; i < validators.length; i++) {
                var subValidator = validators[i];
                var subValidationError = Validation.getValidatorValidationError(subValidator);
                if (subValidationError) {
                    return this.combineErrorMessages("validators[".concat(i, "] invalid: ").concat(subValidationError), validator.validationMessage);
                }
            }
        }
        return null;
    };
    /**
     * Validate that the valueType is of the expected format. Does not add validationMessage to any error it reports.
     * @returns - null if valid
     */
    Validation.getValueTypeValidatorValidationError = function (valueType) {
        if (!(typeof valueType === 'function' ||
            typeof valueType === 'string' ||
            valueType instanceof EnumerationDeprecated_js_1.default ||
            valueType === null ||
            valueType === undefined)) {
            return "valueType must be {function|string|EnumerationDeprecated|null|undefined}, valueType=".concat(valueType);
        }
        // {string} valueType must be one of the primitives in TYPEOF_STRINGS, for typeof comparison
        if (typeof valueType === 'string') {
            if (!_.includes(TYPEOF_STRINGS, valueType)) {
                return "valueType not a supported primitive types: ".concat(valueType);
            }
        }
        return null;
    };
    Validation.validateValidator = function (validator) {
        if (assert) {
            var error = Validation.getValidatorValidationError(validator);
            error && assert(false, error);
        }
    };
    /**
     * @param validator - object which may or may not contain validation keys
     */
    Validation.containsValidatorKey = function (validator) {
        if (!(validator instanceof Object)) {
            return false;
        }
        for (var i = 0; i < VALIDATOR_KEYS.length; i++) {
            if (validator.hasOwnProperty(VALIDATOR_KEYS[i])) {
                return true;
            }
        }
        return false;
    };
    Validation.combineErrorMessages = function (genericMessage, specificMessage) {
        if (specificMessage) {
            genericMessage = "".concat(typeof specificMessage === 'function' ? specificMessage() : specificMessage, ": ").concat(genericMessage);
        }
        return genericMessage;
    };
    Validation.isValueValid = function (value, validator, providedOptions) {
        return this.getValidationError(value, validator, providedOptions) === null;
    };
    /**
     * Determines whether a value is valid (returning a boolean value), returning the problem as a string if invalid,
     * otherwise returning null when valid.
     */
    Validation.getValidationError = function (value, validator, providedOptions) {
        var options = (0, optionize_js_1.default)()({
            validateValidator: true
        }, providedOptions);
        if (options.validateValidator) {
            var validatorValidationError = Validation.getValidatorValidationError(validator);
            if (validatorValidationError) {
                return validatorValidationError;
            }
        }
        // Check valueType, which can be an array, string, type, or null
        if (validator.hasOwnProperty('valueType')) {
            var valueType = validator.valueType;
            if (Array.isArray(valueType)) {
                // Only one should be valid, so error out if none of them returned valid (valid=null)
                if (!_.some(valueType.map(function (typeInArray) { return !Validation.getValueTypeValidationError(value, typeInArray, validator.validationMessage); }))) {
                    return this.combineErrorMessages("value not valid for any valueType in ".concat(valueType.toString().substring(0, 100), ", value: ").concat(value), validator.validationMessage);
                }
            }
            else if (valueType) {
                var valueTypeValidationError = Validation.getValueTypeValidationError(value, valueType, validator.validationMessage);
                if (valueTypeValidationError) {
                    // getValueTypeValidationError will add the validationMessage for us
                    return valueTypeValidationError;
                }
            }
        }
        if (validator.validValues) {
            var valueComparisonStrategy_1 = validator.valueComparisonStrategy || 'reference';
            var valueValid = validator.validValues.some(function (validValue) {
                return Validation.equalsForValidationStrategy(validValue, value, valueComparisonStrategy_1);
            });
            if (!valueValid) {
                return this.combineErrorMessages("value not in validValues: ".concat(value), validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('isValidValue') && !validator.isValidValue(value)) {
            return this.combineErrorMessages("value failed isValidValue: ".concat(value), validator.validationMessage);
        }
        if (validator.hasOwnProperty('phetioType')) {
            var phetioTypeValidationError = Validation.getValidationError(value, validator.phetioType.validator, options);
            if (phetioTypeValidationError) {
                return this.combineErrorMessages("value failed phetioType validator: ".concat(value, ", error: ").concat(phetioTypeValidationError), validator.validationMessage);
            }
        }
        if (validator.hasOwnProperty('validators')) {
            var validators = validator.validators;
            for (var i = 0; i < validators.length; i++) {
                var subValidator = validators[i];
                var subValidationError = Validation.getValidationError(value, subValidator, options);
                if (subValidationError) {
                    return this.combineErrorMessages("Failed validation for validators[".concat(i, "]: ").concat(subValidationError), validator.validationMessage);
                }
            }
        }
        return null;
    };
    Validation.getValueTypeValidationError = function (value, valueType, message) {
        if (typeof valueType === 'string' && typeof value !== valueType) { // primitive type
            return this.combineErrorMessages("value should have typeof ".concat(valueType, ", value=").concat(value), message);
        }
        else if (valueType === Array && !Array.isArray(value)) {
            return this.combineErrorMessages("value should have been an array, value=".concat(value), message);
        }
        else if (valueType instanceof EnumerationDeprecated_js_1.default && !valueType.includes(value)) {
            return this.combineErrorMessages("value is not a member of EnumerationDeprecated ".concat(valueType), message);
        }
        else if (typeof valueType === 'function' && !(value instanceof valueType)) { // constructor
            return this.combineErrorMessages("value should be instanceof ".concat(valueType.name, ", value=").concat(value), message);
        }
        if (valueType === null && value !== null) {
            return this.combineErrorMessages("value should be null, value=".concat(value), message);
        }
        return null;
    };
    /**
     * Validate a type that can be a type, or an array of multiple types. Does not add validationMessage to any error
     * it reports
     */
    Validation.getValueOrElementTypeValidationError = function (type) {
        if (Array.isArray(type)) {
            // If not every type in the list is valid, then return false, pass options through verbatim.
            for (var i = 0; i < type.length; i++) {
                var typeElement = type[i];
                var error = Validation.getValueTypeValidatorValidationError(typeElement);
                if (error) {
                    return "Array value invalid: ".concat(error);
                }
            }
        }
        else if (type) {
            var error = Validation.getValueTypeValidatorValidationError(type);
            if (error) {
                return "Value type invalid: ".concat(error);
            }
        }
        return null;
    };
    /**
     * Compare the two provided values for equality using the valueComparisonStrategy provided, see
     * ValueComparisonStrategy type.
     */
    Validation.equalsForValidationStrategy = function (a, b, valueComparisonStrategy) {
        if (valueComparisonStrategy === void 0) { valueComparisonStrategy = 'reference'; }
        if (valueComparisonStrategy === 'reference') {
            return a === b;
        }
        if (valueComparisonStrategy === 'equalsFunction') {
            // AHH!! We're sorry. Performance really matters here, so we use double equals to test for null and undefined.
            // eslint-disable-next-line eqeqeq, no-eq-null
            if (a != null && b != null) {
                var aComparable = a;
                var bComparable = b;
                assert && assert(!!aComparable.equals, 'no equals function for 1st arg');
                assert && assert(!!bComparable.equals, 'no equals function for 2nd arg');
                // NOTE: If you hit this, and you think it is a bad assertion because of subtyping or something, then let's
                // talk about removing this. Likely this should stick around (thinks JO and MK), but we can definitely discuss.
                // Basically using the instance defined `equals` function makes assumptions, and if this assertion fails, then
                // it may be possible to have Property setting order dependencies. Likely it is just best to use a custom
                // function provided as a valueComparisonStrategy. See https://github.com/phetsims/axon/issues/428#issuecomment-2030463728
                assert && assert(aComparable.equals(bComparable) === bComparable.equals(aComparable), 'incompatible equality checks');
                var aEqualsB = aComparable.equals(bComparable);
                // Support for heterogeneous values with equalsFunction. No need to check both directions if they are the
                // same class.
                return a.constructor === b.constructor ? aEqualsB : aEqualsB && bComparable.equals(a);
            }
            return a === b; // Reference equality as a null/undefined fallback
        }
        if (valueComparisonStrategy === 'lodashDeep') {
            return _.isEqual(a, b);
        }
        else {
            return valueComparisonStrategy(a, b);
        }
    };
    Validation.VALIDATOR_KEYS = VALIDATOR_KEYS;
    /**
     * General validator for validating that a string doesn't have template variables in it.
     */
    Validation.STRING_WITHOUT_TEMPLATE_VARS_VALIDATOR = {
        valueType: 'string',
        isValidValue: function (v) { return !/\{\{\w*\}\}/.test(v); }
    };
    return Validation;
}());
exports.default = Validation;
axon_js_1.default.register('Validation', Validation);
