"use strict";
// Copyright 2016-2025, University of Colorado Boulder
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryStringMachine = void 0;
/**
 * Query String parser that supports type coercion, defaults, error checking, etc. based on a schema.
 * See QueryStringMachine.get for the description of a schema.
 *
 * For UMD (Universal Module Definition) supported output, see js/QueryStringMachine.js
 *
 * See TYPES for a description of the schema types and their properties.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
// Default string that splits array strings
var DEFAULT_SEPARATOR = ',';
// If a query parameter has private:true in its schema, it must pass this predicate to be read from the URL.
// See https://github.com/phetsims/chipper/issues/743
var privatePredicate = function () {
    // Trying to access localStorage may fail with a SecurityError if cookies are blocked in a certain way.
    // See https://github.com/phetsims/qa/issues/329 for more information.
    try {
        return localStorage.getItem('phetTeamMember') === 'true';
    }
    catch (e) {
        return false;
    }
};
function hasOwnProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}
/**
 * Valid parameter strings begin with ? or are the empty string.  This is used for assertions in some cases and for
 * throwing Errors in other cases.
 */
var isParameterString = function (string) { return string.length === 0 || string.startsWith('?'); };
// Just return a value to define the module export.
// This example returns an object, but the module
// can return a function as the exported value.
/**
 * In order to support graceful failures for user-supplied values, we fall back to default values when public: true
 * is specified.  If the schema entry is public: false, then a queryStringMachineAssert is thrown.
 */
var getValidValue = function (predicate, key, value, schema, message) {
    if (!predicate) {
        if (schema.public) {
            exports.QueryStringMachine.addWarning(key, value, message);
            if (hasOwnProperty(schema, 'defaultValue')) {
                value = schema.defaultValue;
            }
            else {
                var typeSchema = TYPES[schema.type];
                queryStringMachineAssert(hasOwnProperty(typeSchema, 'defaultValue'), 'Type must have a default value if the provided schema does not have one.');
                // @ts-expect-error - we know they don't all have this, hence the assertion above.
                value = typeSchema.defaultValue;
            }
        }
        else {
            queryStringMachineAssert(predicate, message);
        }
    }
    return value;
};
/**
 * Query String Machine is a query string parser that supports type coercion, default values & validation. Please
 * visit PhET's <a href="https://github.com/phetsims/query-string-machine" target="_blank">query-string-machine</a>
 * repository for documentation and examples.
 */
