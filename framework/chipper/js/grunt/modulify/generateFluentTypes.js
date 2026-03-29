"use strict";
// Copyright 2025-2026, University of Colorado Boulder
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
exports.getFluentTypesFileContent = void 0;
/**
 * Parse a YAML file and convert its contents to types for Fluent.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var affirm_js_1 = require("../../../../perennial-alias/js/browser-and-node/affirm.js");
var writeFileAndGitAdd_js_1 = require("../../../../perennial-alias/js/common/writeFileAndGitAdd.js");
var FluentLibrary_js_1 = require("../../browser-and-node/FluentLibrary.js");
var ChipperStringUtils_js_1 = require("../../common/ChipperStringUtils.js");
var pascalCase_js_1 = require("../../common/pascalCase.js");
var getCopyrightLineFromFileContents_js_1 = require("../getCopyrightLineFromFileContents.js");
var convertHoistedSelects_js_1 = require("./convertHoistedSelects.js");
var convertStringsYamlToJson_js_1 = require("./convertStringsYamlToJson.js");
var getFluentParams_js_1 = require("./getFluentParams.js");
/** true if key is a valid JS identifier (no quoting needed). */
var IDENT = /^[A-Za-z_$][\w$]*$/;
/** Indent helper. */
var indent = function (lvl, spaces) {
    if (spaces === void 0) { spaces = 2; }
    return ' '.repeat(lvl * spaces);
};
/** Matches Fluent variable placeholders such as `{ $value }`. */
var FLUENT_VARIABLE_PLACEHOLDER_REGEX = /\{\s*\$[\w.-]+/;
/**
 * Parse comments from raw YAML text while preserving order.
 * Returns an array of FluentComment objects with line numbers and associated keys.
 */
function parseYamlComments(yamlText) {
    var lines = yamlText.split('\n');
    var comments = [];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        // Check if line is a comment (starts with #)
        if (line.startsWith('#')) {
            var comment = line.substring(1).trim(); // Remove # and trim whitespace
            // Look ahead to find the next non-comment, non-empty line to associate with
            var associatedKey = void 0;
            for (var j = i + 1; j < lines.length; j++) {
                var nextLine = lines[j].trim();
                if (nextLine && !nextLine.startsWith('#')) {
                    // Extract the key from "key: value" format
                    var colonIndex = nextLine.indexOf(':');
                    if (colonIndex > 0) {
                        associatedKey = nextLine.substring(0, colonIndex).trim();
                    }
                    break;
                }
            }
            comments.push({
                comment: comment,
                associatedKey: associatedKey
            });
        }
    }
    return comments;
}
/** Recursively walk object, returning leaf records. */
function collectLeaves(obj, pathArr) {
    if (pathArr === void 0) { pathArr = []; }
    var leaves = [];
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], val = _b[1];
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
            leaves.push.apply(leaves, collectLeaves(val, __spreadArray(__spreadArray([], pathArr, true), [key], false)));
        }
        else {
            // Replace fluent references with dot separated values (which is not valid in Fluent syntax) with
            // underscores. This allows PhET developers to use dot notation when referencing fluent keys,
            // which is more familiar.
            var replacedString = ChipperStringUtils_js_1.default.replaceFluentReferences(val);
            leaves.push({ pathArr: __spreadArray(__spreadArray([], pathArr, true), [key], false), value: replacedString }); // scalar leaf
        }
    }
    return leaves;
}
/**
 * Create a key for the fluent file from the path array. Nesting from the YAML is indicated by underscores.
 * Characters that are not valid in Fluent keys are replaced with dashes.
 */
function createFluentKey(pathArr) {
    return pathArr
        .join('_')
        // This regex matches any character that is not a letter, digit, or underscore.
        .replace(/[^a-zA-Z0-9]/g, '_');
}
/**
 * Creates an accessor path for a StringProperty for the given path array.
 *
 * e.g., for pathArr=['a', 'b.c'], returns "a.b.cStringProperty".
 *
 * @param pathArr - An array with the "path" to the string from nesting in the file.
 */
