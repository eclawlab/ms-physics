"use strict";
// Copyright 2020-2025, University of Colorado Boulder
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
exports.getStringModuleContents = void 0;
/**
 * Creates the string module at js/${_.camelCase( repo )}Strings.js for repos that need it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var writeFileAndGitAdd_js_1 = require("../../../../perennial-alias/js/common/writeFileAndGitAdd.js");
var pascalCase_js_1 = require("../../common/pascalCase.js");
var getCopyrightLineFromFileContents_js_1 = require("../getCopyrightLineFromFileContents.js");
var modulify_js_1 = require("./modulify.js");
var OFF = 'off';
exports.default = (function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var stringModuleName, relativeStringModuleFile, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                stringModuleName = "".concat((0, pascalCase_js_1.default)(repo), "Strings");
                relativeStringModuleFile = "js/".concat(stringModuleName, ".ts");
                _a = writeFileAndGitAdd_js_1.default;
                _b = [repo, relativeStringModuleFile];
                return [4 /*yield*/, (0, exports.getStringModuleContents)(repo)];
            case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_c.sent()).content]))];
            case 2:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
var getStringModuleContents = function (repo) { return __awaiter(void 0, void 0, void 0, function () {
    var packageObject, stringModuleName, relativeStringModuleFile, stringModuleFileJS, namespace, copyrightLine;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
                stringModuleName = "".concat((0, pascalCase_js_1.default)(repo), "Strings");
                relativeStringModuleFile = "js/".concat(stringModuleName, ".ts");
                stringModuleFileJS = "../".concat(repo, "/js/").concat(stringModuleName, ".js");
                namespace = lodash_1.default.camelCase(repo);
                if (fs_1.default.existsSync(stringModuleFileJS)) {
                    console.log('Found JS string file in TS repo.  It should be deleted manually.  ' + stringModuleFileJS);
                }
                return [4 /*yield*/, (0, getCopyrightLineFromFileContents_js_1.default)(repo, relativeStringModuleFile)];
            case 1:
                copyrightLine = _a.sent();
                return [2 /*return*/, {
                        content: "".concat(copyrightLine, "\n\n/* eslint-disable */\n/* @formatter:").concat(OFF, " */\n\n/**\n * Auto-generated from modulify, DO NOT manually modify.\n */\n\nimport getStringModule from '../../chipper/js/browser/getStringModule.js';\nimport type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';\nimport ").concat(namespace, " from './").concat(namespace, ".js';\n\ntype StringsType = ").concat(getStringTypes(repo), ";\n\nconst ").concat(stringModuleName, " = getStringModule( '").concat(packageObject.phet.requirejsNamespace, "' ) as StringsType;\n\n").concat(namespace, ".register( '").concat(stringModuleName, "', ").concat(stringModuleName, " );\n\nexport default ").concat(stringModuleName, ";\n"),
                        usedRelativeFiles: ["".concat(repo, "/package.json")]
                    }];
        }
    });
}); };
exports.getStringModuleContents = getStringModuleContents;
/**
 * Creates a *.d.ts file that represents the types of the strings for the repo.
 */
var getStringTypes = function (repo) {
    var packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
    var json = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/").concat(repo, "-strings_en.json"), 'utf8'));
    // Track paths to all the keys with values.
    var all = [];
    // Recursively collect all of the paths to keys with values.
    var visit = function (level, path) {
        Object.keys(level).forEach(function (key) {
            if (key !== '_comment') {
                if (level[key].value && typeof level[key].value === 'string') {
                    // Deprecated means that it is used by release branches, but shouldn't be used in new code, so keep it out of the type.
                    if (!level[key].deprecated) {
                        all.push({ path: __spreadArray(__spreadArray([], path, true), [key], false), value: level[key].value });
                    }
                }
                else {
                    visit(level[key], __spreadArray(__spreadArray([], path, true), [key], false));
                }
            }
        });
    };
    visit(json, []);
    // Transform to a new structure that matches the types we access at runtime.
    var structure = {};
    for (var i = 0; i < all.length; i++) {
        var allElement = all[i];
        var path = allElement.path;
        var level = structure;
        for (var k = 0; k < path.length; k++) {
            var pathElement = path[k];
            var tokens = pathElement.split('.');
            for (var m = 0; m < tokens.length; m++) {
                var token = tokens[m];
                (0, assert_1.default)(!token.includes(';'), "Token ".concat(token, " cannot include forbidden characters"));
                (0, assert_1.default)(!token.includes(','), "Token ".concat(token, " cannot include forbidden characters"));
                (0, assert_1.default)(!token.includes(' '), "Token ".concat(token, " cannot include forbidden characters"));
                if (k === path.length - 1 && m === tokens.length - 1) {
                    if (!(packageObject.phet && packageObject.phet.simFeatures && packageObject.phet.simFeatures.supportsDynamicLocale)) {
                        level[token] = '{{STRING}}'; // instead of value = allElement.value
                    }
                    level["".concat(token, "StringProperty")] = '{{STRING_PROPERTY}}';
                }
                else {
                    level[token] = level[token] || {};
                    level = level[token];
                }
            }
        }
    }
    var text = JSON.stringify(structure, null, 2);
    // Use single quotes instead of the double quotes from JSON
    text = (0, modulify_js_1.replace)(text, '"', '\'');
    text = (0, modulify_js_1.replace)(text, '\'{{STRING}}\'', 'string');
    text = (0, modulify_js_1.replace)(text, '\'{{STRING_PROPERTY}}\'', 'LocalizedStringProperty');
    // Add ; to the last in the list
    text = (0, modulify_js_1.replace)(text, ': string\n', ': string;\n');
    text = (0, modulify_js_1.replace)(text, ': LocalizedStringProperty\n', ': LocalizedStringProperty;\n');
    // Use ; instead of ,
    text = (0, modulify_js_1.replace)(text, ',', ';');
    return text;
};
