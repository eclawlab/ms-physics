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
exports.default = default_1;
/**
 * Builds a runnable (something that builds like a simulation)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var jimp_1 = require("jimp");
var lodash_1 = require("lodash");
var zlib_1 = require("zlib");
var affirm_js_1 = require("../../../perennial-alias/js/browser-and-node/affirm.js");
var phetTimingLog_js_1 = require("../../../perennial-alias/js/common/phetTimingLog.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var getLicenseEntry_js_1 = require("../common/getLicenseEntry.js");
var loadFileAsDataURI_js_1 = require("../common/loadFileAsDataURI.js");
var copyDirectory_js_1 = require("./copyDirectory.js");
var copySupplementalPhetioFiles_js_1 = require("./copySupplementalPhetioFiles.js");
var generateThumbnails_js_1 = require("./generateThumbnails.js");
var generateTwitterCard_js_1 = require("./generateTwitterCard.js");
var getA11yViewHTML_js_1 = require("./getA11yViewHTML.js");
var getAllThirdPartyEntries_js_1 = require("./getAllThirdPartyEntries.js");
var getDependencies_js_1 = require("./getDependencies.js");
var getInitializationScript_js_1 = require("./getInitializationScript.js");
var getLocalesFromRepository_js_1 = require("./getLocalesFromRepository.js");
var getPhetLibs_js_1 = require("./getPhetLibs.js");
var getPreloads_js_1 = require("./getPreloads.js");
var getPrunedLocaleData_js_1 = require("./getPrunedLocaleData.js");
var getStringMap_js_1 = require("./getStringMap.js");
var getTitleStringKey_js_1 = require("./getTitleStringKey.js");
var gruntTimingLog_js_1 = require("./gruntTimingLog.js");
var minify_js_1 = require("./minify.js");
var packageRunnable_js_1 = require("./packageRunnable.js");
var packageXHTML_js_1 = require("./packageXHTML.js");
var reportUnusedMedia_js_1 = require("./reportUnusedMedia.js");
var reportUnusedStrings_js_1 = require("./reportUnusedStrings.js");
var webpackBuild_js_1 = require("./webpackBuild.js");
var nodeHtmlEncoder = require('node-html-encoder');
/**
 * Builds a runnable (e.g. a simulation).
 *
 * @param repo
 * @param minifyOptions - see minify.js
 * @param allHTML - If the _all.html file should be generated
 * @param brand
 * @param localesOption - e.g,. '*', 'en,es', etc.
 * @param encodeStringMap
 * @param compressScripts
 * @param profileFileSize
 * @param typeCheck
 */
