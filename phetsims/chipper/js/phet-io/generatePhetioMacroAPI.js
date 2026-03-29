"use strict";
// Copyright 2019-2025, University of Colorado Boulder
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
/**
 * Launch an instance of the simulation using puppeteer, gather the PhET-iO API of the simulation,
 * see phetioEngine.getPhetioElementsBaseline
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var callbackOnWorkers_js_1 = require("../../../perennial-alias/js/common/callbackOnWorkers.js");
var withServer_js_1 = require("../../../perennial-alias/js/common/withServer.js");
var lodash_js_1 = require("../../../perennial-alias/js/npm-dependencies/lodash.js");
var puppeteer_js_1 = require("../../../perennial-alias/js/npm-dependencies/puppeteer.js");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
var showCommandLineProgress_js_1 = require("../common/showCommandLineProgress.js");
var TIMEOUT = 120000;
/**
 * Load each sim provided and get the
 */
var generatePhetioMacroAPI = function (repos, providedOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var options;
    return __generator(this, function (_a) {
        (0, assert_1.default)(repos.length === lodash_js_1.default.uniq(repos).length, 'repos should be unique');
        options = (0, optionize_js_1.default)()({
            fromBuiltVersion: false, // if the built file should be used to generate the API (otherwise uses unbuilt)
            workers: 4, // split into chunks with (at most) this many elements per chunk
            showProgressBar: false,
            showMessagesFromSim: true,
            // If false, allow individual repos return null if they encountered problems
            throwAPIGenerationErrors: true
        }, providedOptions);
        repos.length > 1 && console.log('Generating PhET-iO API for repos:', repos.join(', '));
        return [2 /*return*/, (0, withServer_js_1.default)(function (port) { return __awaiter(void 0, void 0, void 0, function () {
                var browser, completed, macroAPI, errors, workerResults, i, workerResult;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, puppeteer_js_1.default.launch({
                                timeout: 10000000, // Don't timeout the browser when generating PhET-iO API, we handle it lower down.
                                args: [
                                    '--disable-gpu',
                                    // Fork child processes directly to prevent orphaned chrome instances from lingering on sparky, https://github.com/phetsims/aqua/issues/150#issuecomment-1170140994
                                    '--no-zygote',
                                    '--no-sandbox'
                                ]
                            })];
                        case 1:
                            browser = _a.sent();
                            completed = 0;
                            options.showProgressBar && (0, showCommandLineProgress_js_1.default)(0, false);
                            macroAPI = {};
                            errors = {};
                            return [4 /*yield*/, (0, callbackOnWorkers_js_1.default)(__spreadArray([], repos, true), function (repo) { return __awaiter(void 0, void 0, void 0, function () {
                                    var repoResult, error;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, loadOneSim(repo, browser, port, options.fromBuiltVersion)];
                                            case 1:
                                                repoResult = _a.sent();
                                                (0, assert_1.default)(repoResult.repo === repo, "unexpected repo: ".concat(repoResult.repo));
                                                macroAPI[repo] = repoResult.api || null;
                                                error = repoResult.error;
                                                if (error) {
                                                    console.error("Error in ".concat(repo, ":"), error.message);
                                                    if (options.throwAPIGenerationErrors) {
                                                        throw error;
                                                    }
                                                    else {
                                                        errors[repo] = error;
                                                    }
                                                }
                                                options.showProgressBar && (0, showCommandLineProgress_js_1.default)(++completed / repos.length, false);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); }, {
                                    workers: options.workers
                                })];
                        case 2:
                            workerResults = _a.sent();
                            options.showProgressBar && (0, showCommandLineProgress_js_1.default)(1, true);
                            // If any workers had problems, report them
                            for (i = 0; i < workerResults.length; i++) {
                                workerResult = workerResults[i];
                                if (workerResult.status === 'rejected') {
                                    throw new Error(workerResult.reason);
                                }
                            }
                            return [4 /*yield*/, browser.close()];
                        case 3:
                            _a.sent();
                            if (Object.keys(errors).length > 0) {
                                console.error('Errors while generating PhET-iO APIs:', errors);
                            }
                            return [2 /*return*/, macroAPI];
                    }
                });
            }); })];
    });
}); };
var loadOneSim = function (repo, browser, port, fromBuiltVersion) { return __awaiter(void 0, void 0, void 0, function () {
    var page;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, browser.newPage()];
            case 1:
                page = _a.sent();
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                        var cleaned, cleanup, cleanupAndResolve, cleanupAndReject, id, relativePath, url, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    cleaned = false;
                                    cleanup = function () { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    if (cleaned) {
                                                        return [2 /*return*/, false];
                                                    }
                                                    cleaned = true; // must be before the close to prevent cleaning from being done twice if errors occur from page close.
                                                    clearTimeout(id);
                                                    return [4 /*yield*/, page.close()];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/, true];
                                            }
                                        });
                                    }); };
                                    cleanupAndResolve = function (value) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, cleanup()];
                                                case 1:
                                                    if (_a.sent()) {
                                                        resolve(value);
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    cleanupAndReject = function (e) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, cleanup()];
                                                case 1:
                                                    if (_a.sent()) {
                                                        resolve({
                                                            repo: repo,
                                                            error: e
                                                        });
                                                    }
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    id = setTimeout(function () { return cleanupAndReject(new Error("Timeout in generatePhetioMacroAPI for ".concat(repo))); }, TIMEOUT);
                                    page.on('console', function (msg) { return __awaiter(void 0, void 0, void 0, function () {
                                        var messageText;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    messageText = msg.text();
                                                    if (!messageText.includes('"phetioFullAPI": true,')) return [3 /*break*/, 2];
                                                    return [4 /*yield*/, cleanupAndResolve({
                                                            // to keep track of which repo this is for
                                                            repo: repo,
                                                            // For machine readability, the API
                                                            api: JSON.parse(messageText)
                                                        })];
                                                case 1:
                                                    _a.sent();
                                                    _a.label = 2;
                                                case 2: return [2 /*return*/];
                                            }
                                        });
                                    }); });
                                    page.on('error', cleanupAndReject);
                                    page.on('pageerror', cleanupAndReject);
                                    relativePath = fromBuiltVersion ?
                                        "build/phet-io/".concat(repo, "_all_phet-io.html") :
                                        "".concat(repo, "_en.html");
                                    url = "http://localhost:".concat(port, "/").concat(repo, "/").concat(relativePath, "?ea&brand=phet-io&phetioStandalone&phetioPrintAPI&randomSeed=332211&webgl=false");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 5]);
                                    return [4 /*yield*/, page.goto(url, {
                                            timeout: TIMEOUT
                                        })];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 3:
                                    e_1 = _a.sent();
                                    return [4 /*yield*/, cleanupAndReject(new Error("page.goto failure: ".concat(e_1)))];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); })];
        }
    });
}); };
generatePhetioMacroAPI.apiVersion = '1.0.0-dev.0';
exports.default = generatePhetioMacroAPI;
