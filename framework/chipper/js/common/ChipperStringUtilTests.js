"use strict";
// Copyright 2019-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tests for ChipperStringUtils
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var qunit_js_1 = require("../../../perennial-alias/js/npm-dependencies/qunit.js");
var ChipperStringUtils_js_1 = require("./ChipperStringUtils.js");
qunit_js_1.default.module('ChipperStringUtils');
qunit_js_1.default.test('forEachString', function (assert) {
    var map1 = {
        x: { value: 'x' },
        y: {
            value: 'y',
            z: { value: 'z' }
        },
        intermediary: {
            a: { value: 'a' },
            b: { value: 'b' },
            intermediary2: {
                c: { value: 'c' }
            }
        }
    };
    var count = 0;
    var expectedKeys = [
        'x',
        'y',
        'y.z',
        'intermediary.a',
        'intermediary.b',
        'intermediary.intermediary2.c'
    ];
    ChipperStringUtils_js_1.default.forEachString(map1, function (key) {
        count++;
        var keyIndex = expectedKeys.indexOf(key);
        assert.ok(keyIndex >= 0, "unexpected key:".concat(key));
        expectedKeys.splice(keyIndex, 1); // just remove the single item
    });
    assert.ok(expectedKeys.length === 0, 'all keys should be accounted for');
    assert.ok(count === 6, 'should be three string');
    assert.ok(true, 'success');
});
