"use strict";
// Copyright 2015-2025, University of Colorado Boulder
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
 * This grunt task iterates over all of the license.json files and reports any media files (images, sound, ...)
 * that have any of the following problems:
 *
 * incompatible-license    Known to be from an unapproved source outside of PhET
 * not-annotated           Missing license.json file or missing entry in license.json
 * missing-file            There is an entry in the license.json but no corresponding file
 *
 * This can be run from any simulation directory with `grunt report-media` and it reports for
 * all directories (not just the simulation at hand).
 *
 * Note that this program relies on numerous heuristics for determining the output, such as allowed entries that
 * determine if a file originates from PhET.
 *
 * See https://github.com/phetsims/tasks/issues/274
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var path_1 = require("path");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var getLicenseEntry_js_1 = require("../common/getLicenseEntry.js");
var getPhetLibs_js_1 = require("../grunt/getPhetLibs.js");
exports.default = (function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var dependencies, directory, rootdir, success, _loop_1, _i, dependencies_1, repo_1;
    return __generator(this, function (_a) {
        dependencies = (0, getPhetLibs_js_1.default)(repo);
        directory = process.cwd();
        rootdir = "".concat(directory, "/../");
        success = true;
        _loop_1 = function (repo_1) {
            // Check if the repo is missing from the directory
            if (!grunt_js_1.default.file.exists(rootdir + repo_1)) {
                if (repo_1.startsWith('phet-io') || repo_1 === 'studio') {
                    console.log("skipping repo (not checked out): ".concat(repo_1));
                    success = true;
                    return "continue";
                }
                else {
                    console.log("missing repo: ".concat(repo_1));
                    success = false;
                    return "continue";
                }
            }
            var _loop_2 = function (directory_1) {
                var searchDir = "".concat(rootdir + repo_1, "/").concat(directory_1);
                // Projects don't necessarily have all media directories
                if (grunt_js_1.default.file.exists(searchDir)) {
                    // Iterate over all media directories, such as images and sounds recursively
                    // eslint-disable-next-line @typescript-eslint/no-loop-func
                    grunt_js_1.default.file.recurse(searchDir, function (abspath, rootdir, subdir, filename) {
                        if (filename.endsWith('.js') || filename.endsWith('.ts')) {
                            return; // modulified data doesn't need to be checked
                        }
                        // Some files don't need to be attributed in the license.json
                        if (!abspath.includes('README.md') &&
                            !filename.startsWith('license.json')) {
                            // Classify the resource
                            var result = (0, getLicenseEntry_js_1.default)(abspath);
                            if (!result) {
                                grunt_js_1.default.log.error("not-annotated: ".concat(abspath));
                                success = false;
                            }
                        }
                        // Now iterate through the license.json entries and see which are missing files
                        // This helps to identify stale entries in the license.json files.
                        if (filename === 'license.json') {
                            var file = grunt_js_1.default.file.read(abspath);
                            var json = JSON.parse(file);
                            // For each key in the json file, make sure that file exists in the directory
                            for (var key in json) {
                                if (json.hasOwnProperty(key)) {
                                    // Checks for files in directory and subdirectory
                                    var resourceFilename = "".concat(path_1.default.dirname(abspath), "/").concat(key);
                                    var exists = grunt_js_1.default.file.exists(resourceFilename);
                                    if (!exists) {
                                        grunt_js_1.default.log.error("missing-file: ".concat(repo_1, "/").concat(directory_1, "/").concat(key));
                                        success = false;
                                    }
                                }
                            }
                        }
                    });
                }
            };
            for (var _b = 0, _c = ChipperConstants_js_1.default.MEDIA_TYPES; _b < _c.length; _b++) {
                var directory_1 = _c[_b];
                _loop_2(directory_1);
            }
        };
        // Create a fast report based on the license.json files for the specified repository and directory (images or sound)
        for (_i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
            repo_1 = dependencies_1[_i];
            _loop_1(repo_1);
        }
        if (!success) {
            throw new Error('There is an issue with the licenses for media types.');
        }
        return [2 /*return*/, success];
    });
}); });