exports.QueryStringMachine = {
    // public (read-only) {{key:string, value:{*}, message:string}[]} - cleared by some tests in QueryStringMachineTests.js
    // See QueryStringMachine.addWarning for a description of these fields, and to add warnings.
    warnings: [],
    /**
     * Gets the value for a single query parameter.
     *
     */
    get: function (key, schema) {
        return this.getForString(key, schema, window.location.search);
    },
    /**
     * Gets values for every query parameter, using the specified schema map.
     *
     * @param schemaMap - see QueryStringMachine.getAllForString
     * @returns - see QueryStringMachine.getAllForString
     */
    getAll: function (schemaMap) {
        return __assign(__assign({}, this.getAllForString(schemaMap, window.location.search)), { SCHEMA_MAP: schemaMap });
    },
    /**
     * Like `get` but for an arbitrary parameter string.
     *
     * @param key - the query parameter name
     * @param schema - see QueryStringMachine.get
     * @param string - the parameters string.  Must begin with '?' or be the empty string
     * @returns - query parameter value, converted to the proper type
     */
    getForString: function (key, schema, string) {
        if (!isParameterString(string)) {
            throw new Error("Query strings should be either the empty string or start with a \"?\": ".concat(string));
        }
        // Ignore URL values for private query parameters that fail privatePredicate.
        // See https://github.com/phetsims/chipper/issues/743.
        var values = (schema.private && !privatePredicate()) ? [] : getValues(key, string);
        validateSchema(key, schema);
        var value = parseValues(key, schema, values);
        if (hasOwnProperty(schema, 'validValues')) {
            var validValues = schema.validValues;
            value = getValidValue(isValidValue(value, validValues), key, value, schema, "Invalid value supplied for key \"".concat(key, "\": ").concat(value, " is not a member of valid values: ").concat(validValues.join(', ')));
        }
        // isValidValue evaluates to true
        else if (hasOwnProperty(schema, 'isValidValue')) {
            value = getValidValue(schema.isValidValue(value), key, value, schema, "Invalid value supplied for key \"".concat(key, "\": ").concat(value));
        }
        var valueValid = TYPES[schema.type].isValidValue(value);
        // support custom validation for elementSchema for arrays
        if (schema.type === 'array' && Array.isArray(value)) {
            var elementsValid = true;
            for (var i = 0; i < value.length; i++) {
                var element = value[i];
                if (!TYPES[schema.elementSchema.type].isValidValue(element)) {
                    elementsValid = false;
                    break;
                }
                if (hasOwnProperty(schema.elementSchema, 'isValidValue') && !schema.elementSchema.isValidValue(element)) {
                    elementsValid = false;
                    break;
                }
                if (hasOwnProperty(schema.elementSchema, 'validValues') && !isValidValue(element, schema.elementSchema.validValues)) {
                    elementsValid = false;
                    break;
                }
            }
            valueValid = valueValid && elementsValid;
        }
        // dispatch further validation to a type-specific function
        value = getValidValue(valueValid, key, value, schema, "Invalid value for type, key: ".concat(key));
        return value;
    },
    /**
     * Like `getAll` but for an arbitrary parameters string.
     * @param schemaMap - key/value pairs, key is query parameter name and value is a schema
     * @param string - the parameters string
     * @returns - key/value pairs holding the parsed results
     */
    getAllForString: function (schemaMap, string) {
        var result = {};
        for (var key in schemaMap) {
            if (schemaMap.hasOwnProperty(key)) {
                result[key] = this.getForString(key, schemaMap[key], string);
            }
        }
        return result;
    },
    /**
     * Returns true if the window.location.search contains the given key
     * @returns - true if the window.location.search contains the given key
     */
    containsKey: function (key) {
        return this.containsKeyForString(key, window.location.search);
    },
    /**
     * Returns true if the given string contains the specified key
     * @param key - the key to check for
     * @param string - the query string to search. Must begin with '?' or be the empty string
     * @returns - true if the given string contains the given key
     */
    containsKeyForString: function (key, string) {
        if (!isParameterString(string)) {
            throw new Error("Query strings should be either the empty string or start with a \"?\": ".concat(string));
        }
        var values = getValues(key, string);
        return values.length > 0;
    },
    /**
     * Returns true if the objects are equal.  Exported on the QueryStringMachine for testing.  Only works for
     * arrays objects that contain primitives (i.e. terminals are compared with ===)
     * private - however, it is called from QueryStringMachineTests
     */
    deepEquals: function (a, b) {
        if (typeof a !== typeof b) {
            return false;
        }
        if (typeof a === 'string' || typeof a === 'number' || typeof a === 'boolean') {
            return a === b;
        }
        if (a === null && b === null) {
            return true;
        }
        if (a === undefined && b === undefined) {
            return true;
        }
        if (a === null && b === undefined) {
            return false;
        }
        if (a === undefined && b === null) {
            return false;
        }
        var aKeys = Object.keys(a);
        var bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
        else if (aKeys.length === 0) {
            return a === b;
        }
        else {
            for (var i = 0; i < aKeys.length; i++) {
                if (aKeys[i] !== bKeys[i]) {
                    return false;
                }
                var aChild = a[aKeys[i]];
                var bChild = b[aKeys[i]];
                if (!exports.QueryStringMachine.deepEquals(aChild, bChild)) {
                    return false;
                }
            }
            return true;
        }
    },
    /**
     * Returns a new URL but without the key-value pair.
     *
     * @param queryString - tail of a URL including the beginning '?' (if any)
     * @param key
     */
    removeKeyValuePair: function (queryString, key) {
        queryStringMachineAssert(typeof queryString === 'string', "url should be string, but it was: ".concat(typeof queryString));
        queryStringMachineAssert(typeof key === 'string', "url should be string, but it was: ".concat(typeof key));
        queryStringMachineAssert(isParameterString(queryString), 'queryString should be length 0 or begin with ?');
        queryStringMachineAssert(key.length > 0, 'url should be a string with length > 0');
        if (queryString.startsWith('?')) {
            var newParameters = [];
            var query = queryString.substring(1);
            var elements = query.split('&');
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var keyAndMaybeValue = element.split('=');
                var elementKey = decodeURIComponent(keyAndMaybeValue[0]);
                if (elementKey !== key) {
                    newParameters.push(element);
                }
            }
            if (newParameters.length > 0) {
                return "?".concat(newParameters.join('&'));
            }
            else {
                return '';
            }
        }
        else {
            return queryString;
        }
    },
    /**
     * Remove all the keys from the queryString (ok if they do not appear at all)
     */
    removeKeyValuePairs: function (queryString, keys) {
        for (var i = 0; i < keys.length; i++) {
            queryString = this.removeKeyValuePair(queryString, keys[i]);
        }
        return queryString;
    },
    /**
     * Appends a query string to a given url.
     * @param url - may or may not already have other query parameters
     * @param queryParameters - may start with '', '?' or '&'
     *
     * @example
     * // Limit to the second screen
     * simURL = QueryStringMachine.appendQueryString( simURL, 'screens=2' );
     */
    appendQueryString: function (url, queryParameters) {
        if (queryParameters.startsWith('?') || queryParameters.startsWith('&')) {
            queryParameters = queryParameters.substring(1);
        }
        if (queryParameters.length === 0) {
            return url;
        }
        var combination = url.includes('?') ? '&' : '?';
        return url + combination + queryParameters;
    },
    /**
     * Helper function for multiple query strings
     * @param url - may or may not already have other query parameters
     * @param queryStringArray - each item may start with '', '?', or '&'
     *
     * @example
     * sourceFrame.src = QueryStringMachine.appendQueryStringArray( simURL, [ 'screens=2', 'frameTitle=source' ] );
     */
    appendQueryStringArray: function (url, queryStringArray) {
        for (var i = 0; i < queryStringArray.length; i++) {
            url = this.appendQueryString(url, queryStringArray[i]);
        }
        return url;
    },
    /**
     * Returns the query string at the end of a url, or '?' if there is none.
     */
    getQueryString: function (url) {
        var index = url.indexOf('?');
        if (index >= 0) {
            return url.substring(index);
        }
        else {
            return '?';
        }
    },
    /**
     * Adds a warning to the console and QueryStringMachine.warnings to indicate that the provided invalid value will
     * not be used.
     *
     * @param key - the query parameter name
     * @param value - type depends on schema type
     * @param message - the message that indicates the problem with the value
     */
    addWarning: function (key, value, message) {
        var isDuplicate = false;
        for (var i = 0; i < this.warnings.length; i++) {
            var warning = this.warnings[i];
            if (key === warning.key && value === warning.value && message === warning.message) {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            console.warn(message);
            this.warnings.push({
                key: key,
                value: value,
                message: message
            });
        }
    },
    /**
     * Determines if there is a warning for a specified key.
     */
    hasWarning: function (key) {
        var hasWarning = false;
        for (var i = 0; i < this.warnings.length && !hasWarning; i++) {
            hasWarning = (this.warnings[i].key === key);
        }
        return hasWarning;
    },
    /**
     * @param queryString - tail of a URL including the beginning '?' (if any)
     * @returns - the split up still-URI-encoded parameters (with values if present)
     */
    getQueryParametersFromString: function (queryString) {
        if (queryString.startsWith('?')) {
            var query = queryString.substring(1);
            return query.split('&');
        }
        return [];
    },
    /**
     * @param key - the query parameter key to return if present
     * @param string - a URL including a "?" if it has a query string
     * @returns - the query parameter as it appears in the URL, like `key=VALUE`, or null if not present
     */
    getSingleQueryParameterString: function (key, string) {
        var queryString = this.getQueryString(string);
        var queryParameters = this.getQueryParametersFromString(queryString);
        for (var i = 0; i < queryParameters.length; i++) {
            var queryParameter = queryParameters[i];
            var keyAndMaybeValue = queryParameter.split('=');
            if (decodeURIComponent(keyAndMaybeValue[0]) === key) {
                return queryParameter;
            }
        }
        return null;
    }
};
/**
 * Query strings may show the same key appearing multiple times, such as ?value=2&value=3.
 * This method recovers all of the string values.  For this example, it would be ['2','3'].
 *
 * @param key - the key for which we are finding values.
 * @param string - the parameters string
 * @returns - the resulting values, null indicates the query parameter is present with no value
 */
