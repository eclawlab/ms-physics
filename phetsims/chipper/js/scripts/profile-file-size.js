"use strict";
// Copyright 2013-2026, University of Colorado Boulder
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
 * Profiles the file size of the built JS file for a given repo.
 *
 * Analyzes the file size of a built file (that has been built with --profileFileSize), and prints out the results.
 * To profile a sim, go to the sim directory and run:
 *
 * grunt --locales=* --brands=phet --profileFileSize
 * sage run ../chipper/js/scripts/profile-file-size.ts
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var zlib_1 = require("zlib");
var getRepo_js_1 = require("../../../perennial-alias/js/grunt/tasks/util/getRepo.js");
var TagMatch = /** @class */ (function () {
    function TagMatch(startIndex, endIndex, isStart, type, name) {
        if (name === void 0) { name = null; }
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.isStart = isStart;
        this.type = type;
        this.name = name;
    }
    return TagMatch;
}());
var TaggedSection = /** @class */ (function () {
    function TaggedSection(type, name) {
        if (name === void 0) { name = null; }
        this.type = type;
        this.name = name;
        this.children = [];
    }
    TaggedSection.prototype.getSize = function () {
        return getUtf8Length(this.getApproxString());
    };
    TaggedSection.prototype.getGzippedSize = function () {
        return getGzippedLength(this.getApproxString());
    };
    TaggedSection.prototype.getApproxString = function () {
        return this.children.map(function (child) {
            if (typeof child === 'string') {
                return child;
            }
            else {
                return child.getApproxString();
            }
        }).join('');
    };
    TaggedSection.prototype.getApproxFilteredString = function (filter) {
        if (filter(this)) {
            return this.getApproxString();
        }
        else {
            return this.children.map(function (child) {
                if (typeof child === 'string') {
                    return '';
                }
                else {
                    return child.getApproxFilteredString(filter);
                }
            }).join('');
        }
    };
    TaggedSection.prototype.getApproxRepoString = function (repo) {
        return this.getApproxFilteredString(function (section) { return !!(section.type === 'MODULE' && section.name && section.name.includes("chipper/dist/js/".concat(repo, "/"))); });
    };
    TaggedSection.prototype.getApproxImagesString = function () {
        return this.getApproxFilteredString(function (section) { return !!(section.type === 'MODULE' && section.name && /chipper\/dist\/js\/[^/]+\/(images|mipmaps)\//.test(section.name)); });
    };
    TaggedSection.prototype.getApproxSoundsString = function () {
        return this.getApproxFilteredString(function (section) { return !!(section.type === 'MODULE' && section.name && /chipper\/dist\/js\/[^/]+\/sounds\//.test(section.name)); });
    };
    TaggedSection.prototype.getRepos = function () {
        var repo = null;
        if (this.type === 'MODULE' && this.name && this.name.includes('chipper/dist/js/')) {
            var index = this.name.indexOf('chipper/dist/js/') + 'chipper/dist/js/'.length;
            repo = this.name.slice(index).split('/')[0];
        }
        return lodash_1.default.uniq(__spreadArray(__spreadArray([], (repo ? [repo] : []), true), this.children.flatMap(function (child) {
            if (typeof child === 'string') {
                return [];
            }
            else {
                return child.getRepos();
            }
        }), true));
    };
    TaggedSection.prototype.toReportString = function (sort, size, gzippedSize, indent) {
        if (indent === void 0) { indent = ''; }
        // TOD: sort by gzipped size?
        var children = sort ? lodash_1.default.sortBy(this.children, function (child) { return -(typeof child === 'string' ? getUtf8Length(child) : child.getSize()); }) : this.children;
        return "".concat(getSizeString(this.getApproxString(), size, gzippedSize), " ").concat(indent).concat(this.type).concat(this.name ? ' ' + this.name : '', "\n").concat(children.map(function (child) {
            if (typeof child === 'string') {
                return '';
            }
            else {
                return child.toReportString(sort, size, gzippedSize, "".concat(indent, "  "));
            }
        }).join(''));
    };
    return TaggedSection;
}());
var findNextMatch = function (string, startIndex) {
    var match = (/console\.log\("(START|END)_([A-Z_]+)"(,"([^"]+)")?\)/g).exec(string.slice(startIndex));
    if (match) {
        var matchIndex = match.index + startIndex;
        return new TagMatch(matchIndex, matchIndex + match[0].length, match[1] === 'START', match[2], match[4]);
    }
    else {
        return null;
    }
};
var getUtf8Length = function (string) { return Buffer.from(string, 'utf-8').length; };
var getGzippedLength = function (string) { return zlib_1.default.gzipSync(Buffer.from(string, 'utf-8')).length; };
var getSizeString = function (string, size, gzippedSize) {
    var ourSize = getUtf8Length(string);
    var ourGzippedSize = getGzippedLength(string);
    var sizeString = '' + ourSize;
    var gzippedSizeString = '' + ourGzippedSize;
    var sizePercentage = Math.round(ourSize / size * 1000) / 10;
    if (sizePercentage !== 0) {
        sizeString += " (".concat(sizePercentage, "%)");
    }
    var gzippedSizePercentage = Math.round(ourGzippedSize / gzippedSize * 1000) / 10;
    if (gzippedSizePercentage !== 0) {
        gzippedSizeString += " (".concat(gzippedSizePercentage, "%)");
    }
    var megabytes = Math.round(ourSize / 1024 / 1024 * 100) / 100;
    if (megabytes !== 0) {
        sizeString += " ".concat(megabytes, " MB");
    }
    var gzippedMegabytes = Math.round(ourGzippedSize / 1024 / 1024 * 100) / 100;
    if (gzippedMegabytes !== 0) {
        gzippedSizeString += " ".concat(gzippedMegabytes, " MB");
    }
    return "utf-8: ".concat(sizeString, " gzip: ").concat(gzippedSizeString);
};
var parseToSections = function (string) {
    var rootSection = new TaggedSection('ROOT', null);
    var stack = [rootSection];
    var index = 0;
    var match;
    // eslint-disable-next-line no-cond-assign
    while (match = findNextMatch(string, index)) {
        // console.log( match.type, match.name, match.isStart ? 'START' : 'END', match.startIndex, match.endIndex );
        // Append any string before the match
        if (match.startIndex > index) {
            stack[stack.length - 1].children.push(string.slice(index, match.startIndex));
        }
        if (match.isStart) {
            var newSection = new TaggedSection(match.type, match.name);
            stack[stack.length - 1].children.push(newSection);
            stack.push(newSection);
        }
        else {
            var popped = stack.pop();
            if (popped.type !== match.type || popped.name !== match.name) {
                throw new Error("Mismatched tags: ".concat(popped.type, " ").concat(popped.name, " !== ").concat(match.type, " ").concat(match.name));
            }
        }
        index = match.endIndex;
    }
    if (index < string.length) {
        stack[stack.length - 1].children.push(string.slice(index));
    }
    return rootSection;
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var repo, file, rootSection, size, gzippedSize, printString, printFilter, _i, _a, repo_1;
    return __generator(this, function (_b) {
        repo = (0, getRepo_js_1.default)();
        file = fs_1.default.readFileSync("../".concat(repo, "/build/phet/").concat(repo, "_all_phet.html"), 'utf-8');
        rootSection = parseToSections(file);
        size = rootSection.getSize();
        gzippedSize = rootSection.getGzippedSize();
        printString = function (name, string) {
            console.log("".concat(name, ": ").concat(getSizeString(string, size, gzippedSize)));
        };
        printFilter = function (name, filter) {
            printString(name, rootSection.getApproxFilteredString(filter));
        };
        console.log('summary:\n');
        printString('TOTAL', rootSection.getApproxString());
        console.log('');
        printString('images', rootSection.getApproxImagesString());
        printString('sounds', rootSection.getApproxSoundsString());
        printFilter('webpack (includes assets)', function (section) { return section.type === 'WEBPACK'; });
        printFilter('preload', function (section) { return section.type === 'PRELOAD'; });
        printFilter('strings', function (section) { return section.type === 'STRINGS'; });
        printFilter('license', function (section) { return section.type === 'LICENSE'; });
        for (_i = 0, _a = rootSection.getRepos().sort(); _i < _a.length; _i++) {
            repo_1 = _a[_i];
            printString("js ".concat(repo_1), rootSection.getApproxRepoString(repo_1));
        }
        console.log('\ndetails:\n');
        console.log(rootSection.toReportString(true, size, gzippedSize));
        return [2 /*return*/];
    });
}); })();
