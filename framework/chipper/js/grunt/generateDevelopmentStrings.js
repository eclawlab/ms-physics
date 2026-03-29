"use strict";
// Copyright 2022-2025, University of Colorado Boulder
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
exports.getDevelopmentStringsContents = void 0;
/**
 * This script makes a JSON file that combines translations for all locales in a repo. Each locale object has every
 * string key/translated-value pair we have for that locale.  Now supports recursively descending through nested JSON
 * trees so deeply‑nested strings are also included.
 *
 * @author Liam Mulhall (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
// eslint-disable-next-line phet/default-import-match-filename
var promises_1 = require("fs/promises");
var path_1 = require("path");
var dirname_js_1 = require("../../../perennial-alias/js/common/dirname.js");
var fixEOL_js_1 = require("./fixEOL.js");
// @ts-expect-error - until we have "type": "module" in our package.json
var __dirname = (0, dirname_js_1.default)(import.meta.url);
/**
 * Recursively walks a parsed string file, copying only the `{ value: string }` leaves to `destination` while
 * preserving the original nested structure.
 *
 * @param source - Parsed contents of a PhET strings JSON file
 * @param destination - Object that will receive the (possibly nested) `{ value: string }` leaves
 */
var addValuesRecursively = function (source, destination) {
    for (var _i = 0, _a = Object.keys(source); _i < _a.length; _i++) {
        var key = _a[_i];
        var node = source[key];
        // Guard against prototype pollution or unexpected types
        if (typeof node !== 'object' || node === null) {
            continue;
        }
        // Leaf node that holds the translation string as `{ value: '...' }`
        if ('value' in node && typeof node.value === 'string') {
            destination[key] = { value: node.value };
        }
        else {
            // Intermediate branch — recurse to capture nested leaves
            var nextDest = {};
            addValuesRecursively(node, nextDest);
            // Only add this branch if it contains at least one string leaf
            if (Object.keys(nextDest).length > 0) {
                destination[key] = nextDest;
            }
        }
    }
};
/**
 * @param repo - repo to generate strings for
 */
exports.default = (function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var rootPath, babelPath, conglomerateStringFileName, developmentStringContents, outputDir, outputPath;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                rootPath = path_1.default.join(__dirname, '..', '..', '..');
                babelPath = path_1.default.join(rootPath, 'babel');
                conglomerateStringFileName = "".concat(repo, "_all.json");
                return [4 /*yield*/, (0, exports.getDevelopmentStringsContents)(repo)];
            case 1:
                developmentStringContents = (_b = (_a = (_c.sent())) === null || _a === void 0 ? void 0 : _a.content) !== null && _b !== void 0 ? _b : null;
                // Do not generate a file if no translations were found.
                if (developmentStringContents) {
                    outputDir = path_1.default.join(babelPath, '_generated_development_strings');
                    try {
                        fs_1.default.mkdirSync(outputDir);
                    }
                    catch (e) {
                        // Directory already exists
                    }
                    outputPath = path_1.default.join(outputDir, conglomerateStringFileName);
                    fs_1.default.writeFileSync(outputPath, developmentStringContents);
                }
                else {
                    console.log('no translations found');
                }
                return [2 /*return*/];
        }
    });
}); });
var getDevelopmentStringsContents = function (repo, englishStringModulifiedFile) { return __awaiter(void 0, void 0, void 0, function () {
    var usedRelativeFiles, rootPath, babelPath, conglomerateStringObject, babelRepoPath, localeRegex, stringFiles, paths, englishStringPath, localeData, sortedConglomerateStringObject, _i, _a, locale;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                usedRelativeFiles = [];
                rootPath = path_1.default.join(__dirname, '..', '..', '..');
                babelPath = path_1.default.join(rootPath, 'babel');
                conglomerateStringObject = {};
                babelRepoPath = path_1.default.join(babelPath, repo);
                localeRegex = /(?<=_)(.*)(?=.json)/;
                stringFiles = [];
                try {
                    usedRelativeFiles.push("babel/".concat(repo));
                    paths = fs_1.default.readdirSync(babelRepoPath);
                    stringFiles.push.apply(stringFiles, paths.map(function (p) { return path_1.default.join(babelRepoPath, p); }));
                }
                catch (e) {
                    // No translations found in babel. We still continue to generate an (albeit empty) string file.
                }
                englishStringPath = path_1.default.join(rootPath, repo, "".concat(repo, "-strings_en.json"));
                usedRelativeFiles.push("".concat(repo, "/").concat(repo, "-strings_en.json"));
                if (fs_1.default.existsSync(englishStringPath)) {
                    stringFiles.push(englishStringPath);
                }
                usedRelativeFiles.push('babel/localeData.json');
                localeData = JSON.parse(fs_1.default.readFileSync('../babel/localeData.json', 'utf8'));
                if (!(stringFiles.length > 0)) return [3 /*break*/, 2];
                // For each string file in the repo subdirectory...
                return [4 /*yield*/, Promise.all(stringFiles.map(function (stringFile) { return __awaiter(void 0, void 0, void 0, function () {
                        var join, localeMatches, locale, overrideEnglish, stringFileContents, _a, parsedStringFileContents, objectToAddToLocale;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    join = stringFile.split('\\').join('/');
                                    localeMatches = join.substring(join.lastIndexOf('/')).match(localeRegex);
                                    (0, assert_1.default)(localeMatches);
                                    locale = localeMatches[0];
                                    if (!localeData[locale]) {
                                        console.log('[WARNING] Locale not found in localeData.json: ' + locale);
                                        return [2 /*return*/];
                                    }
                                    overrideEnglish = (locale === 'en' && englishStringModulifiedFile);
                                    if (!overrideEnglish) return [3 /*break*/, 1];
                                    _a = englishStringModulifiedFile.content;
                                    return [3 /*break*/, 3];
                                case 1: return [4 /*yield*/, promises_1.default.readFile(stringFile, 'utf8')];
                                case 2:
                                    _a = (_b.sent());
                                    _b.label = 3;
                                case 3:
                                    stringFileContents = _a;
                                    usedRelativeFiles.push(path_1.default.relative(rootPath, stringFile));
                                    parsedStringFileContents = JSON.parse(stringFileContents);
                                    objectToAddToLocale = {};
                                    addValuesRecursively(parsedStringFileContents, objectToAddToLocale);
                                    // Add the string values to the locale object of the conglomerate string object.
                                    conglomerateStringObject[locale] = objectToAddToLocale;
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 1:
                // For each string file in the repo subdirectory...
                _c.sent();
                sortedConglomerateStringObject = {};
                for (_i = 0, _a = Object.keys(conglomerateStringObject).sort(); _i < _a.length; _i++) {
                    locale = _a[_i];
                    sortedConglomerateStringObject[locale] = conglomerateStringObject[locale];
                }
                delete sortedConglomerateStringObject.en; // Remove English locale, as it is not needed for development since those strings are loaded directly from the json
                return [2 /*return*/, {
                        content: (0, fixEOL_js_1.default)(JSON.stringify(sortedConglomerateStringObject, null, 2)),
                        usedRelativeFiles: __spreadArray(__spreadArray([], usedRelativeFiles.sort(), true), ((_b = englishStringModulifiedFile === null || englishStringModulifiedFile === void 0 ? void 0 : englishStringModulifiedFile.usedRelativeFiles) !== null && _b !== void 0 ? _b : []), true)
                    }];
            case 2: return [2 /*return*/, null];
        }
    });
}); };
exports.getDevelopmentStringsContents = getDevelopmentStringsContents;