var getValues = function (key, string) {
    var values = [];
    var params = string.slice(1).split('&');
    for (var i = 0; i < params.length; i++) {
        var splitByEquals = params[i].split('=');
        var name_1 = splitByEquals[0];
        var value = splitByEquals.slice(1).join('='); // Support arbitrary number of '=' in the value
        if (name_1 === key) {
            if (value) {
                values.push(decodeURIComponent(value));
            }
            else {
                values.push(null); // no value provided
            }
        }
    }
    return values;
};
// Schema validation ===============================================================================================
/**
 * Validates the schema for a query parameter.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 */
var validateSchema = function (key, schema) {
    var schemaType = TYPES[schema.type];
    // type is required
    queryStringMachineAssert(schema.hasOwnProperty('type'), "type field is required for key: ".concat(key));
    // type is valid
    queryStringMachineAssert(TYPES.hasOwnProperty(schema.type), "invalid type: ".concat(schema.type, " for key: ").concat(key));
    // parse is a function
    if (hasOwnProperty(schema, 'parse')) {
        queryStringMachineAssert(typeof schema.parse === 'function', "parse must be a function for key: ".concat(key));
    }
    // validValues and isValidValue are optional and mutually exclusive
    queryStringMachineAssert(!(schema.hasOwnProperty('validValues') && schema.hasOwnProperty('isValidValue')), "validValues and isValidValue are mutually exclusive for key: ".concat(key));
    // validValues is an Array
    if (hasOwnProperty(schema, 'validValues')) {
        queryStringMachineAssert(Array.isArray(schema.validValues), "isValidValue must be an array for key: ".concat(key));
    }
    // isValidValue is a function
    if (hasOwnProperty(schema, 'isValidValue')) {
        queryStringMachineAssert(typeof schema.isValidValue === 'function', "isValidValue must be a function for key: ".concat(key));
    }
    // defaultValue has the correct type
    if (hasOwnProperty(schema, 'defaultValue')) {
        queryStringMachineAssert(schemaType.isValidValue(schema.defaultValue), "defaultValue incorrect type: ".concat(key));
    }
    // validValues have the correct type
    if (hasOwnProperty(schema, 'validValues')) {
        schema.validValues.forEach(function (value) { return queryStringMachineAssert(schemaType.isValidValue(value), "validValue incorrect type for key: ".concat(key)); });
    }
    // defaultValue is a member of validValues
    if (hasOwnProperty(schema, 'defaultValue') && hasOwnProperty(schema, 'validValues')) {
        queryStringMachineAssert(isValidValue(schema.defaultValue, schema.validValues), "defaultValue must be a member of validValues, for key: ".concat(key));
    }
    // defaultValue must exist for a public schema so there's a fallback in case a user provides an invalid value.
    // However, defaultValue is not required for flags since they're only a key. While marking a flag as public: true
    // doesn't change its behavior, it's allowed so that we can use the public key for documentation, see https://github.com/phetsims/query-string-machine/issues/41
    if (hasOwnProperty(schema, 'public') && schema.public && schema.type !== 'flag') {
        queryStringMachineAssert(schema.hasOwnProperty('defaultValue'), "defaultValue is required when public: true for key: ".concat(key));
    }
    // verify that the schema has appropriate properties
    validateSchemaProperties(key, schema, schemaType.required, schemaType.optional);
    if (schema.type === 'array') {
        validateArraySchema(key, schema);
    }
};
/**
 * Validates schema for type 'array'.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 */
