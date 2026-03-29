"use strict";
// Copyright 2016-2025, University of Colorado Boulder
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
 * Copies all supporting PhET-iO files, including wrappers, indices, lib files, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Matt Pennington (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var SimVersion_js_1 = require("../../../perennial-alias/js/browser-and-node/SimVersion.js");
var dirname_js_1 = require("../../../perennial-alias/js/common/dirname.js");
var execute_js_1 = require("../../../perennial-alias/js/common/execute.js");
var typeCheck_js_1 = require("../../../perennial-alias/js/grunt/typeCheck.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var copyDirectory_js_1 = require("../grunt/copyDirectory.js");
var minify_js_1 = require("../grunt/minify.js");
var formatPhetioAPI_js_1 = require("../phet-io/formatPhetioAPI.js");
var generatePhetioMacroAPI_js_1 = require("../phet-io/generatePhetioMacroAPI.js");
var buildStandalone_js_1 = require("./buildStandalone.js");
var getPhetLibs_js_1 = require("./getPhetLibs.js");
var webpackBuild_js_1 = require("./webpackBuild.js");
var webpack = require('webpack');
var archiver = require('archiver');
var marked = require('marked');
// @ts-expect-error - until we have "type": "module" in our package.json
var __dirname = (0, dirname_js_1.default)(import.meta.url);
// constants
var DEDICATED_REPO_WRAPPER_PREFIX = 'phet-io-wrapper-';
var WRAPPER_COMMON_FOLDER = 'phet-io-wrappers/common';
var WRAPPERS_FOLDER = 'wrappers/'; // The wrapper index assumes this constant, please see phet-io-wrappers/index/index.js before changing
// For PhET-iO Client Guides
var PHET_IO_SIM_SPECIFIC = '../phet-io-sim-specific';
var GUIDES_COMMON_DIR = 'client-guide-common/client-guide';
var EXAMPLES_FILENAME = 'examples';
var PHET_IO_GUIDE_FILENAME = 'phet-io-guide';
var LIB_OUTPUT_FILE = 'phet-io.js';
// These files are bundled into the lib/phet-io.js file before PhET's phet-io code, and can be used by any wrapper
var THIRD_PARTY_LIB_PRELOADS = [
    '../sherpa/lib/react-18.1.0.production.min.js',
    '../sherpa/lib/react-dom-18.1.0.production.min.js',
    '../sherpa/lib/pako-2.0.3.min.js',
    '../sherpa/lib/lodash-4.17.4.min.js'
];
// phet-io internal files to be consolidated into 1 file and publicly served as a minified phet-io library.
// Make sure to add new files to the jsdoc generation list below also
var PHET_IO_LIB_PRELOADS = [
    '../query-string-machine/js/QueryStringMachine.js', // must be first, other types use this
    '../assert/js/assert.js'
];
var LIB_PRELOADS = THIRD_PARTY_LIB_PRELOADS.concat(PHET_IO_LIB_PRELOADS);
// Additional libraries and third party files that are used by some phet-io wrappers, copied to a contrib/ directory.
// These are not bundled with the lib file to reduce the size of the central dependency of PhET-iO wrappers.
var CONTRIB_FILES = [
    '../sherpa/lib/ua-parser-0.7.21.min.js',
    '../sherpa/lib/bootstrap-2.2.2.js',
    '../sherpa/lib/font-awesome-4.5.0',
    '../sherpa/lib/jquery-2.1.0.min.js',
    '../sherpa/lib/jquery-ui-1.8.24.min.js',
    '../sherpa/lib/d3-4.2.2.js',
    '../sherpa/lib/jsondiffpatch-v0.3.11.umd.js',
    '../sherpa/lib/jsondiffpatch-v0.3.11-annotated.css',
    '../sherpa/lib/jsondiffpatch-v0.3.11-html.css',
    '../sherpa/lib/prism-1.23.0.js',
    '../sherpa/lib/prism-okaidia-1.23.0.css',
    '../sherpa/lib/clarinet-0.12.4.js'
];
// This path is used for jsdoc. Transpilation happens before we get to this point. SR and MK recognize that this feels
// a bit risky, even though comments are currently preserved in the babel transpile step. See https://stackoverflow.com/questions/51720894/is-there-any-way-to-use-jsdoc-with-ts-files-maybe-transpile-with-babel-the
var transpiledClientPath = "../chipper/dist/js/".concat(WRAPPER_COMMON_FOLDER, "/js/Client.js");
// List of files to run jsdoc generation with. This list is manual to keep files from sneaking into the public documentation.
var JSDOC_FILES = [
    "../chipper/dist/js/".concat(WRAPPER_COMMON_FOLDER, "/js/PhetioClient.js"),
    transpiledClientPath,
    '../chipper/dist/js/tandem/js/PhetioIDUtils.js',
    '../phet-io/js/phet-io-initialize-globals.js',
    '../chipper/js/browser/initialize-globals.js',
    '../chipper/dist/js/perennial-alias/js/browser-and-node/SimVersion.js'
];
var JSDOC_README_FILE = '../phet-io/doc/wrapper/phet-io-documentation_README.md';
var STUDIO_BUILT_FILENAME = 'studio.min.js';
exports.default = (function (repo_1, version_1, simulationDisplayName_1, packageObject_1) {
    var args_1 = [];
    for (var _i = 4; _i < arguments.length; _i++) {
        args_1[_i - 4] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([repo_1, version_1, simulationDisplayName_1, packageObject_1], args_1, true), void 0, function (repo, version, simulationDisplayName, packageObject, generateMacroAPIFile, typeCheck) {
        var repoPhetLibs, simRepoSHA, buildDir, wrappersLocation, simVersion, latestVersion, standardPhetioWrapperTemplateSkeleton, customPhetioWrapperTemplateSkeleton, filterWrapper, wrappers, wrappersUnallowed, libFileNames, fullUnallowedList, copyWrapper, simSpecificWrappersPath, simSpecificWrappers, phetioPackageBlock, additionalWrappers, wrapperNames, fullAPI;
        if (generateMacroAPIFile === void 0) { generateMacroAPIFile = false; }
        if (typeCheck === void 0) { typeCheck = true; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    repoPhetLibs = (0, getPhetLibs_js_1.default)(repo, 'phet-io');
                    (0, assert_1.default)(lodash_1.default.every((0, getPhetLibs_js_1.default)('phet-io-wrappers'), function (repo) { return repoPhetLibs.includes(repo); }), 'every dependency of phet-io-wrappers is not included in phetLibs of ' + repo + ' ' + repoPhetLibs + ' ' + (0, getPhetLibs_js_1.default)('phet-io-wrappers'));
                    (0, assert_1.default)(lodash_1.default.every((0, getPhetLibs_js_1.default)('studio'), function (repo) { return repoPhetLibs.includes(repo); }), 'every dependency of studio is not included in phetLibs of ' + repo + ' ' + repoPhetLibs + ' ' + (0, getPhetLibs_js_1.default)('studio'));
                    // This must be checked after copySupplementalPhetioFiles is called, since all the imports and outer code is run in
                    // every brand. Developers without phet-io checked out still need to be able to build.
                    (0, assert_1.default)(fs_1.default.readFileSync(transpiledClientPath).toString().includes('/**'), 'babel should not strip comments from transpiling');
                    return [4 /*yield*/, (0, execute_js_1.default)('git', ['rev-parse', 'HEAD'], "../".concat(repo))];
                case 1:
                    simRepoSHA = (_a.sent()).trim();
                    buildDir = "../".concat(repo, "/build/phet-io/");
                    wrappersLocation = "".concat(buildDir).concat(WRAPPERS_FOLDER);
                    simVersion = SimVersion_js_1.default.parse(version);
                    latestVersion = "".concat(simVersion.major, ".").concat(simVersion.minor);
                    standardPhetioWrapperTemplateSkeleton = fs_1.default.readFileSync('../phet-io-wrappers/common/html/standardPhetioWrapperTemplateSkeleton.html', 'utf8');
                    customPhetioWrapperTemplateSkeleton = fs_1.default.readFileSync('../phet-io-wrappers/common/html/customPhetioWrapperTemplateSkeleton.html', 'utf8');
                    (0, assert_1.default)(!standardPhetioWrapperTemplateSkeleton.includes('`'), 'The templates cannot contain backticks due to how the templates are passed through below');
                    (0, assert_1.default)(!customPhetioWrapperTemplateSkeleton.includes('`'), 'The templates cannot contain backticks due to how the templates are passed through below');
                    filterWrapper = function (absPath, contents) {
                        var originalContents = "".concat(contents);
                        var isWrapperIndex = absPath.includes('index/index.html');
                        // For info about LIB_OUTPUT_FILE, see handleLib()
                        var pathToLib = "lib/".concat(LIB_OUTPUT_FILE);
                        // Sim specific wrappers need to support shared resources. See https://github.com/phetsims/phet-io-sim-specific/issues/45
                        if (/phet-io-sim-specific\/repos\/[\w-]+\/wrappers\//.test(absPath)) {
                            contents = contents.replace(/(\.\.\/){4}phet-io-wrappers\/common\//g, 'common/');
                        }
                        if (absPath.includes('.html')) {
                            // change the paths of sherpa files to point to the contrib/ folder
                            CONTRIB_FILES.forEach(function (filePath) {
                                // No need to do this is this file doesn't have this contrib import in it.
                                if (contents.includes(filePath)) {
                                    var filePathParts = filePath.split('/');
                                    // If the file is in a dedicated wrapper repo, then it is one level higher in the dir tree, and needs 1 less set of dots.
                                    // see https://github.com/phetsims/phet-io-wrappers/issues/17 for more info. This is hopefully a temporary workaround
                                    var needsExtraDots = absPath.includes(DEDICATED_REPO_WRAPPER_PREFIX);
                                    var fileName = filePathParts[filePathParts.length - 1];
                                    var contribFileName = "contrib/".concat(fileName);
                                    var pathToContrib = needsExtraDots ? "../../".concat(contribFileName) : "../".concat(contribFileName);
                                    // The wrapper index is a different case because it is placed at the top level of the build dir.
                                    if (isWrapperIndex) {
                                        pathToContrib = contribFileName;
                                        filePath = "../".concat(filePath); // filePath has one less set of relative than are actually in the index.html file.
                                    }
                                    contents = ChipperStringUtils_js_1.default.replaceAll(contents, filePath, pathToContrib);
                                }
                            });
                            var includesElement_1 = function (line, array) { return !!array.find(function (element) { return line.includes(element); }); };
                            // Remove files listed as preloads to the phet-io lib file.
                            contents = contents.split(/\r?\n/).filter(function (line) { return !includesElement_1(line, LIB_PRELOADS); }).join('\n');
                            // Delete the imports the phet-io-wrappers-main, as it will be bundled with the phet-io.js lib file.
                            // MUST GO BEFORE BELOW REPLACE: 'phet-io-wrappers/' -> '/'
                            contents = contents.replace(/<script type="module" src="(..\/)+chipper\/dist\/js\/phet-io-wrappers\/js\/phet-io-wrappers-main.js"><\/script>/g, // '.*' is to support `data-phet-io-client-name` in wrappers like "multi"
                            '');
                            // Support wrappers that use code from phet-io-wrappers
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '/phet-io-wrappers/', '/');
                            // Don't use ChipperStringUtils because we want to capture the relative path and transfer it to the new script.
                            // This is to support providing the relative path through the build instead of just hard coding it.
                            contents = contents.replace(/<!--(<script src="[./]*\{\{PATH_TO_LIB_FILE}}".*><\/script>)-->/g, // '.*' is to support `data-phet-io-client-name` in wrappers like "multi"
                            '$1' // just uncomment, don't fill it in yet
                            );
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '<!--{{GOOGLE_ANALYTICS.js}}-->', '<script src="/assets/js/phet-io-ga.js"></script>');
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '<!--{{FAVICON.ico}}-->', '<link rel="shortcut icon" href="/assets/favicon.ico"/>');
                            // There should not be any imports of PhetioClient directly except using the "multi-wrapper" functionality of
                            // providing a ?clientName, for unbuilt only, so we remove it here.
                            contents = contents.replace(/^.*\/common\/js\/PhetioClient.js.*$/mg, '');
                        }
                        if (absPath.includes('.js') || absPath.includes('.html')) {
                            // Fill these in first so the following lines will also hit the content in these template vars
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{CUSTOM_WRAPPER_SKELETON}}', customPhetioWrapperTemplateSkeleton);
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{STANDARD_WRAPPER_SKELETON}}', standardPhetioWrapperTemplateSkeleton);
                            // The rest
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{PATH_TO_LIB_FILE}}', pathToLib); // This must be after the script replacement that uses this variable above.
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{SIMULATION_NAME}}', repo);
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{SIMULATION_DISPLAY_NAME}}', simulationDisplayName);
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{SIMULATION_DISPLAY_NAME_ESCAPED}}', simulationDisplayName.replace(/'/g, '\\\''));
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{SIMULATION_VERSION_STRING}}', version);
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{SIMULATION_LATEST_VERSION}}', latestVersion);
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{SIMULATION_IS_BUILT}}', 'true');
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{PHET_IO_LIB_RELATIVE_PATH}}', pathToLib);
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{Built API Docs not available in unbuilt mode}}', 'API Docs');
                            // phet-io-wrappers/common will be in the top level of wrappers/ in the build directory
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, "".concat(WRAPPER_COMMON_FOLDER, "/"), 'common/');
                        }
                        if (isWrapperIndex) {
                            var getGuideRowText = function (fileName, linkText, description) {
                                return "<tr>\n        <td><a href=\"doc/guides/".concat(fileName, ".html\">").concat(linkText, "</a>\n        </td>\n        <td>").concat(description, "</td>\n      </tr>");
                            };
                            // The phet-io-guide is not sim-specific, so always create it.
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{PHET_IO_GUIDE_ROW}}', getGuideRowText(PHET_IO_GUIDE_FILENAME, 'PhET-iO Guide', 'Documentation for instructional designers about best practices for simulation customization with PhET-iO Studio.'));
                            var exampleRowContents = fs_1.default.existsSync("".concat(PHET_IO_SIM_SPECIFIC, "/repos/").concat(repo, "/").concat(EXAMPLES_FILENAME, ".md")) ?
                                getGuideRowText(EXAMPLES_FILENAME, 'Examples', 'Provides instructions and the specific phetioIDs for customizing the simulation.') : '';
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{EXAMPLES_ROW}}', exampleRowContents);
                        }
                        // Special handling for studio paths since it is not nested under phet-io-wrappers
                        if (absPath.includes('studio/index.html')) {
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '<script src="../contrib/', '<script src="../../contrib/');
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '<script type="module" src="../chipper/dist/js/studio/js/studio-main.js"></script>', "<script src=\"./".concat(STUDIO_BUILT_FILENAME, "\"></script>"));
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{PHET_IO_GUIDE_LINK}}', "../../doc/guides/".concat(PHET_IO_GUIDE_FILENAME, ".html"));
                            contents = ChipperStringUtils_js_1.default.replaceAll(contents, '{{EXAMPLES_LINK}}', "../../doc/guides/".concat(EXAMPLES_FILENAME, ".html"));
                        }
                        // Collapse >1 blank lines in html files.  This helps as a postprocessing step after removing lines with <script> tags
                        if (absPath.endsWith('.html')) {
                            var lines = contents.split(/\r?\n/);
                            var pruned = [];
                            for (var i = 0; i < lines.length; i++) {
                                if (i >= 1 &&
                                    lines[i - 1].trim().length === 0 &&
                                    lines[i].trim().length === 0) {
                                    // skip redundant blank line
                                }
                                else {
                                    pruned.push(lines[i]);
                                }
                            }
                            contents = pruned.join('\n');
                        }
                        if (contents !== originalContents) {
                            return contents;
                        }
                        else {
                            return null; // signify no change (helps for images)
                        }
                    };
                    wrappers = fs_1.default.readFileSync('../perennial-alias/data/wrappers', 'utf-8').trim().split('\n').map(function (wrappers) { return wrappers.trim(); });
                    wrappersUnallowed = ['.git', 'README.md', '.gitignore', 'node_modules', 'package.json', 'build'];
                    libFileNames = PHET_IO_LIB_PRELOADS.map(function (filePath) {
                        var parts = filePath.split('/');
                        return parts[parts.length - 1];
                    });
                    fullUnallowedList = wrappersUnallowed.concat(libFileNames);
                    copyWrapper = function (src, dest, wrapper, wrapperName) {
                        var wrapperFilterWithNameFilter = function (absPath, contents) {
                            var result = filterWrapper(absPath, contents);
                            // Support loading relative-path resources, like
                            //{ url: '../phet-io-wrapper-my-wrapper/sounds/precipitate-chimes-v1-shorter.mp3' }
                            // -->
                            //{ url: 'wrappers/my-wrapper/sounds/precipitate-chimes-v1-shorter.mp3' }
                            if (wrapper && wrapperName && result) {
                                return ChipperStringUtils_js_1.default.replaceAll(result, "../".concat(wrapper, "/"), "wrappers/".concat(wrapperName, "/"));
                            }
                            return result;
                        };
                        (0, copyDirectory_js_1.default)(src, dest, wrapperFilterWithNameFilter, {
                            exclude: fullUnallowedList,
                            minifyJS: true,
                            minifyOptions: {
                                stripAssertions: false
                            }
                        });
                    };
                    // Make sure to copy the phet-io-wrappers common wrapper code too.
                    wrappers.push(WRAPPER_COMMON_FOLDER);
                    simSpecificWrappersPath = "phet-io-sim-specific/repos/".concat(repo, "/wrappers/");
                    try {
                        simSpecificWrappers = fs_1.default.readdirSync("../".concat(simSpecificWrappersPath), { withFileTypes: true })
                            .filter(function (dirent) { return dirent.isDirectory(); })
                            .map(function (dirent) { return "".concat(simSpecificWrappersPath).concat(dirent.name); });
                    }
                    catch (e) {
                        simSpecificWrappers = [];
                    }
                    wrappers.push.apply(wrappers, simSpecificWrappers);
                    phetioPackageBlock = packageObject.phet && packageObject.phet['phet-io'];
                    additionalWrappers = (phetioPackageBlock === null || phetioPackageBlock === void 0 ? void 0 : phetioPackageBlock.wrappers) || [];
                    // phet-io-sim-specific wrappers are automatically added above
                    wrappers.push.apply(wrappers, additionalWrappers.filter(function (x) { return !x.includes(simSpecificWrappersPath); }));
                    wrapperNames = wrappers.map(function (wrapper) {
                        var wrapperParts = wrapper.split('/');
                        // either take the last path part, or take the first (repo name) and remove the wrapper prefix
                        return wrapperParts.length > 1 ? wrapperParts[wrapperParts.length - 1] : wrapperParts[0].replace(DEDICATED_REPO_WRAPPER_PREFIX, '');
                    });
                    wrappers.forEach(function (wrapper, i) {
                        var wrapperName = wrapperNames[i];
                        // Copy the wrapper into the build dir /wrappers/, exclude the excluded list
                        copyWrapper("../".concat(wrapper), "".concat(wrappersLocation).concat(wrapperName), wrapper, wrapperName);
                    });
                    (0, assert_1.default)(lodash_1.default.uniq(wrapperNames).length === wrapperNames.length, "wrapper name is duplicated: ".concat(wrapperNames));
                    if (phetioPackageBlock === null || phetioPackageBlock === void 0 ? void 0 : phetioPackageBlock.publicWrappers) {
                        phetioPackageBlock.publicWrappers.forEach(function (publicWrapper) {
                            (0, assert_1.default)(wrapperNames.includes(publicWrapper), "publicWrapper listed but does not exist:".concat(publicWrapper));
                        });
                    }
                    // Copy the wrapper index into the top level of the build dir, exclude the excluded list
                    copyWrapper('../phet-io-wrappers/index', "".concat(buildDir), null, null);
                    // Create the lib file that is minified and publicly available under the /lib folder of the build
                    return [4 /*yield*/, handleLib(repo, buildDir, typeCheck, filterWrapper)];
                case 2:
                    // Create the lib file that is minified and publicly available under the /lib folder of the build
                    _a.sent();
                    // Create the zipped file that holds all needed items to run PhET-iO offline. NOTE: this must happen after copying wrapper
                    return [4 /*yield*/, handleOfflineArtifact(buildDir, repo, version)];
                case 3:
                    // Create the zipped file that holds all needed items to run PhET-iO offline. NOTE: this must happen after copying wrapper
                    _a.sent();
                    // Create the contrib folder and add to it third party libraries used by wrappers.
                    handleContrib(buildDir);
                    // Create the rendered jsdoc in the `doc` folder
                    return [4 /*yield*/, handleJSDOC(buildDir)];
                case 4:
                    // Create the rendered jsdoc in the `doc` folder
                    _a.sent();
                    // create the client guides
                    handleClientGuides(repo, simulationDisplayName, buildDir, version, simRepoSHA);
                    return [4 /*yield*/, handleStudio(repo, wrappersLocation, typeCheck)];
                case 5:
                    _a.sent();
                    if (!generateMacroAPIFile) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, generatePhetioMacroAPI_js_1.default)([repo], {
                            fromBuiltVersion: true,
                            workers: 1
                        })];
                case 6:
                    fullAPI = (_a.sent())[repo];
                    (0, assert_1.default)(fullAPI, 'Full API expected but not created from puppeteer step, likely caused by https://github.com/phetsims/chipper/issues/1022.');
                    grunt_js_1.default.file.write("".concat(buildDir).concat(repo, "-phet-io-api.json"), (0, formatPhetioAPI_js_1.default)(fullAPI));
                    _a.label = 7;
                case 7:
                    // The nested index wrapper will be broken on build, so get rid of it for clarity
                    fs_1.default.rmSync("".concat(wrappersLocation, "index/"), { recursive: true });
                    return [2 /*return*/];
            }
        });
    });
});
/**
 * Given the list of lib files, apply a filter function to them. Then minify them and consolidate into a single string.
 * Finally, write them to the build dir with a license prepended. See https://github.com/phetsims/phet-io/issues/353

 * @param repo
 * @param buildDir
 * @param typeCheck
 * @param filter - the filter function used when copying over wrapper files to fix relative paths and such.
 *                            Has arguments like "function(absPath, contents)"
 */
