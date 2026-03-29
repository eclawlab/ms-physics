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
 * Throws an error if the codebase has any deprecated strings found in `repo-en.json` string files that aren't used
 * by any PhET production simulations.
 *
 * To test the assertion is working, build a smaller subset of releaseBranches for
 * publishedMap (using releaseBranches.slice(100) in the loop)
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 *
 * usage:
 * cd chipper/
 * sage run js/scripts/assertAllDeprecatedStringKeysUsed.ts
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var getActiveRepos_js_1 = require("../../../perennial-alias/js/common/getActiveRepos.js");
var loadJSON_js_1 = require("../../../perennial-alias/js/common/loadJSON.js");
var ReleaseBranch_js_1 = require("../../../perennial-alias/js/common/ReleaseBranch.js");
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var getPublishedStringMap, getLocalStringMap, publishedMap, localKeyUsedInAnyPublishedSim, releaseBranches, _i, releaseBranches_1, releaseBranch, _a, _b, problemStrings, _c, _d, repo, localMap, packageJSON, requireJSNamespace, localMapKey, fullStringKey, used;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                getPublishedStringMap = function (releaseBranch) { return __awaiter(void 0, void 0, void 0, function () {
                    var url, x;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                url = "https://phet.colorado.edu/sims/html/".concat(releaseBranch.repo, "/latest/english-string-map.json");
                                return [4 /*yield*/, fetch(url)];
                            case 1:
                                x = _a.sent();
                                return [2 /*return*/, x.json()];
                        }
                    });
                }); };
                getLocalStringMap = function (repo) {
                    var file = null;
                    try {
                        file = fs_1.default.readFileSync("../".concat(repo, "/").concat(repo, "-strings_en.json"));
                    }
                    catch (e) {
                        return null;
                    }
                    return JSON.parse(file.toString());
                };
                publishedMap = [];
                localKeyUsedInAnyPublishedSim = function (fullStringKey) {
                    for (var _i = 0, publishedMap_1 = publishedMap; _i < publishedMap_1.length; _i++) {
                        var publishedStringMap = publishedMap_1[_i];
                        if (publishedStringMap.hasOwnProperty(fullStringKey)) {
                            return true;
                        }
                    }
                    return false;
                };
                return [4 /*yield*/, ReleaseBranch_js_1.default.getAllMaintenanceBranches(false)];
            case 1:
                releaseBranches = _e.sent();
                _i = 0, releaseBranches_1 = releaseBranches;
                _e.label = 2;
            case 2:
                if (!(_i < releaseBranches_1.length)) return [3 /*break*/, 5];
                releaseBranch = releaseBranches_1[_i];
                if (!releaseBranch.brands.includes('phet')) return [3 /*break*/, 4];
                _b = (_a = publishedMap).push;
                return [4 /*yield*/, getPublishedStringMap(releaseBranch)];
            case 3:
                _b.apply(_a, [_e.sent()]);
                _e.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                problemStrings = [];
                _c = 0, _d = (0, getActiveRepos_js_1.default)();
                _e.label = 6;
            case 6:
                if (!(_c < _d.length)) return [3 /*break*/, 9];
                repo = _d[_c];
                localMap = getLocalStringMap(repo);
                if (!localMap) {
                    return [3 /*break*/, 8];
                }
                return [4 /*yield*/, (0, loadJSON_js_1.default)("../".concat(repo, "/package.json"))];
            case 7:
                packageJSON = _e.sent();
                requireJSNamespace = packageJSON.phet.requirejsNamespace;
                for (localMapKey in localMap) {
                    if (localMap[localMapKey].deprecated) {
                        fullStringKey = "".concat(requireJSNamespace, "/").concat(localMapKey);
                        used = localKeyUsedInAnyPublishedSim(fullStringKey);
                        if (!used) {
                            problemStrings.push(fullStringKey);
                        }
                    }
                }
                _e.label = 8;
            case 8:
                _c++;
                return [3 /*break*/, 6];
            case 9:
                assert_1.default.ok(problemStrings.length === 0, "unused deprecated strings exist on main. let's remove them: \n".concat(problemStrings.join(',\n'), "\n"));
                return [2 /*return*/];
        }
    });
}); })();
