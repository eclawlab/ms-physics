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
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncLoadFileAsDataURI = void 0;
/**
 * Converts a resource (like an image or sound file) to base64.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
// eslint-disable-next-line phet/default-import-match-filename
var promises_1 = require("fs/promises");
var MIME_TYPES = {
    png: 'image/png',
    svg: 'image/svg+xml',
    jpg: 'image/jpeg',
    gif: 'image/gif',
    cur: 'image/x-icon', // cursor files (used in build-a-molecule). x-win-bitmap gives off warnings in Chrome
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    oga: 'audio/ogg',
    bma: 'audio/webm', // webma is the full extension
    wav: 'audio/wav',
    woff: 'application/x-font-woff'
};
/**
 * @returns - A base-64 Data URI for the given resource
 */
function loadFileAsDataURI(filename) {
    var filenameParts = filename.split('.');
    var suffix = filenameParts[filenameParts.length - 1];
    var mimeType = MIME_TYPES[suffix];
    if (!mimeType) {
        throw new Error("Unknown mime type for filename: ".concat(filename));
    }
    var base64 = "data:".concat(mimeType, ";base64,").concat(Buffer.from(fs_1.default.readFileSync(filename)).toString('base64'));
    return base64;
}
exports.default = loadFileAsDataURI;
// Async version
var asyncLoadFileAsDataURI = function (filename) { return __awaiter(void 0, void 0, void 0, function () {
    var filenameParts, suffix, mimeType, base64, _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                filenameParts = filename.split('.');
                suffix = filenameParts[filenameParts.length - 1];
                mimeType = MIME_TYPES[suffix];
                if (!mimeType) {
                    throw new Error("Unknown mime type for filename: ".concat(filename));
                }
                _b = (_a = "data:".concat(mimeType, ";base64,")).concat;
                _d = (_c = Buffer).from;
                return [4 /*yield*/, promises_1.default.readFile(filename)];
            case 1:
                base64 = _b.apply(_a, [_d.apply(_c, [_e.sent()]).toString('base64')]);
                return [2 /*return*/, base64];
        }
    });
}); };
exports.asyncLoadFileAsDataURI = asyncLoadFileAsDataURI;