var handleLib = function (repo, buildDir, shouldTypeCheck, filter) { return __awaiter(void 0, void 0, void 0, function () {
    var phetioLibCode, migrationProcessorsCode, minifiedPhetioCode, success, wrappersMain, filteredMain, mainCopyright;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                grunt_js_1.default.log.verbose.writeln("Creating phet-io lib file from: ".concat(PHET_IO_LIB_PRELOADS.join(', ')));
                fs_1.default.mkdirSync("".concat(buildDir, "lib"), { recursive: true });
                phetioLibCode = PHET_IO_LIB_PRELOADS.map(function (libFile) {
                    var contents = grunt_js_1.default.file.read(libFile);
                    var filteredContents = filter(libFile, contents);
                    // The filter returns null if nothing changes
                    return filteredContents || contents;
                }).join('');
                return [4 /*yield*/, getCompiledMigrationProcessors(repo, buildDir)];
            case 1:
                migrationProcessorsCode = _a.sent();
                minifiedPhetioCode = (0, minify_js_1.default)("".concat(phetioLibCode, "\n").concat(migrationProcessorsCode), { stripAssertions: false });
                if (!shouldTypeCheck) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, typeCheck_js_1.default)({ repo: 'phet-io-wrappers' })];
            case 2:
                success = _a.sent();
                if (!success) {
                    throw new Error('Type checking failed');
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, (0, buildStandalone_js_1.default)('phet-io-wrappers', {
                    stripAssertions: false,
                    stripLogging: false,
                    tempOutputDir: repo,
                    brand: 'phet-io',
                    // Avoid getting a 2nd copy of the files that are already bundled into the lib file
                    omitPreloads: THIRD_PARTY_LIB_PRELOADS
                })];
            case 4:
                wrappersMain = _a.sent();
                // In loadWrapperTemplate in unbuilt mode, it uses readFile to dynamically load the templates at runtime.
                // In built mode, we must inline the templates into the build artifact. See loadWrapperTemplate.js
                (0, assert_1.default)(wrappersMain.includes('"{{STANDARD_WRAPPER_SKELETON}}"') || wrappersMain.includes('\'{{STANDARD_WRAPPER_SKELETON}}\''), 'Template variable is missing: STANDARD_WRAPPER_SKELETON');
                (0, assert_1.default)(wrappersMain.includes('"{{CUSTOM_WRAPPER_SKELETON}}"') || wrappersMain.includes('\'{{CUSTOM_WRAPPER_SKELETON}}\''), 'Template variable is missing: CUSTOM_WRAPPER_SKELETON');
                // Robustly handle double or single quotes.  At the moment it is double quotes.
                // buildStandalone will mangle a template string into "" because it hasn't been filled in yet, bring it back here (with
                // support for it changing in the future from double to single quotes).
                wrappersMain = wrappersMain.replace('"{{STANDARD_WRAPPER_SKELETON}}"', '`{{STANDARD_WRAPPER_SKELETON}}`');
                wrappersMain = wrappersMain.replace('\'{{STANDARD_WRAPPER_SKELETON}}\'', '`{{STANDARD_WRAPPER_SKELETON}}`');
                wrappersMain = wrappersMain.replace('"{{CUSTOM_WRAPPER_SKELETON}}"', '`{{CUSTOM_WRAPPER_SKELETON}}`');
                wrappersMain = wrappersMain.replace('\'{{CUSTOM_WRAPPER_SKELETON}}\'', '`{{CUSTOM_WRAPPER_SKELETON}}`');
                filteredMain = filter(LIB_OUTPUT_FILE, wrappersMain);
                mainCopyright = "// Copyright 2002-".concat(new Date().getFullYear(), ", University of Colorado Boulder\n// This PhET-iO file requires a license\n// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.\n// For licensing, please contact phethelp@colorado.edu");
                grunt_js_1.default.file.write("".concat(buildDir, "lib/").concat(LIB_OUTPUT_FILE), "".concat(mainCopyright, "\n//\n// Contains additional code under the specified licenses:\n\n").concat(THIRD_PARTY_LIB_PRELOADS.map(function (contribFile) { return grunt_js_1.default.file.read(contribFile); }).join('\n\n'), "\n\n").concat(mainCopyright, "\n\n").concat(minifiedPhetioCode, "\n").concat(filteredMain));
                return [2 /*return*/];
        }
    });
}); };
/**
 * Copy all the third party libraries from sherpa to the build directory under the 'contrib' folder.
 */
