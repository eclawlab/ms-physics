"use strict";
// Copyright 2025-2026, University of Colorado Boulder
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
 * A server designed to be spawned with fork() for fast modulification tasks (i.e. for launchpad).
 *
 * If forked similar to:
 *
 * const process = fork( path.resolve( __dirname, '../chipper/js/grunt/modulify/modulifyForkServer.ts' ), [], {
 *   stdio: [ 'inherit', 'inherit', 'inherit', 'ipc' ],
 *   execArgv: process.execArgv.length ? process.execArgv : [ '-r', 'tsx' ]
 * } );
 *
 * Then process.send( ModulifyRequest ) can send modulify requests, listend to for process.on( 'message', ... )
 * which can receive the responses.
 *
 * It will in-memory modulify a single file, or essentially no-op if it doesn't need modulification.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var modulify_js_1 = require("./modulify.js");
var gitRevParse_js_1 = require("../../../../perennial-alias/js/common/gitRevParse.js");
var chipperSHAPromise = (0, gitRevParse_js_1.default)('chipper', 'HEAD');
var perennialSHAPromise = (0, gitRevParse_js_1.default)('perennial-alias', 'HEAD');
console.log('Started modulifyForkServer');
process.on('message', function (request) { return __awaiter(void 0, void 0, void 0, function () {
    var send, content, response, _a, e_1, response;
    var _b;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                send = function (message) {
                    process.send(message);
                };
                _d.label = 1;
            case 1:
                _d.trys.push([1, 7, , 8]);
                return [4 /*yield*/, (0, modulify_js_1.getModulifiedFileString)(request.file)];
            case 2:
                content = _d.sent();
                if (!content) return [3 /*break*/, 5];
                _b = {
                    type: 'modulifyResponse',
                    id: request.id,
                    modulified: true,
                    fileContents: content.content
                };
                return [4 /*yield*/, chipperSHAPromise];
            case 3:
                _b.chipperSHA = _d.sent();
                return [4 /*yield*/, perennialSHAPromise];
            case 4:
                _a = (_b.perennialSHA = _d.sent(),
                    _b.usedRelativeFiles = content.usedRelativeFiles,
                    _b);
                return [3 /*break*/, 6];
            case 5:
                _a = {
                    type: 'modulifyResponse',
                    id: request.id,
                    modulified: false
                };
                _d.label = 6;
            case 6:
                response = _a;
                send(response);
                return [3 /*break*/, 8];
            case 7:
                e_1 = _d.sent();
                response = {
                    type: 'error',
                    id: request.id,
                    message: String((_c = e_1 === null || e_1 === void 0 ? void 0 : e_1.message) !== null && _c !== void 0 ? _c : e_1)
                };
                send(response);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// exit quickly if parent dies
process.on('disconnect', function () { return process.exit(0); });
