"use strict";
// Copyright 2024, University of Colorado Boulder
// This PhET-iO file requires a license
// USE WITHOUT A LICENSE AGREEMENT IS STRICTLY PROHIBITED.
// For licensing, please contact phethelp@colorado.edu
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * isInitialStateCompatible tests
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var isInitialStateCompatible_js_1 = require("../browser-and-node/isInitialStateCompatible.js");
QUnit.module('isInitialStateCompatible');
QUnit.test('isInitialStateCompatible', function (assert) {
    // Example 1: Compatible with extra items in test array
    var testObj1 = {
        a: 1,
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 10 },
            { min: 11, max: 15 } // Extra item in test array
        ],
        g: 5
    };
    var groundTruthObj1 = {
        a: 1,
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 10 }
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj1, testObj1), false);
    // Example 2: Incompatible due to mismatched value
    var groundTruthObj2 = {
        a: 1,
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 15 } // max value differs
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj2, testObj1), false);
    // Example 3: Compatible with nested objects and extra array items
    var testObj2 = {
        a: 1,
        b: [
            { min: 0, max: 5, extra: 'ignore' },
            { min: 6, max: 10 },
            { min: 11, max: 15 }
        ],
        g: 5
    };
    var groundTruthObj3 = {
        b: [
            { min: 0, max: 5 }
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj3, testObj2), false);
    // Example 4: Compatible when groundTruth array has same number of elements
    var groundTruthObj4 = {
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 10 },
            { min: 11, max: 15 }
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj4, testObj2), true);
    // Example 5: Incompatible due to no corresponding test array item
    var groundTruthObj5 = {
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 10 },
            { min: 16, max: 20 } // No compatible item in test array at index 2
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj5, testObj2), false);
    var groundTruthObj6 = {
        a: 1,
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 10 },
            { min: 11, max: 15 },
            { min: 0, max: 10 }
        ],
        g: 5
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj6, testObj2), false);
    var groundTruthObj7 = {
        a: 1,
        b: [
            { min: 0, max: 5 },
            { min: 6, max: 10 }
        ],
        g: 5
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObj7, testObj2), false);
    // Example 6: Compatible with deeply nested structures
    var testObjA = {
        user: {
            id: 123,
            name: 'Alice',
            roles: ['admin', 'editor', 'viewer'],
            preferences: {
                theme: 'dark',
                notifications: true
            }
        },
        metadata: {
            createdAt: '2023-01-01',
            updatedAt: '2023-06-01'
        }
    };
    var groundTruthObjA = {
        user: {
            id: 123,
            roles: ['admin', 'editor'],
            preferences: {
                theme: 'dark'
            }
        }
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObjA, testObjA), false);
    // Example 7: Incompatible due to missing role at specific index
    var groundTruthObjB = {
        user: {
            id: 123,
            roles: ['admin', 'viewer'] // 'manager' role not present at index 1
        }
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObjB, testObjA), false);
    // Example 8: Compatible with multiple schema items in groundTruth array
    var testObjC = {
        products: [
            { id: 1, name: 'Laptop', specs: { ram: '16GB', storage: '512GB' } },
            { id: 2, name: 'Phone', specs: { ram: '8GB', storage: '256GB' } },
            { id: 3, name: 'Tablet', specs: { ram: '4GB', storage: '128GB' } }
        ]
    };
    var groundTruthObjC = {
        products: [
            { name: 'Laptop', specs: { ram: '16GB' } },
            { name: 'Phone', specs: { storage: '256GB' } },
            { name: 'Tablet' }
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObjC, testObjC), true);
    // Example 9: Incompatible due to mismatched nested value
    var groundTruthObjD = {
        products: [
            { name: 'Laptop', specs: { ram: '32GB' } } // ram value differs
        ]
    };
    assert.equal((0, isInitialStateCompatible_js_1.default)(groundTruthObjD, testObjC), false);
    assert.equal((0, isInitialStateCompatible_js_1.default)({}, {}), true);
    assert.equal((0, isInitialStateCompatible_js_1.default)({}, { hi: true }), true);
});
