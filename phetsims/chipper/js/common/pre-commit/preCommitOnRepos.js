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
exports.default = preCommitOnRepos;
/**
 * Spawns the same pre-commit process on each repo in the list
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var path_1 = require("path");
var dirname_js_1 = require("../../../../perennial-alias/js/common/dirname.js");
var execute_js_1 = require("../../../../perennial-alias/js/common/execute.js");
var tsxCommand_js_1 = require("../../../../perennial-alias/js/common/tsxCommand.js");
function preCommitOnRepos(repos, outputToConsole) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, success, i, args, __dirname_1, cwd, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    success = true;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < repos.length)) return [3 /*break*/, 4];
                    process.stdout.write(repos[i] + ': ');
                    args = process.argv.slice(2).filter(function (arg) { return !['--all', '--changed'].includes(arg); });
                    outputToConsole && console.log('spawning pre-commit.ts with args:', args);
                    __dirname_1 = (0, dirname_js_1.default)(import.meta.url);
                    cwd = path_1.default.resolve(__dirname_1, '../../../../', repos[i]);
                    return [4 /*yield*/, (0, execute_js_1.default)(tsxCommand_js_1.default, __spreadArray(['../chipper/js/grunt/tasks/pre-commit.ts'], args, true), cwd, {
                            // resolve errors so Promise.all doesn't fail on first repo that cannot pull/rebase
                            errors: 'resolve'
                        })];
                case 2:
                    result = _a.sent();
                    outputToConsole && console.log('result:', result);
                    if (result.code === 0) {
                        console.log('Success');
                    }
                    else {
                        console.log();
                        result.stdout.trim().length > 0 && console.log(result.stdout.trim());
                        result.stderr.trim().length > 0 && console.log(result.stderr.trim());
                        success = false;
                    }
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Done in ' + (Date.now() - startTime) + 'ms');
                    return [2 /*return*/, success];
            }
        });
    });
}