var handleContrib = function (buildDir) {
    grunt_js_1.default.log.verbose.writeln('Creating phet-io contrib folder');
    CONTRIB_FILES.forEach(function (filePath) {
        var filePathParts = filePath.split('/');
        var filename = filePathParts[filePathParts.length - 1];
        grunt_js_1.default.file.copy(filePath, "".concat(buildDir, "contrib/").concat(filename));
    });
};
/**
 * Combine the files necessary to run and host PhET-iO locally into a zip that can be easily downloaded by the client.
 * This does not include any documentation, or wrapper suite wrapper examples.
 */
var handleOfflineArtifact = function (buildDir, repo, version) { return __awaiter(void 0, void 0, void 0, function () {
    var output, archive;
    return __generator(this, function (_a) {
        output = fs_1.default.createWriteStream("".concat(buildDir).concat(repo, "-phet-io-").concat(version, ".zip"));
        archive = archiver('zip');
        archive.on('error', function (err) { throw new Error("error creating archive: ".concat(err)); });
        archive.pipe(output);
        // copy over the lib directory and its contents, and an index to test. Note that these use the files from the buildDir
        // because they have been post-processed and contain filled in template vars.
        archive.directory("".concat(buildDir, "lib"), 'lib');
        // Take from build directory so that it has been filtered/mapped to correct paths.
        archive.file("".concat(buildDir).concat(WRAPPERS_FOLDER, "/common/html/offline-example.html"), { name: 'index.html' });
        // get the all html and the debug version too, use `cwd` so that they are at the top level of the zip.
        archive.glob("".concat(repo, "*all*.html"), { cwd: "".concat(buildDir) });
        archive.finalize();
        return [2 /*return*/, new Promise(function (resolve) { return output.on('close', resolve); })];
    });
}); };
/**
 * Generate jsdoc and put it in "build/phet-io/doc"
 */