var validateArraySchema = function (key, schema) {
    // separator is a single character
    if (schema.hasOwnProperty('separator')) {
        queryStringMachineAssert(typeof schema.separator === 'string' && schema.separator.length === 1, "invalid separator: ".concat(schema.separator, ", for key: ").concat(key));
    }
    queryStringMachineAssert(!schema.elementSchema.hasOwnProperty('public'), 'Array elements should not declare public; it comes from the array schema itself.');
    // validate elementSchema
    validateSchema("".concat(key, ".element"), schema.elementSchema);
};
/**
 * Verifies that a schema contains only supported properties, and contains all required properties.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param requiredProperties - properties that the schema must have
 * @param optionalProperties - properties that the schema may optionally have
 */
var validateSchemaProperties = function (key, schema, requiredProperties, optionalProperties) {
    // {string[]}, the names of the properties in the schema
    var schemaProperties = Object.getOwnPropertyNames(schema);
    // verify that all required properties are present
    requiredProperties.forEach(function (property) {
        queryStringMachineAssert(schemaProperties.includes(property), "missing required property: ".concat(property, " for key: ").concat(key));
    });
    // verify that there are no unsupported properties
    var supportedProperties = requiredProperties.concat(optionalProperties);
    schemaProperties.forEach(function (property) {
        queryStringMachineAssert(property === 'type' || supportedProperties.includes(property), "unsupported property: ".concat(property, " for key: ").concat(key));
    });
};
// Parsing =========================================================================================================
/**
 * Uses the supplied schema to convert query parameter value(s) from string to the desired value type.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param values - any matches from the query string,
 *   could be multiple for ?value=x&value=y for example
 * @returns the associated value, converted to the proper type
 */
