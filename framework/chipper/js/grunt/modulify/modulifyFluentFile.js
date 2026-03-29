"use strict";
// Copyright 2025, University of Colorado Boulder
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
exports.getModulifiedFluentFile = void 0;
/**
 * Generates JS modules from resources such as images/strings/audio/etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var path_1 = require("path");
var writeFileAndGitAdd_js_1 = require("../../../../perennial-alias/js/common/writeFileAndGitAdd.js");
var FluentLibrary_js_1 = require("../../browser-and-node/FluentLibrary.js");
var getCopyrightLineFromFileContents_js_1 = require("../getCopyrightLineFromFileContents.js");
var OFF = 'off';
/**
 * Reads a Fluent.js file from the absolute path. Removes any comments from the file to reduce the size of the module.
 * @param abspath - the absolute path of the file
 */
var readFluentFile = function (abspath) {
    var fileContents = (0, fs_1.readFileSync)(abspath, 'utf8');
    // Remove Fluent.js comments from the file contents
    return fileContents.replace(/#.*(\r?\n|$)/g, '');
};
/**
 * Turn a file into a TS file that loads the fluent messages
 */
var getModulifiedFluentFile = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var usedRelativeFiles, abspath, filename, nameWithoutSuffix, localeToFluentFileContents, babelPath, localBabelFiles, fluentKeys, englishBundle, fluentKeysType, modulifiedName, relativeModulifiedName, namespace, copyrightLine;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!relativePath.endsWith('_en.ftl')) {
                    throw new Error('Only english fluent files can be modulified.');
                }
                usedRelativeFiles = [];
                abspath = path_1.default.resolve("../".concat(repo), relativePath);
                filename = path_1.default.basename(abspath);
                nameWithoutSuffix = filename.replace('_en.ftl', '');
                localeToFluentFileContents = {};
                localeToFluentFileContents.en = readFluentFile(abspath);
                usedRelativeFiles.push(relativePath);
                babelPath = "../babel/fluent/".concat(repo);
                localBabelFiles = [];
                usedRelativeFiles.push("babel/fluent/".concat(repo));
                if (fs_1.default.existsSync(babelPath)) {
                    localBabelFiles = fs_1.default.readdirSync(babelPath);
                }
                localBabelFiles.forEach(function (babelFile) {
                    if (babelFile.startsWith("".concat(nameWithoutSuffix, "_"))) {
                        var locale = babelFile.match(/_([^_]+)\.ftl/)[1];
                        if (!locale) {
                            throw new Error("Could not determine locale from ".concat(babelFile));
                        }
                        usedRelativeFiles.push("babel/fluent/".concat(repo, "/").concat(babelFile));
                        localeToFluentFileContents[locale] = readFluentFile("".concat(babelPath, "/").concat(babelFile));
                    }
                });
                // Loop through every fluent file and do any necessary checks for syntax.
                Object.values(localeToFluentFileContents).forEach(function (fluentFile) {
                    FluentLibrary_js_1.default.verifyFluentFile(fluentFile);
                });
                fluentKeys = FluentLibrary_js_1.default.getFluentMessageKeys(localeToFluentFileContents.en);
                englishBundle = new FluentLibrary_js_1.FluentBundle('en');
                englishBundle.addResource(new FluentLibrary_js_1.FluentResource(localeToFluentFileContents.en));
                fluentKeysType = "type ".concat(nameWithoutSuffix, "FluentType = {");
                fluentKeys.forEach(function (fluentKey) {
                    var isStringProperty = typeof englishBundle.getMessage(fluentKey).value === 'string';
                    fluentKeysType += "\n  '".concat(fluentKey, "MessageProperty': ").concat(isStringProperty ? 'TReadOnlyProperty<string>' : 'LocalizedMessageProperty', ";");
                });
                fluentKeysType += '\n};';
                modulifiedName = "".concat(nameWithoutSuffix, "Messages");
                relativeModulifiedName = "js/strings/".concat(modulifiedName, ".ts");
                namespace = lodash_1.default.camelCase(repo);
                return [4 /*yield*/, (0, getCopyrightLineFromFileContents_js_1.default)(repo, relativeModulifiedName)];
            case 1:
                copyrightLine = _a.sent();
                return [2 /*return*/, {
                        content: "".concat(copyrightLine, "\n    \n/* eslint-disable */\n/* @formatter:").concat(OFF, " */\n\n/**\n * Auto-generated from modulify, DO NOT manually modify.\n */\n\nimport getFluentModule from '../../../chipper/js/browser/getFluentModule.js';\nimport ").concat(namespace, " from '../../js/").concat(namespace, ".js';\nimport LocalizedMessageProperty from '../../../chipper/js/browser/LocalizedMessageProperty.js';\nimport type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';\n\n").concat(fluentKeysType, "\n\nconst ").concat(modulifiedName, " = getFluentModule( ").concat(JSON.stringify(localeToFluentFileContents, null, 2).replaceAll('\\r\\n', '\\n'), " ) as unknown as ").concat(nameWithoutSuffix, "FluentType;\n\n").concat(namespace, ".register( '").concat(modulifiedName, "', ").concat(modulifiedName, " );\n\nexport default ").concat(modulifiedName, ";\n"),
                        usedRelativeFiles: usedRelativeFiles
                    }];
        }
    });
}); };
exports.getModulifiedFluentFile = getModulifiedFluentFile;
/**
 * Prepares modules so that contents of fluent files can be used in the simulation.
 * @param repo - repository name for the modulify command
 * @param relativePath - the relative path of the fluent file
 */
var modulifyFluentFile = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var abspath, filename, nameWithoutSuffix, modulifiedName, relativeModulifiedName, contents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!relativePath.endsWith('_en.ftl')) {
                    throw new Error('Only english fluent files can be modulified.');
                }
                abspath = path_1.default.resolve("../".concat(repo), relativePath);
                filename = path_1.default.basename(abspath);
                nameWithoutSuffix = filename.replace('_en.ftl', '');
                modulifiedName = "".concat(nameWithoutSuffix, "Messages");
                relativeModulifiedName = "js/strings/".concat(modulifiedName, ".ts");
                return [4 /*yield*/, (0, exports.getModulifiedFluentFile)(repo, relativePath)];
            case 1:
                contents = (_a.sent()).content;
                return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, relativeModulifiedName, contents)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.default = modulifyFluentFile;