var handleJSDOC = function (buildDir) { return __awaiter(void 0, void 0, void 0, function () {
    var i, getJSDocArgs, explanation, imageDir, json;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Make sure each file exists
                for (i = 0; i < JSDOC_FILES.length; i++) {
                    if (!fs_1.default.existsSync(JSDOC_FILES[i])) {
                        throw new Error("file doesnt exist: ".concat(JSDOC_FILES[i]));
                    }
                }
                getJSDocArgs = function (explain) { return __spreadArray(__spreadArray(__spreadArray([
                    '../chipper/node_modules/jsdoc/jsdoc.js'
                ], (explain ? ['-X'] : []), true), JSDOC_FILES, true), [
                    '-c', '../phet-io/doc/wrapper/jsdoc-config.json',
                    '-d',
                    "".concat(buildDir, "doc/api"),
                    '-t', '../chipper/node_modules/docdash',
                    '--readme', JSDOC_README_FILE
                ], false); };
                // FOR DEBUGGING JSDOC:
                // uncomment this line, and run it from the top level of a sim directory
                // console.log( 'node', getJSDocArgs( false ).join( ' ' ) );
                // First we tried to run the jsdoc binary as the cmd, but that wasn't working, and was quite finicky. Then @samreid
                // found https://stackoverflow.com/questions/33664843/how-to-use-jsdoc-with-gulp which recommends the following method
                // (node executable with jsdoc js file)
                return [4 /*yield*/, (0, execute_js_1.default)('node', getJSDocArgs(false), process.cwd())];
            case 1:
                // FOR DEBUGGING JSDOC:
                // uncomment this line, and run it from the top level of a sim directory
                // console.log( 'node', getJSDocArgs( false ).join( ' ' ) );
                // First we tried to run the jsdoc binary as the cmd, but that wasn't working, and was quite finicky. Then @samreid
                // found https://stackoverflow.com/questions/33664843/how-to-use-jsdoc-with-gulp which recommends the following method
                // (node executable with jsdoc js file)
                _a.sent();
                return [4 /*yield*/, (0, execute_js_1.default)('node', getJSDocArgs(true), process.cwd())];
            case 2:
                explanation = (_a.sent()).trim();
                imageDir = "".concat(buildDir, "doc/images");
                if (!fs_1.default.existsSync(imageDir)) {
                    fs_1.default.mkdirSync(imageDir);
                }
                fs_1.default.copyFileSync('../brand/phet-io/images/logoOnWhite.png', "".concat(imageDir, "/logo.png"));
                json = explanation.substring(explanation.indexOf('['), explanation.lastIndexOf(']') + 1);
                // basic sanity checks
                (0, assert_1.default)(json.length > 5000, 'JSON seems odd');
                try {
                    JSON.parse(json);
                }
                catch (e) {
                    (0, assert_1.default)(false, 'JSON parsing failed');
                }
                fs_1.default.writeFileSync("".concat(buildDir, "doc/jsdoc-explanation.json"), json);
                return [2 /*return*/];
        }
    });
}); };
/**
 * Generates the phet-io client guides and puts them in `build/phet-io/doc/guides/`
 */