var createAccessor = function (pathArr) {
    (0, affirm_js_1.default)(pathArr.length > 0, 'pathArr must contain at least one key');
    // Clone the array and glue the suffix onto its last element
    var parts = pathArr.slice();
    var lastIdx = parts.length - 1;
    parts[lastIdx] = parts[lastIdx] + 'StringProperty'; // strip leading dot if given
    // .get is graceful which is nice because strings are removed from the build if they are not used.
    return parts.join('.');
};
/**
 * Expands “dot-notation” keys into real nested objects.
 *
 * If the key contains one or more dots (e.g. `"a.b.c"`), the key is split on the dot
 * characters and intermediate objects are created so that the value resides
 * at the correct depth:
 *
 *   expandDottedKeys({ "a.b": 1, "x.y.z": 2 })
 *   // { a: { b: 1 }, x: { y: { z: 2 } } }
 *
 * Keys without dots are copied verbatim.
 *
 * If several keys share a common prefix, the resulting sub-objects are merged;
 * when the same final path is encountered more than once, the later value
 * overwrites the earlier one.
 */
function expandDottedKeys(object) {
    var newObject = {};
    Object.entries(object).forEach(function (_a) {
        var rawKey = _a[0], value = _a[1];
        var parts = rawKey.split('.');
        // The 'cursor' is the position where we are in the tree as we recursively build the object.
        var cursor = newObject;
        for (var i = 0; i < parts.length - 1; i++) {
            var part = parts[i];
            // We have never seen this key before, so we need to create an object for it.
            // If we HAVE seen it, we will use the existing object and merge into it.
            if (cursor[part] === undefined || cursor[part] === null) {
                cursor[part] = {};
            }
            cursor = cursor[part];
        }
        var last = parts[parts.length - 1];
        var nextEntry;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            // If the value is an object, we recursively expand its keys as well.
            nextEntry = expandDottedKeys(value);
        }
        else {
            nextEntry = value;
        }
        // Set the final value in the cursor object.
        cursor[last] = nextEntry;
        cursor[last] =
            (value && typeof value === 'object' && !Array.isArray(value)) ? expandDottedKeys(value)
                : value;
    });
    return newObject;
}
/** Build nested TS literal from YAML, inserting both helpers at leaves and interleaving comments. */
function buildFluentObject(obj, typeInfoMap, pascalCaseRepo, comments, pathArr, lvl) {
    if (comments === void 0) { comments = []; }
    if (pathArr === void 0) { pathArr = []; }
    if (lvl === void 0) { lvl = 1; }
    // Keys with dots should be expanded into nested objects so that usages can easily access values with
    // dot notation.
    obj = expandDottedKeys(obj);
    var lines = ['{'];
    var entries = Object.entries(obj);
    // Helper to get the full key path for a given key at current level
    var getFullPath = function (key) { return __spreadArray(__spreadArray([], pathArr, true), [key], false).join('.'); };
    // Find comments that should be placed at this level
    var levelComments = comments.filter(function (comment) {
        if (!comment.associatedKey) {
            return false;
        }
        // Check if this comment's associated key matches any key at this level
        var associatedKeyPath = comment.associatedKey;
        return entries.some(function (_a) {
            var key = _a[0];
            var fullPath = getFullPath(key);
            return associatedKeyPath === key || associatedKeyPath === fullPath;
        });
    });
    // Group comments by their associated keys
    var commentsByKey = new Map();
    levelComments.forEach(function (comment) {
        var _a;
        if (comment.associatedKey) {
            // Find the entry key that matches this comment
            var matchingKey = (_a = entries.find(function (_a) {
                var key = _a[0];
                var fullPath = getFullPath(key);
                return comment.associatedKey === key || comment.associatedKey === fullPath;
            })) === null || _a === void 0 ? void 0 : _a[0];
            if (matchingKey) {
                if (!commentsByKey.has(matchingKey)) {
                    commentsByKey.set(matchingKey, []);
                }
                commentsByKey.get(matchingKey).push(comment);
            }
        }
    });
    var commentCounter = 0;
    entries.forEach(function (_a, idx) {
        var key = _a[0], val = _a[1];
        // Add comments before this key if any exist
        var keyComments = commentsByKey.get(key);
        if (keyComments) {
            keyComments.forEach(function (comment) {
                var commentKey = "_comment_".concat(commentCounter);
                var commentData = JSON.stringify(comment);
                // Comments always need a comma since they're followed by either another comment or the actual key
                lines.push("".concat(indent(lvl)).concat(commentKey, ": new FluentComment( ").concat(commentData, " ),"));
                commentCounter++;
            });
        }
        // If the key is not a valid JS identifier, we need to quote it. This can be accomplished by using JSON.stringify.
        var safeKey = IDENT.test(key) ? key : JSON.stringify(key);
        var comma = idx < entries.length - 1 ? ',' : '';
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
            // recurse
            var sub = buildFluentObject(val, typeInfoMap, pascalCaseRepo, comments, __spreadArray(__spreadArray([], pathArr, true), [key], false), lvl + 1);
            lines.push("".concat(indent(lvl)).concat(safeKey, ": ").concat(sub).concat(comma));
        }
        else {
            // leaf
            var id = createFluentKey(__spreadArray(__spreadArray([], pathArr, true), [key], false));
            var paramInfo = typeInfoMap.get(id);
            (0, affirm_js_1.default)(paramInfo, "Missing type info for ".concat(id));
            // Convert param info from the fluent value into a TypeScript type for development.
            function generateTypeDefinition(schema) {
                if (!Array.isArray(schema)) {
                    console.error('Input must be an array of property definitions.');
                    return '{}';
                }
                var properties = schema.map(function (prop) {
                    var name = prop.name;
                    var typeString;
                    if (prop.variants && Array.isArray(prop.variants) && prop.variants.length > 0) {
                        // Create the union of string literals
                        var variantLiterals = prop.variants.map(function (v) {
                            if (typeof v === 'number') {
                                // If the variant is a number, return it as is, so it will appear in the type like a number literal
                                return v;
                            }
                            else if (typeof v === 'string') {
                                return "'".concat(v, "'");
                            }
                            else {
                                (0, affirm_js_1.default)(v.type === getFluentParams_js_1.NUMBER_LITERAL, 'Unexpected variant type, expected string or number literal');
                                return "number | '".concat(v.value, "'");
                            }
                        }).join(' | ');
                        // Create the full type string including TReadOnlyProperty
                        typeString = "".concat(variantLiterals, " | TReadOnlyProperty<").concat(variantLiterals, ">");
                    }
                    else {
                        // If no variants are provided, this will be a string, number, or TReadOnlyProperty of those types.
                        typeString = 'FluentVariable';
                    }
                    return "".concat(name, ": ").concat(typeString);
                });
                return "{ ".concat(properties.join(', '), " }");
            }
            // Check if there are no parameters (empty cleaned schema)
            // A suffix for the key in the line if it is going to be a StringProperty
            var stringPropertyKey = IDENT.test(key + 'StringProperty') ? key + 'StringProperty' : JSON.stringify(key + 'StringProperty');
            var accessor = createAccessor(__spreadArray(__spreadArray([], pathArr, true), [key], false));
            var getter = "_.get( ".concat(pascalCaseRepo, "Strings, '").concat(accessor, "' )");
            // Do not pass the following strings through Fluent:
            //
            // - Strings that live outside the `a11y` namespace. They are not currently
            //   translated; treating them as Fluent may introduce runtime errors if a
            //   translator inserts Fluent syntax or references another key.
            //
            // - Strings that use legacy placeholder patterns such as `{0}` or `{{value}}`.
            //   These are formatted at runtime with `StringUtils.format` or `StringUtils.fillIn`
            //   and are therefore incompatible with FluentPattern.
            //
            // TODO: https://github.com/phetsims/rosetta/issues/221, Revisit when full Fluent support is available for non-a11y content.
            if (ChipperStringUtils_js_1.default.isLegacyStringPattern(val) || !accessor.startsWith('a11y.')) {
                lines.push("".concat(indent(lvl)).concat(stringPropertyKey, ": ").concat(getter).concat(comma));
            }
            else if (paramInfo.length === 0) {
                // No parameters - use FluentConstant
                var stringPropertyKey_1 = IDENT.test(key + 'StringProperty') ? key + 'StringProperty' : JSON.stringify(key + 'StringProperty');
                lines.push("".concat(indent(lvl)).concat(stringPropertyKey_1, ": new FluentConstant( fluentSupport.bundleProperty, '").concat(id, "', ").concat(getter, " )").concat(comma));
            }
            else {
                // Has parameters - use FluentPattern
                var T = generateTypeDefinition(paramInfo);
                lines.push("".concat(indent(lvl)).concat(safeKey, ": new FluentPattern<").concat(T, ">( fluentSupport.bundleProperty, '").concat(id, "', ").concat(getter, ", ").concat(JSON.stringify(paramInfo), " )").concat(comma));
            }
        }
    });
    lines.push("".concat(indent(lvl - 1), "}"));
    return lines.join('\n');
}
var getFluentTypesFileContent = function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var pascalCaseRepo, camelCaseRepo, yamlPath, outPath, yamlText, yamlObj, comments, leaves, allKeys, filteredLeaves, fluentKeyMapLines, copyrightLine, ftlContent, entryIndex, keyToTypeInfoMap, fluentObjectLiteral, header, importStatements, body, usedImportLines, importSection;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pascalCaseRepo = (0, pascalCase_js_1.default)(repo);
                camelCaseRepo = lodash_1.default.camelCase(repo);
                yamlPath = "../".concat(repo, "/").concat(repo, "-strings_en.yaml");
                outPath = "js/".concat(pascalCaseRepo, "Fluent.ts");
                yamlText = fs_1.default.readFileSync(yamlPath, 'utf8');
                yamlObj = (0, convertHoistedSelects_js_1.default)((0, convertStringsYamlToJson_js_1.safeLoadYaml)(yamlText));
                comments = parseYamlComments(yamlText);
                leaves = collectLeaves(yamlObj);
                allKeys = leaves.map(function (leaf) { return createFluentKey(leaf.pathArr); });
                allKeys.forEach(function (key) {
                    var count = allKeys.filter(function (k) { return k === key; }).length;
                    (0, affirm_js_1.default)(count === 1, "Duplicate key found in YAML: ".concat(key, " appears ").concat(count, " times"));
                });
                // Throw an error when Fluent patterns are used outside the a11y key
                leaves.forEach(function (leaf) {
                    var accessor = createAccessor(leaf.pathArr);
                    if (accessor.startsWith('a11y.')) {
                        return;
                    }
                    var value = leaf.value;
                    var containsFluentPlaceholder = FLUENT_VARIABLE_PLACEHOLDER_REGEX.test(value);
                    (0, affirm_js_1.default)(!containsFluentPlaceholder, "Fluent placeholders (e.g. { $value }) are only allowed under the a11y key. Found '".concat(leaf.pathArr.join('.'), "' in ").concat(repo, "-strings_en.yaml."));
                });
                filteredLeaves = leaves.filter(function (leaf) { return !ChipperStringUtils_js_1.default.isLegacyStringPattern(leaf.value); });
                fluentKeyMapLines = filteredLeaves.map(function (leaf) {
                    // Create an ID using underscore-separated path segments
                    var id = createFluentKey(leaf.pathArr);
                    // Build full path to access the Property
                    var accessor = createAccessor(leaf.pathArr);
                    return "addToMapIfDefined( '".concat(id, "', '").concat(accessor, "' );");
                }).join('\n');
                return [4 /*yield*/, (0, getCopyrightLineFromFileContents_js_1.default)(repo, outPath)];
            case 1:
                copyrightLine = _a.sent();
                ftlContent = filteredLeaves.map(function (leaf) {
                    var id = createFluentKey(leaf.pathArr);
                    return "".concat(id, " = ").concat(FluentLibrary_js_1.default.formatMultilineForFtl(leaf.value));
                }).join('\n');
                // verify the fluent file to report syntax errors in the english content.
                FluentLibrary_js_1.default.verifyFluentFile(ftlContent);
                entryIndex = (0, getFluentParams_js_1.parseFluentToMap)(ftlContent);
                keyToTypeInfoMap = new Map();
                leaves.forEach(function (_a) {
                    var pathArr = _a.pathArr;
                    var fluentKey = createFluentKey(pathArr);
                    keyToTypeInfoMap.set(fluentKey, (0, getFluentParams_js_1.getFluentParamsFromIndex)(entryIndex, fluentKey));
                });
                fluentObjectLiteral = buildFluentObject(yamlObj, keyToTypeInfoMap, pascalCaseRepo, comments, [], 1);
                header = "".concat(copyrightLine, "\n// AUTOMATICALLY GENERATED \u2013 DO NOT EDIT.\n// Generated from ").concat(path_1.default.basename(yamlPath), "\n\n/* eslint-disable */\n/* @formatter:off */\n\n");
                importStatements = [
                    {
                        line: 'import { TReadOnlyProperty } from \'../../axon/js/TReadOnlyProperty.js\';',
                        identifiers: ['TReadOnlyProperty']
                    },
                    {
                        line: 'import FluentLibrary from \'../../chipper/js/browser-and-node/FluentLibrary.js\';',
                        identifiers: ['FluentLibrary']
                    },
                    {
                        line: 'import FluentComment from \'../../chipper/js/browser/FluentComment.js\';',
                        identifiers: ['FluentComment']
                    },
                    {
                        line: 'import FluentConstant from \'../../chipper/js/browser/FluentConstant.js\';',
                        identifiers: ['FluentConstant']
                    },
                    {
                        line: 'import FluentContainer from \'../../chipper/js/browser/FluentContainer.js\';',
                        identifiers: ['FluentContainer']
                    },
                    {
                        line: 'import type {FluentVariable} from \'../../chipper/js/browser/FluentPattern.js\';',
                        identifiers: ['FluentVariable']
                    },
                    {
                        line: 'import FluentPattern from \'../../chipper/js/browser/FluentPattern.js\';',
                        identifiers: ['FluentPattern']
                    },
                    {
                        line: "import ".concat(camelCaseRepo, " from './").concat(camelCaseRepo, ".js';"),
                        identifiers: ["".concat(camelCaseRepo, ".register")]
                    },
                    {
                        line: "import ".concat(pascalCaseRepo, "Strings from './").concat(pascalCaseRepo, "Strings.js';"),
                        identifiers: ["".concat(pascalCaseRepo, "Strings")]
                    }
                ];
                body = "// This map is used to create the fluent file and link to all StringProperties.\n// Accessing StringProperties is also critical for including them in the built sim.\n// However, if strings are unused in Fluent system too, they will be fully excluded from\n// the build. So we need to only add actually used strings.\nconst fluentKeyToStringPropertyMap = new Map();\n\nconst addToMapIfDefined = ( key: string, path: string ) => {\n  const sp = _.get( ".concat(pascalCaseRepo, "Strings, path );\n  if ( sp ) {\n    fluentKeyToStringPropertyMap.set( key, sp );\n  }\n};\n\n").concat(fluentKeyMapLines, "\n\n// A function that creates contents for a new Fluent file, which will be needed if any string changes.\nconst createFluentFile = (): string => {\n  let ftl = '';\n  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {\n    ftl += `${key} = ${FluentLibrary.formatMultilineForFtl( stringProperty.value )}\\n`;\n  }\n  return ftl;\n};\n\nconst fluentSupport = new FluentContainer( createFluentFile, Array.from(fluentKeyToStringPropertyMap.values()) );\n\nconst ").concat(pascalCaseRepo, "Fluent = ").concat(fluentObjectLiteral, ";\n\nexport default ").concat(pascalCaseRepo, "Fluent;\n\n").concat(camelCaseRepo, ".register('").concat(pascalCaseRepo, "Fluent', ").concat(pascalCaseRepo, "Fluent);\n");
                usedImportLines = importStatements
                    .filter(function (statement) { return statement.identifiers.some(function (identifier) { return body.includes(identifier); }); })
                    .map(function (statement) { return statement.line; });
                importSection = usedImportLines.length > 0 ? "".concat(usedImportLines.join('\n'), "\n\n") : '';
                // template TypeScript file
                return [2 /*return*/, {
                        content: "".concat(header).concat(importSection).concat(body),
                        usedRelativeFiles: ["".concat(repo, "/").concat(repo, "-strings_en.yaml")]
                    }];
        }
    });
}); };
exports.getFluentTypesFileContent = getFluentTypesFileContent;
/** Build nested TS literal from YAML, inserting both helpers at leaves. */
var generateFluentTypes = function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var pascalCaseRepo, outPath, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                pascalCaseRepo = (0, pascalCase_js_1.default)(repo);
                outPath = "js/".concat(pascalCaseRepo, "Fluent.ts");
                _a = writeFileAndGitAdd_js_1.default;
                _b = [repo, outPath];
                return [4 /*yield*/, (0, exports.getFluentTypesFileContent)(repo)];
            case 1: 
            // 6 write out
            return [4 /*yield*/, _a.apply(void 0, _b.concat([(_c.sent()).content]))];
            case 2:
                // 6 write out
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.default = generateFluentTypes;