function default_1(repo, minifyOptions, allHTML, brand, localesOption, encodeStringMap, compressScripts, profileFileSize, typeCheck) {
    return __awaiter(this, void 0, void 0, function () {
        var packageObject, encoder, timestamp, webpackResult, webpackJS, debugMinifyOptions, usedModules, licenseEntries, phetLibs, allLocales, locales, dependencies, dependencyReps, version, thirdPartyEntries, simTitleStringKey, _a, stringMap, stringMetadata, _i, locales_1, locale, englishTitle, htmlHeader, startupScripts, minifiableScripts, productionScripts, debugScripts, licenseScript, commonInitializationOptions, buildDir, _b, locales_2, locale, initializationScript, initializationScript, allHTMLFilename, allHTMLContents, debugInitializationScript, xhtmlDir, xhtmlInitializationScript, englishTitle_1, iframeTestHtml_1, iframeLocales, a11yHTML, thumbnailSizes, _c, thumbnailSizes_1, size, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var _this = this;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    if (brand === 'phet-io') {
                        (0, affirm_js_1.default)(grunt_js_1.default.file.exists('../phet-io'), 'Aborting the build of phet-io brand since proprietary repositories are not checked out.\nPlease use --brands=={{BRAND}} in the future to avoid this.');
                    }
                    packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
                    encoder = new nodeHtmlEncoder.Encoder('entity');
                    timestamp = new Date().toISOString().split('T').join(' ');
                    timestamp = "".concat(timestamp.substring(0, timestamp.indexOf('.')), " UTC");
                    return [4 /*yield*/, phetTimingLog_js_1.default.startAsync('webpack', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, (0, webpackBuild_js_1.default)(repo, brand, {
                                        profileFileSize: profileFileSize
                                    })];
                            });
                        }); }, {
                            timingCallback: function (time) { return (0, gruntTimingLog_js_1.default)('Webpack build complete', time); }
                        })];
                case 1:
                    webpackResult = _o.sent();
                    webpackJS = wrapProfileFileSize("phet.chipper.runWebpack = function() {".concat(webpackResult.js, "};"), profileFileSize, 'WEBPACK');
                    debugMinifyOptions = brand === 'phet-io' ? {
                        stripAssertions: false,
                        stripLogging: false
                    } : {
                        minify: false
                    };
                    // If turning off minification for the main build, don't minify the debug version also
                    if (!minifyOptions.minify) {
                        debugMinifyOptions.minify = false;
                    }
                    usedModules = webpackResult.usedModules;
                    (0, reportUnusedMedia_js_1.default)(repo, usedModules);
                    licenseEntries = {};
                    ChipperConstants_js_1.default.MEDIA_TYPES.forEach(function (mediaType) {
                        licenseEntries[mediaType] = {};
                    });
                    usedModules.forEach(function (module) {
                        ChipperConstants_js_1.default.MEDIA_TYPES.forEach(function (mediaType) {
                            if (module.split('/')[1] === mediaType) {
                                // The file suffix is stripped and restored to its non-js extension. This is because getLicenseEntry doesn't
                                // handle modulified media files.
                                var index = module.lastIndexOf('_');
                                var path = "".concat(module.slice(0, index), ".").concat(module.slice(index + 1, -3));
                                // TODO: More specific object type, see https://github.com/phetsims/chipper/issues/1538
                                // @ts-expect-error https://github.com/phetsims/chipper/issues/1538
                                licenseEntries[mediaType][module] = (0, getLicenseEntry_js_1.default)("../".concat(path));
                            }
                        });
                    });
                    phetLibs = (0, getPhetLibs_js_1.default)(repo, brand);
                    allLocales = __spreadArray([ChipperConstants_js_1.default.FALLBACK_LOCALE], (0, getLocalesFromRepository_js_1.default)(repo), true);
                    locales = localesOption === '*' ? allLocales : localesOption.split(',');
                    return [4 /*yield*/, (0, getDependencies_js_1.default)(repo)];
                case 2:
                    dependencies = _o.sent();
                    dependencyReps = Object.keys(dependencies);
                    // on Windows, paths are reported with a backslash, normalize to forward slashes so this works everywhere
                    usedModules.map(function (module) { return module.split('\\').join('/'); }).forEach(function (moduleDependency) {
                        var _a;
                        // The first part of the path is the repo.  Or if no directory is specified, the file is in the sim repo.
                        var pathSeparatorIndex = moduleDependency.indexOf('/');
                        var moduleRepo = pathSeparatorIndex >= 0 ? moduleDependency.slice(0, pathSeparatorIndex) :
                            repo;
                        assert_1.default && (0, assert_1.default)(dependencyReps.includes(moduleRepo), "repo ".concat(moduleRepo, " missing from package.json's phetLibs for ").concat(moduleDependency));
                        // Also check if the module was coming from chipper dist
                        if (moduleDependency.includes('chipper/dist/js/')) {
                            var distRepo = (_a = moduleDependency.split('chipper/dist/js/')[1]) === null || _a === void 0 ? void 0 : _a.split('/')[0];
                            distRepo && assert_1.default && (0, assert_1.default)(dependencyReps.includes(distRepo), "repo ".concat(distRepo, " missing from package.json's phetLibs for ").concat(moduleDependency));
                        }
                    });
                    version = packageObject.version;
                    thirdPartyEntries = (0, getAllThirdPartyEntries_js_1.default)(repo, brand, licenseEntries);
                    simTitleStringKey = (0, getTitleStringKey_js_1.default)(repo);
                    _a = (0, getStringMap_js_1.default)(repo, allLocales, phetLibs, webpackResult.usedModules), stringMap = _a.stringMap, stringMetadata = _a.stringMetadata;
                    // After our string map is constructed, report which of the translatable strings are unused.
                    (0, reportUnusedStrings_js_1.default)(repo, packageObject.phet.requirejsNamespace, stringMap[ChipperConstants_js_1.default.FALLBACK_LOCALE]);
                    // If we have NO strings for a given locale that we want, we'll need to fill it in with all English strings, see
                    // https://github.com/phetsims/perennial/issues/83
                    for (_i = 0, locales_1 = locales; _i < locales_1.length; _i++) {
                        locale = locales_1[_i];
                        if (!stringMap[locale]) {
                            stringMap[locale] = stringMap[ChipperConstants_js_1.default.FALLBACK_LOCALE];
                        }
                    }
                    englishTitle = stringMap[ChipperConstants_js_1.default.FALLBACK_LOCALE][simTitleStringKey];
                    assert_1.default && (0, assert_1.default)(englishTitle, "missing entry for sim title, key = ".concat(simTitleStringKey));
                    if (brand === 'phet-io') {
                        // iO License from https://github.com/phetsims/special-ops/issues/318
                        htmlHeader = "".concat(englishTitle, " ").concat(version, "\n") +
                            'PhET Interactive Simulations, University of Colorado Boulder\n' +
                            "Copyright 2002-".concat(grunt_js_1.default.template.today('yyyy'), " Regents of the University of Colorado\n") +
                            '\n' +
                            'Use of this PhET-iO interoperable simulation file requires a license from the University of Colorado Boulder.\n' +
                            '\n' +
                            'USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.\n' +
                            'For information on commercial licensing, see https://phet.colorado.edu/en/licensing\n' +
                            '\n' +
                            'The PhET name, PhET logo, PhET-iO name, and PhET-iO logos are trademarks of The Regents of the University of Colorado, a body corporate. Use of the PhET and/or PhET-iO name and/or logo for any purpose, including but not limited to promotional, marketing, or advertising purposes, requires a separate license agreement from the University of Colorado Boulder.\n' +
                            'For information on brand use, see https://phet.colorado.edu/en/licensing\n' +
                            '\n' +
                            'For licenses for third-party software used by this simulation, see below\n';
                    }
                    else {
                        // CC BY-NC License from https://github.com/phetsims/special-ops/issues/318
                        htmlHeader = "".concat(englishTitle, " ").concat(version, "\n") +
                            'PhET Interactive Simulations, University of Colorado Boulder\n' +
                            "Copyright 2002-".concat(grunt_js_1.default.template.today('yyyy'), " Regents of the University of Colorado\n") +
                            '\n' +
                            'This file is licensed under Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0). https://creativecommons.org/licenses/by-nc/4.0/\n' +
                            'Attribution is required near point of use, recommended attribution is: Simulation by PhET Interactive Simulations, University of Colorado Boulder, licensed under CC BY-NC 4.0 (https://phet.colorado.edu).\n' +
                            '\n' +
                            'COMMERCIAL USE REQUIRES A COMMERCIAL LICENSE AGREEMENT FROM THE UNIVERSITY OF COLORADO BOULDER.\n' +
                            'For information on commercial licensing, see https://phet.colorado.edu/en/licensing\n' +
                            '\n' +
                            'The PhET name and PhET logo are registered trademarks of The Regents of the University of Colorado. Use of the PhET name and/or PhET logo for any purpose, including but not limited to promotional, marketing, or advertising purposes, requires a separate license agreement from the University of Colorado Boulder.\n' +
                            'For information on brand use, see https://phet.colorado.edu/en/licensing\n' +
                            '\n' +
                            'For licenses for third-party software used by this simulation, see below';
                    }
                    startupScripts = [
                        // Splash image
                        wrapProfileFileSize("window.PHET_SPLASH_DATA_URI=\"".concat((0, loadFileAsDataURI_js_1.default)("../brand/".concat(brand, "/images/splash.svg")), "\";"), profileFileSize, 'SPLASH')
                    ];
                    minifiableScripts = __spreadArray(__spreadArray([], (0, getPreloads_js_1.default)(repo, brand, true).map(function (filename) { return wrapProfileFileSize(grunt_js_1.default.file.read(filename), profileFileSize, 'PRELOAD', filename); }), true), [
                        // Our main module content, wrapped in a function called in the startup below
                        webpackJS,
                        // Main startup
                        wrapProfileFileSize(grunt_js_1.default.file.read('../chipper/templates/chipper-startup.js'), profileFileSize, 'STARTUP')
                    ], false);
                    return [4 /*yield*/, phetTimingLog_js_1.default.startAsync('minify-production', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, __spreadArray(__spreadArray([], startupScripts, true), minifiableScripts.map(function (js) { return (0, minify_js_1.default)(js, minifyOptions); }), true)];
                            });
                        }); }, {
                            timingCallback: function (time, scripts) { return (0, gruntTimingLog_js_1.default)('Production minify complete', time, lodash_1.default.sum(scripts.map(function (js) { return js.length; }))); }
                        })];
                case 3:
                    productionScripts = _o.sent();
                    return [4 /*yield*/, phetTimingLog_js_1.default.startAsync('minify-debug', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, __spreadArray(__spreadArray([], startupScripts, true), minifiableScripts.map(function (js) { return (0, minify_js_1.default)(js, debugMinifyOptions); }), true)];
                            });
                        }); }, {
                            timingCallback: function (time, scripts) { return (0, gruntTimingLog_js_1.default)('Debug minify complete', time, lodash_1.default.sum(scripts.map(function (js) { return js.length; }))); }
                        })];
                case 4:
                    debugScripts = _o.sent();
                    licenseScript = wrapProfileFileSize(ChipperStringUtils_js_1.default.replacePlaceholders(grunt_js_1.default.file.read('../chipper/templates/license-initialization.js'), {
                        PHET_START_THIRD_PARTY_LICENSE_ENTRIES: ChipperConstants_js_1.default.START_THIRD_PARTY_LICENSE_ENTRIES,
                        PHET_THIRD_PARTY_LICENSE_ENTRIES: JSON.stringify(thirdPartyEntries, null, 2),
                        PHET_END_THIRD_PARTY_LICENSE_ENTRIES: ChipperConstants_js_1.default.END_THIRD_PARTY_LICENSE_ENTRIES
                    }), profileFileSize, 'LICENSE');
                    commonInitializationOptions = {
                        brand: brand,
                        repo: repo,
                        localeData: (0, getPrunedLocaleData_js_1.default)(allLocales),
                        stringMap: stringMap,
                        stringMetadata: stringMetadata,
                        dependencies: dependencies,
                        timestamp: timestamp,
                        version: version,
                        packageObject: packageObject,
                        allowLocaleSwitching: false,
                        encodeStringMap: encodeStringMap,
                        profileFileSize: profileFileSize,
                        wrapStringsJS: function (stringsJS) { return wrapProfileFileSize(stringsJS, profileFileSize, 'STRINGS'); }
                    };
                    buildDir = "../".concat(repo, "/build/").concat(brand);
                    fs_1.default.mkdirSync(buildDir, { recursive: true });
                    // {{locale}}.html
                    if (brand !== 'phet-io') {
                        for (_b = 0, locales_2 = locales; _b < locales_2.length; _b++) {
                            locale = locales_2[_b];
                            initializationScript = (0, getInitializationScript_js_1.default)(lodash_1.default.assignIn({
                                locale: locale,
                                includeAllLocales: false,
                                isDebugBuild: false
                            }, commonInitializationOptions));
                            grunt_js_1.default.file.write("".concat(buildDir, "/").concat(repo, "_").concat(locale, "_").concat(brand, ".html"), (0, packageRunnable_js_1.default)({
                                repo: repo,
                                stringMap: stringMap,
                                htmlHeader: htmlHeader,
                                locale: locale,
                                compressScripts: compressScripts,
                                licenseScript: licenseScript,
                                scripts: __spreadArray([initializationScript], productionScripts, true)
                            }));
                        }
                    }
                    // _all.html (forced for phet-io)
                    if (allHTML || brand === 'phet-io') {
                        initializationScript = (0, getInitializationScript_js_1.default)(lodash_1.default.assignIn({
                            locale: ChipperConstants_js_1.default.FALLBACK_LOCALE,
                            includeAllLocales: true,
                            isDebugBuild: false
                        }, commonInitializationOptions, {
                            allowLocaleSwitching: true
                        }));
                        allHTMLFilename = "".concat(buildDir, "/").concat(repo, "_all_").concat(brand, ".html");
                        allHTMLContents = (0, packageRunnable_js_1.default)({
                            repo: repo,
                            stringMap: stringMap,
                            htmlHeader: htmlHeader,
                            locale: ChipperConstants_js_1.default.FALLBACK_LOCALE,
                            compressScripts: compressScripts,
                            licenseScript: licenseScript,
                            scripts: __spreadArray([initializationScript], productionScripts, true)
                        });
                        grunt_js_1.default.file.write(allHTMLFilename, allHTMLContents);
                        // Add a compressed file to improve performance in the iOS app, see https://github.com/phetsims/chipper/issues/746
                        grunt_js_1.default.file.write("".concat(allHTMLFilename, ".gz"), zlib_1.default.gzipSync(allHTMLContents));
                    }
                    debugInitializationScript = (0, getInitializationScript_js_1.default)(lodash_1.default.assignIn({
                        locale: ChipperConstants_js_1.default.FALLBACK_LOCALE,
                        includeAllLocales: true,
                        isDebugBuild: true
                    }, commonInitializationOptions, {
                        allowLocaleSwitching: true
                    }));
                    grunt_js_1.default.file.write("".concat(buildDir, "/").concat(repo, "_all_").concat(brand, "_debug.html"), (0, packageRunnable_js_1.default)({
                        repo: repo,
                        stringMap: stringMap,
                        htmlHeader: htmlHeader,
                        locale: ChipperConstants_js_1.default.FALLBACK_LOCALE,
                        compressScripts: compressScripts,
                        licenseScript: licenseScript,
                        scripts: __spreadArray([debugInitializationScript], debugScripts, true)
                    }));
                    xhtmlDir = "".concat(buildDir, "/xhtml");
                    fs_1.default.mkdirSync(xhtmlDir, { recursive: true });
                    xhtmlInitializationScript = (0, getInitializationScript_js_1.default)(lodash_1.default.assignIn({
                        locale: ChipperConstants_js_1.default.FALLBACK_LOCALE,
                        includeAllLocales: true,
                        isDebugBuild: false
                    }, commonInitializationOptions, {
                        allowLocaleSwitching: true
                    }));
                    (0, packageXHTML_js_1.default)(xhtmlDir, {
                        repo: repo,
                        brand: brand,
                        stringMap: stringMap,
                        htmlHeader: htmlHeader,
                        initializationScript: xhtmlInitializationScript,
                        licenseScript: licenseScript,
                        scripts: productionScripts
                    });
                    // dependencies.json
                    grunt_js_1.default.file.write("".concat(buildDir, "/dependencies.json"), JSON.stringify(dependencies, null, 2));
                    // string-map.json and english-string-map.json, for things like Rosetta that need to know what strings are used
                    grunt_js_1.default.file.write("".concat(buildDir, "/string-map.json"), JSON.stringify(stringMap, null, 2));
                    grunt_js_1.default.file.write("".concat(buildDir, "/english-string-map.json"), JSON.stringify(stringMap.en, null, 2));
                    // -iframe.html (English is assumed as the locale).
                    if (lodash_1.default.includes(locales, ChipperConstants_js_1.default.FALLBACK_LOCALE) && brand === 'phet') {
                        englishTitle_1 = stringMap[ChipperConstants_js_1.default.FALLBACK_LOCALE][(0, getTitleStringKey_js_1.default)(repo)];
                        grunt_js_1.default.log.verbose.writeln('Constructing HTML for iframe testing from template');
                        iframeTestHtml_1 = grunt_js_1.default.file.read('../chipper/templates/sim-iframe.html');
                        iframeTestHtml_1 = ChipperStringUtils_js_1.default.replaceFirst(iframeTestHtml_1, '{{PHET_SIM_TITLE}}', encoder.htmlEncode("".concat(englishTitle_1, " iframe test")));
                        iframeTestHtml_1 = ChipperStringUtils_js_1.default.replaceFirst(iframeTestHtml_1, '{{PHET_REPOSITORY}}', repo);
                        iframeLocales = ['en'].concat(allHTML ? ['all'] : []);
                        iframeLocales.forEach(function (locale) {
                            var iframeHtml = ChipperStringUtils_js_1.default.replaceFirst(iframeTestHtml_1, '{{PHET_LOCALE}}', locale);
                            grunt_js_1.default.file.write("".concat(buildDir, "/").concat(repo, "_").concat(locale, "_iframe_phet.html"), iframeHtml);
                        });
                    }
                    // If the sim is a11y outfitted, then add the a11y pdom viewer to the build dir. NOTE: Not for phet-io builds.
                    if (packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsInteractiveDescription && brand === 'phet') {
                        a11yHTML = (0, getA11yViewHTML_js_1.default)(repo);
                        // this replaceAll is outside of the getA11yViewHTML because we only want it filled in during the build
                        a11yHTML = ChipperStringUtils_js_1.default.replaceAll(a11yHTML, '{{IS_BUILT}}', 'true');
                        grunt_js_1.default.file.write("".concat(buildDir, "/").concat(repo).concat(ChipperConstants_js_1.default.A11Y_VIEW_HTML_SUFFIX), a11yHTML);
                    }
                    // copy over supplemental files or dirs to package with the build. Only supported in phet brand
                    if (packageObject.phet && packageObject.phet.packageWithBuild) {
                        assert_1.default && (0, assert_1.default)(Array.isArray(packageObject.phet.packageWithBuild));
                        packageObject.phet.packageWithBuild.forEach(function (path) {
                            // eslint-disable-next-line phet/no-simple-type-checking-assertions
                            assert_1.default && (0, assert_1.default)(typeof path === 'string', 'path should be a string');
                            assert_1.default && (0, assert_1.default)(grunt_js_1.default.file.exists(path), "path does not exist: ".concat(path));
                            if (grunt_js_1.default.file.isDir(path)) {
                                (0, copyDirectory_js_1.default)(path, "".concat(buildDir, "/").concat(path));
                            }
                            else {
                                grunt_js_1.default.file.copy(path, "".concat(buildDir, "/").concat(path));
                            }
                        });
                    }
                    if (!(brand === 'phet-io')) return [3 /*break*/, 6];
                    return [4 /*yield*/, phetTimingLog_js_1.default.startAsync('phet-io-sub-build', function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, copySupplementalPhetioFiles_js_1.default)(repo, version, englishTitle, packageObject, true, typeCheck)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, {
                            timingCallback: function (time) { return (0, gruntTimingLog_js_1.default)('PhET-iO artifacts complete', time); }
                        })];
                case 5:
                    _o.sent();
                    _o.label = 6;
                case 6:
                    if (!grunt_js_1.default.file.exists("../".concat(repo, "/assets/").concat(repo, "-screenshot.png"))) return [3 /*break*/, 13];
                    thumbnailSizes = [
                        { width: 128, height: 84 },
                        { width: 600, height: 394 }
                    ];
                    _c = 0, thumbnailSizes_1 = thumbnailSizes;
                    _o.label = 7;
                case 7:
                    if (!(_c < thumbnailSizes_1.length)) return [3 /*break*/, 10];
                    size = thumbnailSizes_1[_c];
                    _e = (_d = grunt_js_1.default.file).write;
                    _f = ["".concat(buildDir, "/").concat(repo, "-").concat(size.width, ".png")];
                    return [4 /*yield*/, (0, generateThumbnails_js_1.default)(repo, size.width, size.height, 100, jimp_1.default.MIME_PNG)];
                case 8:
                    _e.apply(_d, _f.concat([_o.sent()]));
                    _o.label = 9;
                case 9:
                    _c++;
                    return [3 /*break*/, 7];
                case 10:
                    if (!(brand === 'phet')) return [3 /*break*/, 13];
                    _h = (_g = grunt_js_1.default.file).write;
                    _j = ["".concat(buildDir, "/").concat(repo, "-ios.png")];
                    return [4 /*yield*/, (0, generateThumbnails_js_1.default)(repo, 420, 276, 90, jimp_1.default.MIME_JPEG)];
                case 11:
                    _h.apply(_g, _j.concat([_o.sent()]));
                    _l = (_k = grunt_js_1.default.file).write;
                    _m = ["".concat(buildDir, "/").concat(repo, "-twitter-card.png")];
                    return [4 /*yield*/, (0, generateTwitterCard_js_1.default)(repo)];
                case 12:
                    _l.apply(_k, _m.concat([_o.sent()]));
                    _o.label = 13;
                case 13: return [2 /*return*/];
            }
        });
    });
}
// For profiling file size. Name is optional
var wrapProfileFileSize = function (string, profileFileSize, type, name) {
    if (profileFileSize) {
        var conditionalName = name ? ",\"".concat(name, "\"") : '';
        return "console.log(\"START_".concat(type.toUpperCase(), "\"").concat(conditionalName, ");\n").concat(string, "\nconsole.log(\"END_").concat(type.toUpperCase(), "\"").concat(conditionalName, ");\n\n");
    }
    else {
        return string;
    }
};
