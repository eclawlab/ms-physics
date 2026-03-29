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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Unit tests, run with `qunit` at the *top-level* of chipper. May need `npm install -g qunit` beforehand, if it hasn't been run yet.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var execute_js_1 = require("../../../perennial-alias/js/common/execute.js");
var gruntCommand_js_1 = require("../../../perennial-alias/js/common/gruntCommand.js");
var grunt_js_1 = require("../../../perennial-alias/js/npm-dependencies/grunt.js");
var qunit_js_1 = require("../../../perennial-alias/js/npm-dependencies/qunit.js");
qunit_js_1.default.module('Chains building');
function assertFileExistence(assert, filename) {
    assert.ok(grunt_js_1.default.file.exists(filename), filename);
}
function assertChainsExistence(assert, brand, options) {
    var _a = options || {}, _b = _a.allHTML, allHTML = _b === void 0 ? false : _b, _c = _a.debugHTML, debugHTML = _c === void 0 ? false : _c, _d = _a.locales, locales = _d === void 0 ? ['en'] : _d;
    if (brand === 'phet') {
        if (locales.includes('en')) {
            assertFileExistence(assert, '../chains/build/phet/chains_en_iframe_phet.html');
        }
        for (var _i = 0, locales_1 = locales; _i < locales_1.length; _i++) {
            var locale = locales_1[_i];
            assertFileExistence(assert, "../chains/build/phet/chains_".concat(locale, "_phet.html"));
        }
        assertFileExistence(assert, '../chains/build/phet/chains-128.png');
        assertFileExistence(assert, '../chains/build/phet/chains-600.png');
        assertFileExistence(assert, '../chains/build/phet/chains-twitter-card.png');
        assertFileExistence(assert, '../chains/build/phet/dependencies.json');
        allHTML && assertFileExistence(assert, '../chains/build/phet/chains_all_phet.html');
        debugHTML && assertFileExistence(assert, '../chains/build/phet/chains_all_phet_debug.html');
    }
    if (brand === 'phet-io') {
        assertFileExistence(assert, '../chains/build/phet-io/chains_all_phet-io.html');
        assertFileExistence(assert, '../chains/build/phet-io/chains-128.png');
        assertFileExistence(assert, '../chains/build/phet-io/chains-600.png');
        assertFileExistence(assert, '../chains/build/phet-io/contrib');
        assertFileExistence(assert, '../chains/build/phet-io/doc');
        assertFileExistence(assert, '../chains/build/phet-io/lib');
        assertFileExistence(assert, '../chains/build/phet-io/wrappers');
        assertFileExistence(assert, '../chains/build/phet-io/dependencies.json');
        assertFileExistence(assert, '../chains/build/phet-io/chains_all_phet-io_debug.html'); // phet-io brand should always have debug html.
    }
}
qunit_js_1.default.test('Build (no args)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', {});
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (with added HTMLs)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io', '--debugHTML'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', { allHTML: true, debugHTML: true });
                assertChainsExistence(assert, 'phet-io', { allHTML: true, debugHTML: true });
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (no uglification)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io', '--uglify=false'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', {});
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (no mangling)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io', '--mangle=false'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', {});
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (instrument)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io', '--instrument', '--uglify=false'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', {});
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (all locales)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io', '--locales=*'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', { locales: ['en', 'ar', 'es', 'zh_CN'] });
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (es,zh_CN locales)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet,phet-io', '--locales=es,zh_CN'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', { locales: ['es', 'zh_CN'] });
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (phet brand only)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet', {});
                return [2 /*return*/];
        }
    });
}); });
qunit_js_1.default.test('Build (phet-io brand only)', function (assert) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                assert.timeout(120000);
                return [4 /*yield*/, (0, execute_js_1.default)(gruntCommand_js_1.default, ['--brands=phet-io'], '../chains')];
            case 1:
                _a.sent();
                assertChainsExistence(assert, 'phet-io', {});
                return [2 /*return*/];
        }
    });
}); });
