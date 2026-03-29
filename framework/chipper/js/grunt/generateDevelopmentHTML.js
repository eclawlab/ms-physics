"use strict";
// Copyright 2015-2026, University of Colorado Boulder
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
exports.default = default_1;
/**
 * Generates the top-level main HTML file for simulations (or runnables) using phet-brand splash and loading phet-io
 * preloads when brand=phet-io is specified.
 *
 * See https://github.com/phetsims/chipper/issues/63
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var writeFileAndGitAdd_js_1 = require("../../../perennial-alias/js/common/writeFileAndGitAdd.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var ChipperStringUtils_js_1 = require("../common/ChipperStringUtils.js");
var getPreloads_js_1 = require("./getPreloads.js");
var getStringRepos_js_1 = require("./getStringRepos.js");
function default_1(repo, options) {
    return __awaiter(this, void 0, void 0, function () {
        // Formatting is very specific to the template file. Each preload is placed on separate line,
        // with an indentation that is specific indentation to the template. See chipper#462
        function stringifyArray(arr, indentation) {
            return "[\n".concat(arr.map(function (string) { return "".concat(indentation, "    '").concat(string.replace(/'/g, '\\\''), "'"); }).join(',\n'), "\n").concat(indentation, "  ]");
        }
        function isPreloadExcluded(preload) {
            return preload.includes('google-analytics') || stripPreloads.includes(preload);
        }
        var _a, _b, stylesheets, _c, bodystyle, _d, outputFile, _e, bodystart, _f, addedPreloads, _g, stripPreloads, _h, mainFile, _j, forSim, packageObject, brand, splashURL, html, indentLines, preloads, phetioPreloads, stringRepos;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _a = options || {}, _b = _a.stylesheets, stylesheets = _b === void 0 ? '' : _b, _c = _a.bodystyle, bodystyle = _c === void 0 ? ' style="background-color:black;"' : _c, _d = _a.outputFile, outputFile = _d === void 0 ? "".concat(repo, "_en.html") : _d, _e = _a.bodystart, bodystart = _e === void 0 ? '' : _e, _f = _a.addedPreloads, addedPreloads = _f === void 0 ? [] : _f, _g = _a.stripPreloads, stripPreloads = _g === void 0 ? [] : _g, _h = _a.mainFile, mainFile = _h === void 0 ? "../chipper/dist/js/".concat(repo, "/js/").concat(repo, "-main.js") : _h, _j = _a.forSim, forSim = _j === void 0 ? true // is this html used for a sim, or something else like tests.
                     : _j;
                    packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
                    brand = 'phet';
                    splashURL = "../brand/".concat(brand, "/images/splash.svg");
                    html = grunt_js_1.default.file.read('../chipper/templates/sim-development.html');
                    indentLines = function (string) {
                        return string.split('\n').join('\n    ');
                    };
                    preloads = (0, getPreloads_js_1.default)(repo, brand, forSim).filter(function (preload) {
                        return !isPreloadExcluded(preload);
                    }).concat(addedPreloads);
                    phetioPreloads = (0, getPreloads_js_1.default)(repo, 'phet-io', forSim).filter(function (preload) {
                        return !isPreloadExcluded(preload) && !lodash_1.default.includes(preloads, preload);
                    });
                    return [4 /*yield*/, (0, getStringRepos_js_1.default)(repo)];
                case 1:
                    stringRepos = _k.sent();
                    // Replace placeholders in the template.
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{BODYSTYLE}}', bodystyle);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{BODYSTART}}', bodystart);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{STYLESHEETS}}', stylesheets);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{REPOSITORY}}', repo);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{BRAND}}', brand);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{SPLASH_URL}}', splashURL);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{MAIN_FILE}}', mainFile);
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{PHET_IO_PRELOADS}}', stringifyArray(phetioPreloads, '  '));
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{PRELOADS}}', stringifyArray(preloads, ''));
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{PACKAGE_OBJECT}}', indentLines(JSON.stringify(packageObject, null, 2)));
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{STRING_REPOS}}', indentLines(JSON.stringify(stringRepos, null, 2)));
                    // Use the repository name for the browser window title, because getting the sim's title
                    // requires running the string plugin in build mode, which is too heavy-weight for this task.
                    // See https://github.com/phetsims/chipper/issues/510
                    html = ChipperStringUtils_js_1.default.replaceAll(html, '{{BROWSER_WINDOW_TITLE}}', repo);
                    // Write to the repository's root directory.
                    return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, outputFile, html)];
                case 2:
                    // Write to the repository's root directory.
                    _k.sent();
                    return [2 /*return*/];
            }
        });
    });
}
