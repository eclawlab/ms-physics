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
exports.default = buildStandalone;
/**
 * Builds standalone JS deliverables (e.g. dot/kite/scenery)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var getLocalesFromRepository_js_1 = require("./getLocalesFromRepository.js");
var getPhetLibs_js_1 = require("./getPhetLibs.js");
var getStringMap_js_1 = require("./getStringMap.js");
var minify_js_1 = require("./minify.js");
var webpackBuild_js_1 = require("./webpackBuild.js");
/**
 * Builds standalone JS deliverables (e.g. dot/kite/scenery)
 *
 * @param repo
 * @param providedOptions - Passed directly to minify()
 */
function buildStandalone(repo, providedOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var options, packageObject, webpackResult, webpackJS, includedSources, includedJS, testLodash, debugJS, fullSource, globals, subRepos, phetLibs, locales, _a, stringMap, stringMetadata, localeData;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    options = (0, optionize_js_1.default)()({
                        isDebug: false,
                        omitPreloads: null,
                        tempOutputDir: repo,
                        brand: 'phet',
                        profileFileSize: false
                    }, providedOptions);
                    packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
                    (0, assert_1.default)(packageObject.phet, '`phet` object expected in package.json');
                    return [4 /*yield*/, (0, webpackBuild_js_1.default)(repo, options.brand, {
                            outputDir: options.tempOutputDir,
                            profileFileSize: options.profileFileSize
                        })];
                case 1:
                    webpackResult = (_b.sent());
                    webpackJS = webpackResult.js;
                    includedSources = [
                        '../assert/js/assert.js'
                    ];
                    // add repo-specific preloads from package.json
                    if (packageObject.phet.preload) {
                        (0, assert_1.default)(Array.isArray(packageObject.phet.preload), 'preload should be an array');
                        includedSources = includedSources.concat(packageObject.phet.preload);
                        // NOTE: Should find a better way of handling putting these first
                        includedSources.forEach(function (source, index) {
                            if (source.includes('sherpa/lib/lodash-')) {
                                includedSources.splice(index, 1);
                                includedSources.unshift(source);
                            }
                        });
                        includedSources.forEach(function (source, index) {
                            if (source.includes('sherpa/lib/jquery-')) {
                                includedSources.splice(index, 1);
                                includedSources.unshift(source);
                            }
                        });
                    }
                    if (options.omitPreloads) {
                        includedSources = includedSources.filter(function (source) { return !options.omitPreloads.includes(source); });
                    }
                    includedJS = includedSources.map(function (file) { return fs_1.default.readFileSync(file, 'utf8'); }).join('\n');
                    testLodash = '  if ( !window.hasOwnProperty( \'_\' ) ) {\n' +
                        '    throw new Error( \'Underscore/Lodash not found: _\' );\n' +
                        '  }\n';
                    debugJS = '\nwindow.assertions.enableAssert();\n';
                    if (options.isDebug) {
                        includedJS += debugJS;
                    }
                    fullSource = "".concat(includedJS, "\n").concat(webpackJS);
                    if (packageObject.phet.requiresLodash) {
                        fullSource = testLodash + fullSource;
                    }
                    globals = 'window.phet=window.phet||{}\n;';
                    if (packageObject.name === 'phet-lib') {
                        globals += "phet.chipper=phet.chipper||{};\nphet.chipper.packageObject=".concat(JSON.stringify(packageObject), ";\n");
                        subRepos = ['scenery', 'sun', 'scenery-phet', 'twixt', 'mobius'];
                        phetLibs = lodash_1.default.uniq(lodash_1.default.flatten(subRepos.map(function (subRepo) {
                            return (0, getPhetLibs_js_1.default)(subRepo);
                        })).sort());
                        locales = __spreadArray([
                            ChipperConstants_js_1.default.FALLBACK_LOCALE
                        ], lodash_1.default.flatten(subRepos.map(function (subRepo) { return (0, getLocalesFromRepository_js_1.default)(subRepo); })), true);
                        _a = (0, getStringMap_js_1.default)(repo, locales, phetLibs, webpackResult.usedModules), stringMap = _a.stringMap, stringMetadata = _a.stringMetadata;
                        localeData = JSON.parse(fs_1.default.readFileSync('../babel/localeData.json', 'utf8'));
                        globals += 'phet.chipper.stringPath = \'../\';\n';
                        globals += 'phet.chipper.locale = \'en\';\n';
                        globals += 'phet.chipper.loadModules = () => {};\n';
                        globals += "phet.chipper.strings = ".concat(JSON.stringify(stringMap, null, options.isDebug ? 2 : ''), ";\n");
                        globals += "phet.chipper.localeData = ".concat(JSON.stringify(localeData, null, options.isDebug ? 2 : ''), ";\n");
                        globals += "phet.chipper.stringMetadata = ".concat(JSON.stringify(stringMetadata, null, options.isDebug ? 2 : ''), ";\n");
                    }
                    fullSource = "\n".concat(globals, "\n").concat(fullSource);
                    // Wrap with an IIFE
                    fullSource = "(function() {\n".concat(fullSource, "\n}());");
                    fullSource = (0, minify_js_1.default)(fullSource, options);
                    return [2 /*return*/, fullSource];
            }
        });
    });
}
