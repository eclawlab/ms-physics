"use strict";
// Copyright 2021-2025, University of Colorado Boulder
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
 * @author Sam Reid (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var optionize_js_1 = require("../../../phet-core/js/optionize.js");
var phetioCompareAPIs_js_1 = require("../browser-and-node/phetioCompareAPIs.js");
var jsondiffpatch = require('../../../sherpa/lib/jsondiffpatch-v0.3.11.umd').create({});
/**
 * Compare two sets of APIs using phetioCompareAPIs.
 */
exports.default = (function (repos, proposedAPIs, providedOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var options, ok;
    return __generator(this, function (_a) {
        options = (0, optionize_js_1.default)()({
            delta: false,
            compareBreakingAPIChanges: true
        }, providedOptions);
        ok = true;
        repos.forEach(function (repo) {
            var packageObject = JSON.parse(fs_1.default.readFileSync("../".concat(repo, "/package.json"), 'utf8'));
            var phetioSection = packageObject.phet['phet-io'] || {};
            // Fails on missing file or parse error.
            var referenceAPI = JSON.parse(fs_1.default.readFileSync("../phet-io-sim-specific/repos/".concat(repo, "/").concat(repo, "-phet-io-api.json"), 'utf8'));
            var proposedAPI = proposedAPIs[repo];
            if (!proposedAPI) {
                throw new Error("No proposedAPI for repo: ".concat(repo));
            }
            var comparisonData = (0, phetioCompareAPIs_js_1.default)(referenceAPI, proposedAPI, lodash_1.default, {
                compareBreakingAPIChanges: options.compareBreakingAPIChanges,
                compareDesignedAPIChanges: !!phetioSection.compareDesignedAPIChanges // determined from the package.json flag
            });
            if (comparisonData.breakingProblems.length) {
                ok = false;
                console.log("".concat(repo, " BREAKING PROBLEMS"));
                console.log(comparisonData.breakingProblems.join('\n'));
                console.log('\n');
            }
            if (comparisonData.designedProblems.length) {
                ok = false;
                console.log("".concat(repo, " DESIGN PROBLEMS"));
                console.log(comparisonData.designedProblems.join('\n'));
                console.log('\n');
            }
            if (options.delta) {
                var delta = jsondiffpatch.diff(referenceAPI, proposedAPI);
                if (delta) {
                    console.log(JSON.stringify(delta, null, 2));
                }
            }
        });
        return [2 /*return*/, ok];
    });
}); });