var parseValues = function (key, schema, values) {
    var returnValue;
    // values contains values for all occurrences of the query parameter.  We currently support only 1 occurrence.
    queryStringMachineAssert(values.length <= 1, "query parameter cannot occur multiple times: ".concat(key));
    if (schema.type === 'flag') {
        // flag is a convenient variation of boolean, which depends on whether the query string is present or not
        var type = TYPES[schema.type];
        returnValue = type.parse(key, schema, values[0]);
    }
    else {
        queryStringMachineAssert(values[0] !== undefined || schema.hasOwnProperty('defaultValue'), "missing required query parameter: ".concat(key));
        if (values[0] === undefined) {
            // not in the query string, use the default
            returnValue = schema.defaultValue;
        }
        else {
            var type = TYPES[schema.type];
            // dispatch parsing of query string to a type-specific function
            // @ts-expect-error - schema cannot be given the exact type based on the specific value of schema.type
            returnValue = type.parse(key, schema, values[0]);
        }
    }
    return returnValue;
};
/**
 * Parses the value for a type 'flag'.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param value - value from the query parameter string
 */
var parseFlag = function (key, schema, value) {
    return value === null ? true : value === undefined ? false : value;
};
/**
 * Parses the value for a type 'boolean'.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param string - value from the query parameter string
 */
var parseBoolean = function (key, schema, string) {
    return string === 'true' ? true : string === 'false' ? false : string;
};
/**
 * Parses the value for a type 'number'.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param string - value from the query parameter string
 */
var parseNumber = function (key, schema, string) {
    var number = Number(string);
    return string === null || isNaN(number) ? string : number;
};
/**
 * Parses the value for a type 'number'.
 * The value to be parsed is already string, so it is guaranteed to parse as a string.
 * @param key
 * @param schema
 * @param string
 */
