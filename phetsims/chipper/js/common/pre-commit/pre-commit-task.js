"use strict";
// Copyright 2020-2026, University of Colorado Boulder
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
 * See grunt/tasks/pre-commit.ts. This implements each task for that process so they can run in parallel. This is run
 * as a script, and not as a module.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var execute_js_1 = require("../../../../perennial-alias/js/common/execute.js");
var getRepoList_js_1 = require("../../../../perennial-alias/js/common/getRepoList.js");
var npmCommand_js_1 = require("../../../../perennial-alias/js/common/npmCommand.js");
var withServer_js_1 = require("../../../../perennial-alias/js/common/withServer.js");
var lint_js_1 = require("../../../../perennial-alias/js/eslint/lint.js");
var typeCheck_js_1 = require("../../../../perennial-alias/js/grunt/typeCheck.js");
var puppeteer_js_1 = require("../../../../perennial-alias/js/npm-dependencies/puppeteer.js");
var puppeteerQUnit_js_1 = require("../../../../perennial-alias/js/test/puppeteerQUnit.js");
var getPhetLibs_js_1 = require("../../grunt/getPhetLibs.js");
var reportMedia_js_1 = require("../../grunt/reportMedia.js");
var generatePhetioMacroAPI_js_1 = require("../../phet-io/generatePhetioMacroAPI.js");
var phetioCompareAPISets_js_1 = require("../../phet-io/phetioCompareAPISets.js");
var transpile_js_1 = require("../transpile.js");
var commandLineArguments = process.argv.slice(2);
var outputToConsole = commandLineArguments.includes('--console');
var absolute = commandLineArguments.includes('--absolute');
var fix = commandLineArguments.includes('--fix');
var getArg = function (arg) {
    var args = commandLineArguments.filter(function (commandLineArg) { return commandLineArg.startsWith("--".concat(arg, "=")); });
    if (args.length !== 1) {
        throw new Error("expected only one arg: ".concat(args));
    }
    return args[0].split('=')[1];
};
var command = getArg('command');
var repo = getArg('repo');
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var lintSuccess, optOutOfReportMedia, success, success, qUnitOKPromise, npmRunTestOkPromise, results, qUnitOK, npmRunTestOk, phetioAPIOK;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(command === 'lint')) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, lint_js_1.default)([repo], {
                        fix: fix
                    })];
            case 1:
                lintSuccess = _a.sent();
                outputToConsole && console.log("lint: ".concat(lintSuccess ? 'no ' : '', "errors."));
                process.exit(lintSuccess ? 0 : 1);
                return [3 /*break*/, 12];
            case 2:
                if (!(command === 'report-media')) return [3 /*break*/, 6];
                optOutOfReportMedia = [
                    'decaf',
                    'phet-android-app',
                    'babel',
                    'phet-info',
                    'phet-ios-app',
                    'qa',
                    'sherpa',
                    'smithers',
                    'tasks',
                    'weddell'
                ];
                if (!!optOutOfReportMedia.includes(repo)) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, reportMedia_js_1.default)(repo)];
            case 3:
                success = _a.sent();
                process.exit(success ? 0 : 1);
                return [3 /*break*/, 5];
            case 4:
                // no need to check
                process.exit(0);
                _a.label = 5;
            case 5: return [3 /*break*/, 12];
            case 6:
                if (!(command === 'type-check')) return [3 /*break*/, 8];
                return [4 /*yield*/, (0, typeCheck_js_1.default)({
                        all: true,
                        silent: !outputToConsole && !absolute, // Don't be silent if absolute output is requested
                        absolute: absolute
                    })];
            case 7:
                success = _a.sent();
                process.exit(success ? 0 : 1);
                return [3 /*break*/, 12];
            case 8:
                if (!(command === 'unit-test')) return [3 /*break*/, 10];
                qUnitOKPromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var testFilePath_1, exists, browser_1, result;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!(repo !== 'scenery' && repo !== 'phet-io-wrappers')) return [3 /*break*/, 6];
                                testFilePath_1 = "".concat(repo, "/").concat(repo, "-tests.html");
                                exists = fs_1.default.existsSync("../".concat(testFilePath_1));
                                if (!exists) return [3 /*break*/, 4];
                                outputToConsole && console.log('unit-test: testing browser QUnit');
                                return [4 /*yield*/, puppeteer_js_1.default.launch({
                                        args: [
                                            '--disable-gpu'
                                        ]
                                    })];
                            case 1:
                                browser_1 = _a.sent();
                                return [4 /*yield*/, (0, withServer_js_1.default)(function (port) { return __awaiter(void 0, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            return [2 /*return*/, (0, puppeteerQUnit_js_1.default)(browser_1, "http://localhost:".concat(port, "/").concat(testFilePath_1, "?ea&brand=phet-io"))];
                                        });
                                    }); })];
                            case 2:
                                result = _a.sent();
                                return [4 /*yield*/, browser_1.close()];
                            case 3:
                                _a.sent();
                                outputToConsole && console.log("unit-test: ".concat(JSON.stringify(result, null, 2)));
                                if (!result.ok) {
                                    console.error("unit tests failed in ".concat(repo), result);
                                    return [2 /*return*/, false];
                                }
                                else {
                                    return [2 /*return*/, true];
                                }
                                return [3 /*break*/, 5];
                            case 4:
                                outputToConsole && console.log('unit-test: no browser unit tests detected');
                                _a.label = 5;
                            case 5: return [2 /*return*/, true];
                            case 6: return [2 /*return*/, true];
                        }
                    });
                }); })();
                npmRunTestOkPromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var hasNpmRunTest, packageString, packageJSON, output, testPassed;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                hasNpmRunTest = false;
                                try {
                                    packageString = fs_1.default.readFileSync("../".concat(repo, "/package.json"), 'utf8');
                                    packageJSON = JSON.parse(packageString);
                                    if ((_a = packageJSON.scripts) === null || _a === void 0 ? void 0 : _a.hasOwnProperty('test')) {
                                        hasNpmRunTest = true;
                                    }
                                }
                                catch (e) {
                                    // no package.json or not parseable
                                }
                                if (!hasNpmRunTest) return [3 /*break*/, 2];
                                outputToConsole && console.log('unit-test: testing "npm run test" task');
                                return [4 /*yield*/, (0, execute_js_1.default)(npmCommand_js_1.default, ['run', 'test'], "../".concat(repo), { errors: 'resolve' })];
                            case 1:
                                output = _b.sent();
                                testPassed = output.code === 0;
                                (outputToConsole || !testPassed) && output.stdout.length > 0 && console.log(output.stdout);
                                (outputToConsole || !testPassed) && output.stderr.length > 0 && console.log(output.stderr);
                                return [2 /*return*/, testPassed];
                            case 2: return [2 /*return*/, true];
                        }
                    });
                }); })();
                return [4 /*yield*/, Promise.all([qUnitOKPromise, npmRunTestOkPromise])];
            case 9:
                results = _a.sent();
                qUnitOK = results[0];
                npmRunTestOk = results[1];
                outputToConsole && console.log("unit-test: QUnit browser success: ".concat(qUnitOK));
                outputToConsole && console.log("unit-test: npm run test success: ".concat(npmRunTestOk));
                process.exit((qUnitOK && npmRunTestOk) ? 0 : 1);
                return [3 /*break*/, 12];
            case 10:
                if (!(command === 'phet-io-api')) return [3 /*break*/, 12];
                return [4 /*yield*/, (function () { return __awaiter(void 0, void 0, void 0, function () {
                        var phetioAPIStable, reposToTest, repos_1, proposedAPIs;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    // If running git hooks in phet-io-sim-specific, it isn't worth regenerating the API for every single stable sim.
                                    // Instead, rely on the hooks from the repos where the api changes come from.
                                    if (repo === 'phet-io-sim-specific') {
                                        return [2 /*return*/, true];
                                    }
                                    phetioAPIStable = (0, getRepoList_js_1.default)('phet-io-api-stable');
                                    reposToTest = phetioAPIStable.filter(function (phetioSimRepo) { return (0, getPhetLibs_js_1.default)(phetioSimRepo).includes(repo); });
                                    if (!(reposToTest.length > 0)) return [3 /*break*/, 3];
                                    repos_1 = new Set();
                                    reposToTest.forEach(function (sim) { return (0, getPhetLibs_js_1.default)(sim).forEach(function (lib) { return repos_1.add(lib); }); });
                                    return [4 /*yield*/, (0, transpile_js_1.default)({
                                            repos: Array.from(repos_1),
                                            silent: true
                                        })];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, (0, generatePhetioMacroAPI_js_1.default)(reposToTest, {
                                            showProgressBar: reposToTest.length > 1,
                                            showMessagesFromSim: false
                                        })];
                                case 2:
                                    proposedAPIs = _a.sent();
                                    return [2 /*return*/, (0, phetioCompareAPISets_js_1.default)(reposToTest, proposedAPIs)];
                                case 3: return [2 /*return*/, true];
                            }
                        });
                    }); })()];
            case 11:
                phetioAPIOK = _a.sent();
                process.exit(phetioAPIOK ? 0 : 1);
                _a.label = 12;
            case 12: return [2 /*return*/];
        }
    });
}); })();
