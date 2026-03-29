"use strict";
// Copyright 2024-2025, University of Colorado Boulder
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
exports.preCommitMain = preCommitMain;
/**
 * Main logic of pre-commit responsible for launching pre-commit tasks in parallel for a given repo
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var execute_js_1 = require("../../../../perennial-alias/js/common/execute.js");
var phetTimingLog_js_1 = require("../../../../perennial-alias/js/common/phetTimingLog.js");
var tsxCommand_js_1 = require("../../../../perennial-alias/js/common/tsxCommand.js");
var getOption_js_1 = require("../../../../perennial-alias/js/grunt/tasks/util/getOption.js");
var getPreCommitTasks_js_1 = require("./getPreCommitTasks.js");
function preCommitMain(repo, outputToConsole) {
    return __awaiter(this, void 0, void 0, function () {
        var absolute, fix, tasksToRun, precommitSuccess;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    absolute = (0, getOption_js_1.default)('absolute');
                    fix = (0, getOption_js_1.default)('fix');
                    tasksToRun = (0, getPreCommitTasks_js_1.default)(outputToConsole);
                    outputToConsole && console.log('tasks to run:', tasksToRun);
                    return [4 /*yield*/, phetTimingLog_js_1.default.startAsync("pre-commit repo=\"".concat(repo, "\""), function () { return __awaiter(_this, void 0, void 0, function () {
                            var taskResults;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        outputToConsole && console.log('repo:', repo);
                                        return [4 /*yield*/, Promise.allSettled(tasksToRun.map(function (task) {
                                                return phetTimingLog_js_1.default.startAsync(task, function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var results, message;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, (0, execute_js_1.default)(tsxCommand_js_1.default, [
                                                                    '../chipper/js/common/pre-commit/pre-commit-task.ts',
                                                                    "--command=".concat(task),
                                                                    "--repo=".concat(repo),
                                                                    outputToConsole ? '--console' : '',
                                                                    absolute ? '--absolute' : '',
                                                                    fix ? '--fix' : ''
                                                                ], '../chipper', {
                                                                    errors: 'resolve'
                                                                })];
                                                            case 1:
                                                                results = _a.sent();
                                                                (0, assert_1.default)(typeof results !== 'string');
                                                                results.stdout && results.stdout.trim().length > 0 && console.log(results.stdout);
                                                                results.stderr && results.stderr.trim().length > 0 && console.log(results.stderr);
                                                                if (results.code === 0) {
                                                                    return [2 /*return*/, { task: task, success: true }];
                                                                }
                                                                else {
                                                                    message = 'Task failed: ' + task;
                                                                    if (results.stdout && results.stdout.trim().length > 0) {
                                                                        message = message + ': ' + results.stdout;
                                                                    }
                                                                    if (results.stderr && results.stderr.trim().length > 0) {
                                                                        message = message + ': ' + results.stderr;
                                                                    }
                                                                    return [2 /*return*/, { task: task, success: false, message: message }];
                                                                }
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }, {
                                                    depth: 1
                                                });
                                            }))];
                                    case 1:
                                        taskResults = _a.sent();
                                        taskResults.forEach(function (result) {
                                            if (result.status === 'fulfilled') {
                                                if (result.value.success) {
                                                    console.log("Task ".concat(result.value.task, " succeeded"));
                                                }
                                                else {
                                                    console.error(result.value.message);
                                                }
                                            }
                                            else {
                                                console.error("Task ".concat(result.reason.task, " encountered an error: ").concat(result.reason.message));
                                            }
                                        });
                                        return [2 /*return*/, taskResults.every(function (result) { return result.status === 'fulfilled' && result.value.success; })];
                                }
                            });
                        }); })];
                case 1:
                    precommitSuccess = _a.sent();
                    // generatePhetioMacroAPI is preventing exit for unknown reasons, so manually exit here
                    phetTimingLog_js_1.default.close(function () { return process.exit(precommitSuccess ? 0 : 1); });
                    return [2 /*return*/];
            }
        });
    });
}