var handleClientGuides = function (repoName, simulationDisplayName, buildDir, version, simRepoSHA) {
    var builtClientGuidesOutputDir = "".concat(buildDir, "doc/guides/");
    var clientGuidesSourceRoot = "".concat(PHET_IO_SIM_SPECIFIC, "/repos/").concat(repoName, "/");
    var commonDir = "".concat(PHET_IO_SIM_SPECIFIC, "/").concat(GUIDES_COMMON_DIR);
    // copy over common images and styles
    (0, copyDirectory_js_1.default)(commonDir, "".concat(builtClientGuidesOutputDir));
    // handle generating and writing the html file for each client guide
    generateAndWriteClientGuide(repoName, "".concat(simulationDisplayName, " PhET-iO Guide"), simulationDisplayName, "".concat(commonDir, "/").concat(PHET_IO_GUIDE_FILENAME, ".md"), "".concat(builtClientGuidesOutputDir).concat(PHET_IO_GUIDE_FILENAME, ".html"), version, simRepoSHA, false);
    generateAndWriteClientGuide(repoName, "".concat(simulationDisplayName, " Examples"), simulationDisplayName, "".concat(clientGuidesSourceRoot).concat(EXAMPLES_FILENAME, ".md"), "".concat(builtClientGuidesOutputDir).concat(EXAMPLES_FILENAME, ".html"), version, simRepoSHA, true);
};
/**
 * Takes a markdown client guides, fills in the links, and then generates and writes it as html
 * @param repoName
 * @param title
 * @param simulationDisplayName
 * @param mdFilePath - to get the source md file
 * @param destinationPath - to write to
 * @param version
 * @param simRepoSHA
 * @param assertNoConstAwait - handle asserting for "const X = await ..." in examples, see https://github.com/phetsims/phet-io-sim-specific/issues/34
 */
