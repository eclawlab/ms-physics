"use strict";
// Copyright 2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var MipmapElement_js_1 = require("./MipmapElement.js");
QUnit.module('MipmapElement');
QUnit.test('mipmap', function (assert) {
    (function () { return new MipmapElement_js_1.default(10, 10, '', false); })();
    assert.ok(true, 'mipmap created');
});
