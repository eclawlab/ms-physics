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
exports.default = transpile;
exports.getTranspileCLIOptions = getTranspileCLIOptions;
/**
 * Function to support transpiling on the project. See grunt transpile
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var dirname_js_1 = require("../../../perennial-alias/js/common/dirname.js");
var execute_js_1 = require("../../../perennial-alias/js/common/execute.js");
var getActiveRepos_js_1 = require("../../../perennial-alias/js/common/getActiveRepos.js");
var getOption_js_1 = require("../../../perennial-alias/js/grunt/tasks/util/getOption.js");
var getRepo_js_1 = require("../../../perennial-alias/js/grunt/tasks/util/getRepo.js");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
// @ts-expect-error - until we have "type": "module" in our package.json
var __dirname = (0, dirname_js_1.default)(import.meta.url);
function transpile(providedOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var start, options, repos, distPath, chunks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    options = (0, optionize_js_1.default)()({
                        all: false,
                        silent: false,
                        clean: false,
                        live: false,
                        repos: []
                    }, providedOptions);
                    (0, assert_1.default)(options.repos.length > 0 || options.all, 'must include repos or --all');
                    repos = options.all ? (0, getActiveRepos_js_1.default)() : options.repos;
                    // We can't use --delete-dir-on-start, because we are operating multiple swc instances in child processes.
                    if (options.clean) {
                        distPath = path_1.default.resolve(__dirname, '../../../chipper/dist/js');
                        if (fs_1.default.existsSync(distPath)) {
                            fs_1.default.rmSync(distPath, { recursive: true, force: true });
                        }
                    }
                    chunks = lodash_1.default.chunk(repos, 50);
                    !options.silent && console.log("Transpiling code for ".concat(repos.length, " repositories, split into ").concat(chunks.length, " chunks..."));
                    return [4 /*yield*/, Promise.all(chunks.map(function (chunkedRepos) { return spawnTranspile(chunkedRepos, options.live, options.silent); }))];
                case 1:
                    _a.sent();
                    !options.silent && console.log('Finished initial transpilation in ' + (Date.now() - start) + 'ms');
                    !options.silent && options.live && console.log('Watching...');
                    return [2 /*return*/];
            }
        });
    });
}
// Parse command line options into an object for the module
function getTranspileCLIOptions() {
    var transpileOptions = {};
    // command line options override passed-in options
    if ((0, getOption_js_1.isOptionKeyProvided)('repo')) {
        transpileOptions.repos = [(0, getRepo_js_1.default)()];
    }
    // Takes precedence over repo
    if ((0, getOption_js_1.isOptionKeyProvided)('repos')) {
        transpileOptions.repos = (0, getOption_js_1.default)('repos').split(',');
    }
    // Takes precedence over repo and repos
    if ((0, getOption_js_1.isOptionKeyProvided)('all')) {
        transpileOptions.all = (0, getOption_js_1.default)('all');
    }
    if ((0, getOption_js_1.isOptionKeyProvided)('watch')) {
        transpileOptions.live = (0, getOption_js_1.default)('watch');
        console.log('--watch is deprecated, use --live instead');
    }
    if ((0, getOption_js_1.isOptionKeyProvided)('live')) {
        transpileOptions.live = (0, getOption_js_1.default)('live');
    }
    if ((0, getOption_js_1.isOptionKeyProvided)('clean')) {
        transpileOptions.clean = (0, getOption_js_1.default)('clean');
    }
    if ((0, getOption_js_1.isOptionKeyProvided)('silent')) {
        transpileOptions.silent = (0, getOption_js_1.default)('silent');
    }
    return transpileOptions;
}
// Construct the command string with brace expansion
var runnable = process.platform.startsWith('win') ? 'swc.cmd' : 'swc';
var runnablePath = path_1.default.join("chipper/node_modules/.bin/".concat(runnable));
/**
 * Identify the brands that are available in the brand directory.
 * NOTE: Adding a new brand requires restarting the watch process
 */
function getBrands() {
    var pathForBrand = path_1.default.resolve(__dirname, '../../../brand/');
    var brands = fs_1.default.readdirSync(pathForBrand).filter(function (file) { return fs_1.default.statSync(path_1.default.join(pathForBrand, file)).isDirectory(); });
    var omitDirectories = ['node_modules', '.github', 'js', '.git'];
    var filteredBrands = brands.filter(function (brand) { return !omitDirectories.includes(brand); });
    (0, assert_1.default)(filteredBrands.includes('phet'), 'phet brand is required');
    (0, assert_1.default)(filteredBrands.includes('phet-io'), 'phet-io brand is required');
    (0, assert_1.default)(filteredBrands.includes('adapted-from-phet'), 'adapted-from-phet brand is required');
    return filteredBrands;
}
// Directories in a sim repo that may contain things for transpilation
// This is used for a top-down search in the initial transpilation and for filtering relevant files in the watch process
var getSubdirectories = function (repo) {
    var subdirs = ['js', 'images', 'mipmaps', 'sounds', 'strings'];
    repo === 'phet-io-wrappers' && subdirs.push('common');
    repo === 'phet-io-sim-specific' && subdirs.push('repos');
    repo === 'my-solar-system' && subdirs.push('shaders');
    repo === 'alpenglow' && subdirs.push('wgsl');
    repo === 'sherpa' && subdirs.push('lib');
    repo === 'brand' && subdirs.push.apply(subdirs, getBrands());
    return subdirs.map(function (subdir) { return "".concat(repo, "/").concat(subdir, "/"); });
};
var spawnTranspile = function (repos, live, silent) {
    var argsString = __spreadArray(__spreadArray([
        '--config-file', 'chipper/.swcrc'
    ], lodash_1.default.flatten(repos.map(function (repo) { return getSubdirectories(repo); })), true), [
        '-d', 'chipper/dist/js/'
    ], false);
    // This occurrence of "--watch" is accurate, since it is the terminology used by swc
    live && argsString.push('--watch');
    silent && argsString.push('--quiet');
    var cwd = path_1.default.resolve(__dirname, '../../../');
    return (0, execute_js_1.default)(runnablePath, argsString, cwd, {
        childProcessOptions: {
            stdio: 'inherit'
        }
    });
};
