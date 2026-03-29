"use strict";
// Copyright 2025, University of Colorado Boulder
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeLoadYaml = exports.getJSONFromYamlStrings = void 0;
exports.nestJSONStringValues = nestJSONStringValues;
/**
 * Converts a YAML file to JSON, nesting each leaf value under a "value" key, and writes the result to a JSON file.
 *
 * TODO: https://github.com/phetsims/chipper/issues/1589 write a message or banner that the JSON file was machine generated and should not be edited manually
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
// eslint-disable-next-line phet/default-import-match-filename
var promises_1 = require("fs/promises");
var js_yaml_1 = require("js-yaml");
var writeFileAndGitAdd_js_1 = require("../../../../perennial-alias/js/common/writeFileAndGitAdd.js");
var ChipperStringUtils_js_1 = require("../../common/ChipperStringUtils.js");
var convertHoistedSelects_js_1 = require("./convertHoistedSelects.js");
/**
 * @param repo - The name of a repo, e.g. 'joist'
 */
exports.default = (function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var jsonContents, jsonFilename;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getJSONFromYamlStrings)(repo)];
            case 1:
                jsonContents = _a.sent();
                jsonFilename = "".concat(repo, "-strings_en.json");
                return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, jsonFilename, jsonContents)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * @param repo - The name of a repo, e.g. 'joist'
 */
var getJSONFromYamlStrings = function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var filePath, yamlContents, parsed, unhoisted, nested, jsonContents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                filePath = "../".concat(repo, "/").concat(repo, "-strings_en.yaml");
                return [4 /*yield*/, promises_1.default.readFile(filePath, 'utf8')];
            case 1:
                yamlContents = _a.sent();
                parsed = (0, exports.safeLoadYaml)(yamlContents);
                unhoisted = (0, convertHoistedSelects_js_1.default)(parsed);
                nested = nestJSONStringValues(unhoisted);
                jsonContents = JSON.stringify(nested, null, 2)
                    .split('"phetioReadOnly": "true"').join('"phetioReadOnly": true');
                return [2 /*return*/, jsonContents];
        }
    });
}); };
exports.getJSONFromYamlStrings = getJSONFromYamlStrings;
/**
 * Use js-yaml to parse the YAML contents, preserving key order. The FAILSAFE_SCHEMA is used so that all
 * YAML Scalars are loaded as strings. Otherwise booleans and numbers would be loaded as their native types.
 * @param yamlContents
 */
var safeLoadYaml = function (yamlContents) {
    return js_yaml_1.default.load(yamlContents, { schema: js_yaml_1.default.FAILSAFE_SCHEMA });
};
exports.safeLoadYaml = safeLoadYaml;
/**
 * Recursively processes a YAML-parsed structure:
 * - Wraps string values in an object: ` "string"` becomes `{ "value": "string" }`.
 * - For any key `originalKey`, if a corresponding `originalKey__simMetadata` key exists
 *   at the same level, its value is added as a `simMetadata` property to the object
 *   representing `originalKey`.
 * - For any key `originalKey`, if a corresponding `originalKey__deprecated` key exists
 *   at the same level with value 'true', a `deprecated: true` property is added to the object.
 *   An error is thrown if `__deprecated` has any value other than 'true'.
 * - For any key `originalKey`, if a corresponding `originalKey__comment` key exists
 *   at the same level, its value is added as a `_comment` property to the object.
 * - `__simMetadata`, `__deprecated`, and `__comment` keys themselves are not included
 *   as top-level keys in the output.
 * - Arrays are processed element-wise. If an array itself has metadata, it will be
 *   wrapped like: `{ value: [processed elements], simMetadata: {...}, deprecated: true, _comment: "..." }`.
 * - Primitives (numbers, booleans, null) are returned as-is, unless they have metadata,
 *   in which case they are wrapped: `{ value: primitive, simMetadata: {...}, deprecated: true, _comment: "..." }`.
 *
 * @param input - The parsed YAML data (can be an object, array, string, or other primitive).
 * @returns The transformed JavaScript structure.
 */