var generateAndWriteClientGuide = function (repoName, title, simulationDisplayName, mdFilePath, destinationPath, version, simRepoSHA, assertNoConstAwait) {
    // make sure the source markdown file exists
    if (!fs_1.default.existsSync(mdFilePath)) {
        grunt_js_1.default.log.warn("no client guide found at ".concat(mdFilePath, ", no guide being built."));
        return;
    }
    var simCamelCaseName = lodash_1.default.camelCase(repoName);
    var modelDocumentationLine = '';
    if (fs_1.default.existsSync("../".concat(repoName, "/doc/model.md"))) {
        modelDocumentationLine = "* [Model Documentation](https://github.com/phetsims/".concat(repoName, "/blob/").concat(simRepoSHA, "/doc/model.md)");
    }
    // fill in links
    var clientGuideSource = grunt_js_1.default.file.read(mdFilePath);
    ///////////////////////////////////////////
    // DO NOT UPDATE OR ADD TO THESE WITHOUT ALSO UPDATING THE LIST IN phet-io-sim-specific/client-guide-common/README.md
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{WRAPPER_INDEX_PATH}}', '../../');
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{SIMULATION_DISPLAY_NAME}}', simulationDisplayName);
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{SIM_PATH}}', "../../".concat(repoName, "_all_phet-io.html?postMessageOnError&phetioStandalone"));
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{STUDIO_PATH}}', '../../wrappers/studio/');
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{PHET_IO_GUIDE_PATH}}', "./".concat(PHET_IO_GUIDE_FILENAME, ".html"));
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{DATE}}', new Date().toString());
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{simCamelCaseName}}', simCamelCaseName);
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{simKebabName}}', repoName);
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{SIMULATION_VERSION_STRING}}', version);
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, '{{MODEL_DOCUMENTATION_LINE}}', modelDocumentationLine);
    ///////////////////////////////////////////
    // support relative and absolute paths for unbuilt common image previews by replacing them with the correct relative path. Order matters!
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, "../../../".concat(GUIDES_COMMON_DIR), '');
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, "../../".concat(GUIDES_COMMON_DIR), '');
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, "../".concat(GUIDES_COMMON_DIR), '');
    clientGuideSource = ChipperStringUtils_js_1.default.replaceAll(clientGuideSource, "/".concat(GUIDES_COMMON_DIR), '');
    // Since we don't have a phet/bad-text lint rule for md files, see https://github.com/phetsims/phet-io-sim-specific/issues/34
    assertNoConstAwait && (0, assert_1.default)(!/^.*const.*await.*$/g.test(clientGuideSource), "use let instead of const when awaiting values in PhET-iO \"".concat(EXAMPLES_FILENAME, "\" files"));
    var renderedClientGuide = marked.parse(clientGuideSource);
    // link a stylesheet
    var clientGuideHTML = "<head>\n                   <link rel='stylesheet' href='css/github-markdown.css' type='text/css'>\n                   <title>".concat(title, "</title>\n                 </head>\n                 <body>\n                 <div class=\"markdown-body\">\n                   ").concat(renderedClientGuide, "\n                 </div>\n                 </body>");
    // write the output to the build directory
    grunt_js_1.default.file.write(destinationPath, clientGuideHTML);
};
/**
 * Support building studio. This compiles the studio modules into a runnable, and copies that over to the expected spot
 * on build.
 */