var parseString = function (key, schema, string) {
    return string;
};
/**
 * Parses the value for a type 'array'.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param value - value from the query parameter string
 */
var parseArray = function (key, schema, value) {
    var returnValue;
    if (value === null) {
        // null signifies an empty array. For instance ?screens= would give []
        // See https://github.com/phetsims/query-string-machine/issues/17
        returnValue = [];
    }
    else {
        // Split up the string into an array of values. E.g. ?screens=1,2 would give [1,2]
        returnValue = value.split(schema.separator || DEFAULT_SEPARATOR)
            .map(function (element) { return parseValues(key, schema.elementSchema, [element]); });
    }
    return returnValue;
};
/**
 * Parses the value for a type 'custom'.
 * @param key - the query parameter name
 * @param schema - schema that describes the query parameter, see QueryStringMachine.get
 * @param value - value from the query parameter string
 */
var parseCustom = function (key, schema, value) {
    return schema.parse(value);
};
// Utilities =======================================================================================================
/**
 * Determines if value is in a set of valid values, uses deep comparison.
 */
var isValidValue = function (value, validValues) {
    var found = false;
    for (var i = 0; i < validValues.length && !found; i++) {
        found = exports.QueryStringMachine.deepEquals(validValues[i], value);
    }
    return found;
};
/**
 * Query parameters are specified by the user, and are outside the control of the programmer.
 * So the application should throw an Error if query parameters are invalid.
 * @param predicate - if predicate evaluates to false, an Error is thrown
 * @param message
 */
var queryStringMachineAssert = function (predicate, message) {
    if (!predicate) {
        console.log(message);
        throw new Error("Query String Machine Assertion failed: ".concat(message));
    }
};
/**
 * Data structure that describes each query parameter type, which properties are required vs optional,
 * how to validate, and how to parse.
 *
 * The properties that are required or optional depend on the type (see TYPES), and include:
 * type - {string} the type name
 * defaultValue - the value to use if no query parameter is provided. If there is no defaultValue, then
 *    the query parameter is required in the query string; omitting the query parameter will result in an Error.
 * validValues - array of the valid values for the query parameter
 * isValidValue - function that takes a parsed Object (not string) and checks if it is acceptable
 * elementSchema - specifies the schema for elements in an array
 * separator -  array elements are separated by this string, defaults to `,`
 * parse - a function that takes a string and returns an Object
 */
var TYPES = {
    // NOTE: Types for this are currently in phet-types.d.ts! Changes here should be made there also
    // value is true if present, false if absent
    flag: {
        required: [],
        optional: ['private', 'public'],
        parse: parseFlag,
        isValidValue: function (value) { return value === true || value === false; },
        defaultValue: true // only needed for flags marks as 'public: true`
    },
    // value is either true or false, e.g. showAnswer=true
    boolean: {
        required: [],
        optional: ['defaultValue', 'private', 'public'],
        parse: parseBoolean,
        isValidValue: function (value) { return value === true || value === false; }
    },
    // value is a number, e.g. frameRate=100
    number: {
        required: [],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'private', 'public'],
        parse: parseNumber,
        isValidValue: function (value) { return typeof value === 'number' && !isNaN(value); }
    },
    // value is a string, e.g. name=Ringo
    string: {
        required: [],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'private', 'public'],
        parse: parseString,
        isValidValue: function (value) { return value === null || typeof value === 'string'; }
    },
    // value is an array, e.g. screens=1,2,3
    array: {
        required: ['elementSchema'],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'separator', 'validValues', 'private', 'public'],
        parse: parseArray,
        isValidValue: function (value) { return Array.isArray(value) || value === null; }
    },
    // value is a custom data type, e.g. color=255,0,255
    custom: {
        required: ['parse'],
        optional: ['defaultValue', 'validValues', 'isValidValue', 'private', 'public'],
        parse: parseCustom,
        isValidValue: function () { return true; }
    }
};
