"use strict";
// Copyright 2017-2026, University of Colorado Boulder
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
exports.default = getDependencies;
/**
 * Creates an object that stores information about all dependencies (including their SHAs and current branches)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var execute_js_1 = require("../../../perennial-alias/js/common/execute.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var getPhetLibs_js_1 = require("./getPhetLibs.js");
// Our definition of an allowed simName is defined in the buildServer: https://github.com/phetsims/perennial/blob/78025b7ae6064e9ab5260cea5e532f3bf24c3ec8/js/build-server/taskWorker.js#L99-L98
// We don't want to be this strict though, because 3rd parties are allowed to name sims to be whatever they want. So
// for the purposes of dependencies, we just need to make sure it is a name, and not a path.
var simNameRegex = /^[^/]+$/;
/**
 * Returns an object in the dependencies.json format. Keys are repo names (or 'comment'). Repo keys have 'sha' and 'branch' fields.
 *
 * @returns - In the dependencies.json format. JSON.stringify if you want to output to a file
 */
function getDependencies(repo) {
    return __awaiter(this, void 0, void 0, function () {
        var packageObject, version, dependencies, mainDependencies, dependenciesInfo, _i, dependencies_1, dependency, sha, branch, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
                    version = packageObject.version;
                    dependencies = (0, getPhetLibs_js_1.default)(repo).filter(function (dependency) { return dependency !== 'babel'; });
                    mainDependencies = (0, getPhetLibs_js_1.default)(repo, 'phet').filter(function (dependency) { return dependency !== 'babel'; });
                    grunt_js_1.default.log.verbose.writeln("Scanning dependencies from:\n".concat(dependencies.toString()));
                    dependenciesInfo = {
                        comment: "# ".concat(repo, " ").concat(version, " ").concat(new Date().toString())
                    };
                    _i = 0, dependencies_1 = dependencies;
                    _a.label = 1;
                case 1:
                    if (!(_i < dependencies_1.length)) return [3 /*break*/, 8];
                    dependency = dependencies_1[_i];
                    (0, assert_1.default)(!dependenciesInfo.dependency, "there was already a dependency named ".concat(dependency));
                    if (!simNameRegex.test(dependency)) {
                        throw new Error("Dependency name is not valid: ".concat(dependency));
                    }
                    else if (!grunt_js_1.default.file.exists("../".concat(dependency))) {
                        if (mainDependencies.includes(dependency)) {
                            throw new Error("Dependency not found: ".concat(dependency));
                        }
                        // NOTE NOTE NOTE: This error message is checked for on the perennial build side (it will fail the build). Do NOT change this without changing that.
                        grunt_js_1.default.log.warn("WARNING404: Skipping potentially non-public dependency ".concat(dependency));
                        return [3 /*break*/, 7];
                    }
                    sha = null;
                    branch = null;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, execute_js_1.default)('git', ['rev-parse', 'HEAD'], "../".concat(dependency))];
                case 3:
                    sha = (_a.sent()).trim();
                    return [4 /*yield*/, (0, execute_js_1.default)('git', ['rev-parse', '--abbrev-ref', 'HEAD'], "../".concat(dependency))];
                case 4:
                    branch = (_a.sent()).trim();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    // We support repos that are not git repositories, see https://github.com/phetsims/chipper/issues/1011
                    console.log("Did not find git information for ".concat(dependency));
                    return [3 /*break*/, 6];
                case 6:
                    grunt_js_1.default.log.verbose.writeln("".concat(ChipperStringUtils_js_1.default.padString(dependency, 20) + branch, " ").concat(sha));
                    dependenciesInfo[dependency] = { sha: sha, branch: branch };
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, dependenciesInfo];
            }
        });
    });
}