var handleStudio = function (repo, wrappersLocation, shouldTypeCheck) { return __awaiter(void 0, void 0, void 0, function () {
    var success, _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                grunt_js_1.default.log.verbose.writeln('building studio');
                if (!shouldTypeCheck) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, typeCheck_js_1.default)({ repo: 'studio' })];
            case 1:
                success = _d.sent();
                if (!success) {
                    throw new Error('Type checking failed');
                }
                _d.label = 2;
            case 2:
                _b = (_a = fs_1.default).writeFileSync;
                _c = ["".concat(wrappersLocation, "studio/").concat(STUDIO_BUILT_FILENAME)];
                return [4 /*yield*/, (0, buildStandalone_js_1.default)('studio', {
                        stripAssertions: false,
                        stripLogging: false,
                        tempOutputDir: repo,
                        brand: 'phet-io'
                    })];
            case 3:
                _b.apply(_a, _c.concat([_d.sent()]));
                return [2 /*return*/];
        }
    });
}); };
/**
 * Use webpack to bundle the migration processors into a compiled code string, for use in phet-io lib file.
 */
var getCompiledMigrationProcessors = function (repo, buildDir) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve, reject) {
                var migrationProcessorsFilename = "".concat(repo, "-migration-processors.js");
                var entryPointFilename = "../chipper/dist/js/phet-io-sim-specific/repos/".concat(repo, "/js/").concat(migrationProcessorsFilename);
                if (!fs_1.default.existsSync(entryPointFilename)) {
                    grunt_js_1.default.log.verbose.writeln("No migration processors found at ".concat(entryPointFilename, ", no processors to be bundled with ").concat(LIB_OUTPUT_FILE, "."));
                    resolve(''); // blank string because there are no processors to add.
                }
                else {
                    // output dir must be an absolute path
                    var outputDir_1 = path_1.default.resolve(__dirname, "../../../".concat(repo, "/").concat(buildDir));
                    var compiler = webpack({
                        module: {
                            rules: webpackBuild_js_1.default.getModuleRules() // Support preload-like library globals used via `import`
                        },
                        // We uglify as a step after this, with many custom rules. So we do NOT optimize or uglify in this step.
                        optimization: {
                            minimize: false
                        },
                        // Simulations or runnables will have a single entry point
                        entry: {
                            repo: entryPointFilename
                        },
                        // We output our builds to the following dir
                        output: {
                            path: outputDir_1,
                            filename: migrationProcessorsFilename
                        }
                    });
                    compiler.run(function (err, stats) {
                        if (err || stats.hasErrors()) {
                            console.error('Migration processors webpack build errors:', stats.compilation.errors);
                            reject(err || stats.compilation.errors[0]);
                        }
                        else {
                            var jsFile = "".concat(outputDir_1, "/").concat(migrationProcessorsFilename);
                            var js = fs_1.default.readFileSync(jsFile, 'utf-8');
                            fs_1.default.unlinkSync(jsFile);
                            resolve(js);
                        }
                    });
                }
            })];
    });
}); };