function nestJSONStringValues(input) {
    // Base case 1: Input is a string
    if (typeof input === 'string') {
        // This allows developers to reference messages with dot notation, which is not valid in Fluent.
        // We replace dots with underscores so it matches the Fluent key format.
        var replacedString = ChipperStringUtils_js_1.default.replaceFluentReferences(input);
        return { value: replacedString };
    }
    // Base case 2: Input is an array
    else if (Array.isArray(input)) {
        // Recursively process each element of the array
        return input.map(function (item) { return nestJSONStringValues(item); });
    }
    // Recursive step: Input is an object (but not null)
    else if (input !== null && typeof input === 'object') {
        var result = {};
        var inputKeys = Object.keys(input); // Get own keys, which preserves order from yaml.load
        for (var _i = 0, inputKeys_1 = inputKeys; _i < inputKeys_1.length; _i++) {
            var key = inputKeys_1[_i];
            // If the key is a metadata key, check if its parent exists.
            // If so, it will be handled when its parent is processed, so skip.
            if (key.endsWith('__simMetadata') || key.endsWith('__deprecated') || key.endsWith('__comment')) {
                var originalKey = '';
                var metadataType = '';
                if (key.endsWith('__simMetadata')) {
                    originalKey = key.substring(0, key.length - '__simMetadata'.length);
                    metadataType = '__simMetadata';
                }
                else if (key.endsWith('__deprecated')) {
                    originalKey = key.substring(0, key.length - '__deprecated'.length);
                    metadataType = '__deprecated';
                }
                else if (key.endsWith('__comment')) {
                    originalKey = key.substring(0, key.length - '__comment'.length);
                    metadataType = '__comment';
                }
                if (inputKeys.includes(originalKey)) {
                    continue; // This metadata will be picked up by the originalKey
                }
                else {
                    // Orphaned metadata key. Decide behavior: warn, error, or process as normal.
                    // For now, let's warn and skip, as it's not meant to be independent.
                    console.warn("Orphaned ".concat(metadataType, " key found and skipped: ").concat(key));
                    continue;
                }
            }
            // Recursively process the value for the current key
            var processedValue = nestJSONStringValues(input[key]);
            // Check for corresponding __simMetadata for this key
            var metadataKey = "".concat(key, "__simMetadata");
            // Here's why this is preferred over a simple obj.hasOwnProperty(prop):
            // Avoids issues with shadowed hasOwnProperty: If obj itself has a property named hasOwnProperty (e.g., const obj = { foo: 1, hasOwnProperty: () => false }), then obj.hasOwnProperty('foo') would call the object's own (potentially incorrect) version. Object.prototype.hasOwnProperty.call(obj, 'foo') explicitly calls the original method from Object.prototype.
            // Works with objects created via Object.create(null): Objects created with Object.create(null) do not inherit from Object.prototype and therefore don't have a hasOwnProperty method on them at all. obj.hasOwnProperty would throw an error, but Object.prototype.hasOwnProperty.call(obj, prop) still works.
            // eslint-disable-next-line prefer-object-has-own
            if (Object.prototype.hasOwnProperty.call(input, metadataKey)) {
                var metadataObject = input[metadataKey]; // This is the raw metadata, e.g., { phetioReadOnly: true }
                // If processedValue is already a non-array object (i.e., from a string source or object source),
                // we can add simMetadata directly to it.
                if (typeof processedValue === 'object' && processedValue !== null && !Array.isArray(processedValue)) {
                    processedValue.simMetadata = metadataObject;
                }
                else {
                    // If processedValue is an array or a primitive (number, boolean, null),
                    // it needs to be wrapped in an object to hold both its value and the simMetadata.
                    processedValue = { value: processedValue, simMetadata: metadataObject };
                }
            }
            // Check for corresponding __deprecated for this key
            var deprecatedKey = "".concat(key, "__deprecated");
            // eslint-disable-next-line prefer-object-has-own
            if (Object.prototype.hasOwnProperty.call(input, deprecatedKey)) {
                var deprecatedValue = input[deprecatedKey];
                // Validate that __deprecated is only true
                if (deprecatedValue !== 'true') {
                    throw new Error("__deprecated must be true, but found: ".concat(deprecatedValue, " for key: ").concat(key));
                }
                // Ensure processedValue is an object that can hold the deprecated property
                if (typeof processedValue === 'object' && processedValue !== null && !Array.isArray(processedValue)) {
                    processedValue.deprecated = true;
                }
                else {
                    // Wrap primitive or array values
                    processedValue = { value: processedValue, deprecated: true };
                }
            }
            // Check for corresponding __comment for this key
            var commentKey = "".concat(key, "__comment");
            // eslint-disable-next-line prefer-object-has-own
            if (Object.prototype.hasOwnProperty.call(input, commentKey)) {
                var commentValue = input[commentKey];
                // Ensure processedValue is an object that can hold the _comment property
                if (typeof processedValue === 'object' && processedValue !== null && !Array.isArray(processedValue)) {
                    processedValue._comment = commentValue;
                }
                else {
                    // Wrap primitive or array values
                    processedValue = { value: processedValue, _comment: commentValue };
                }
            }
            result[key] = processedValue;
        }
        return result;
    }
    // Base case 3: Input is a number, boolean, or null - return as is.
    return input;
}
