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
/**
 * Throws an error if any latest production phet sims use common code string keys that do not exist in the en.json
 * of that common code repo on main.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 *
 * usage:
 * cd chipper/
 * sage run js/scripts/assertNoMissingMainEnStringKeys.ts
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var ReleaseBranch_js_1 = require("../../../perennial-alias/js/common/ReleaseBranch.js");
var lodash_js_1 = require("../../../perennial-alias/js/npm-dependencies/lodash.js");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var getJSON, getStringMap, getPackage, releaseBranches, problemStrings, populateProblem, mapOnMain, getFromCache, _i, releaseBranches_1, releaseBranch, packageJSON, simRequireJSNamespace, stringMap, e_1, _a, _b, stringKey, keyParts, requireJSNamespace, actualKey, mainMap, nestingParts, nestedObject, _c, nestingParts_1, part;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                getJSON = function (url) { return __awaiter(void 0, void 0, void 0, function () {
                    var x;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, fetch(url)];
                            case 1:
                                x = _a.sent();
                                return [2 /*return*/, x.json()];
                        }
                    });
                }); };
                getStringMap = function (releaseBranch) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, getJSON("https://phet.colorado.edu/sims/html/".concat(releaseBranch.repo, "/latest/english-string-map.json"))];
                    });
                }); };
                getPackage = function (releaseBranch) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, getJSON("https://raw.githubusercontent.com/phetsims/".concat(releaseBranch.repo, "/refs/heads/").concat(releaseBranch.branch, "/package.json"))];
                    });
                }); };
                return [4 /*yield*/, ReleaseBranch_js_1.default.getAllMaintenanceBranches(false)];
            case 1:
                releaseBranches = _d.sent();
                problemStrings = {};
                populateProblem = function (stringKey, releaseBranch) {
                    problemStrings[stringKey] = problemStrings[stringKey] || [];
                    problemStrings[stringKey].push(releaseBranch.toString());
                };
                mapOnMain = {};
                getFromCache = function (requireJSNamespace) {
                    if (!mapOnMain.hasOwnProperty(requireJSNamespace)) {
                        var repo = lodash_js_1.default.kebabCase(requireJSNamespace);
                        mapOnMain[requireJSNamespace] = JSON.parse(fs_1.default.readFileSync("../".concat(repo, "/").concat(repo, "-strings_en.json")).toString());
                    }
                    return mapOnMain[requireJSNamespace];
                };
                _i = 0, releaseBranches_1 = releaseBranches;
                _d.label = 2;
            case 2:
                if (!(_i < releaseBranches_1.length)) return [3 /*break*/, 9];
                releaseBranch = releaseBranches_1[_i];
                if (!releaseBranch.brands.includes('phet')) {
                    return [3 /*break*/, 8];
                }
                return [4 /*yield*/, getPackage(releaseBranch)];
            case 3:
                packageJSON = _d.sent();
                simRequireJSNamespace = packageJSON.phet.requirejsNamespace;
                stringMap = void 0;
                _d.label = 4;
            case 4:
                _d.trys.push([4, 6, , 7]);
                return [4 /*yield*/, getStringMap(releaseBranch)];
            case 5:
                stringMap = _d.sent();
                return [3 /*break*/, 7];
            case 6:
                e_1 = _d.sent();
                console.error("cannot get string map for ".concat(releaseBranch.toString()), e_1);
                return [3 /*break*/, 8];
            case 7:
                for (_a = 0, _b = Object.keys(stringMap); _a < _b.length; _a++) {
                    stringKey = _b[_a];
                    keyParts = stringKey.split('/');
                    requireJSNamespace = keyParts[0];
                    actualKey = keyParts.slice(1, keyParts.length).join('/');
                    if (requireJSNamespace !== simRequireJSNamespace && !actualKey.startsWith('a11y')) {
                        mainMap = getFromCache(requireJSNamespace);
                        if (!mainMap.hasOwnProperty(actualKey)) {
                            nestingParts = actualKey.split('.');
                            nestedObject = mainMap;
                            for (_c = 0, nestingParts_1 = nestingParts; _c < nestingParts_1.length; _c++) {
                                part = nestingParts_1[_c];
                                if (nestedObject) {
                                    nestedObject = nestedObject[part];
                                }
                            }
                            if (!nestedObject) {
                                populateProblem(stringKey, releaseBranch);
                            }
                        }
                    }
                }
                _d.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 2];
            case 9:
                assert_1.default.ok(Object.keys(problemStrings).length === 0, "string keys have been deleted from main but are needed for latest published sim translations: \n".concat(JSON.stringify(problemStrings, null, 2)));
                return [2 /*return*/];
        }
    });
}); })();
