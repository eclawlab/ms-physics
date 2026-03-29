"use strict";
// Copyright 2023-2025, University of Colorado Boulder
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A cache that helps reuse parametric IOTypes so they aren't dynamic created upon each usage. This also has the feature
 * of keeping a registry of all caches. This is predominantly used to clear an API and start over in phetioEngine.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
var tandemNamespace_js_1 = require("./tandemNamespace.js");
// By default, the cache key is an IOType (like for a single parameter like PropertyIO)
var IOTypeCache = /** @class */ (function (_super) {
    __extends(IOTypeCache, _super);
    function IOTypeCache(entries) {
        var _this = _super.call(this, entries) || this;
        IOTypeCache.caches.push(_this);
        return _this;
    }
    IOTypeCache.clearAll = function () {
        IOTypeCache.caches.forEach(function (cache) { return cache.clear(); });
    };
    IOTypeCache.caches = [];
    return IOTypeCache;
}(Map));
tandemNamespace_js_1.default.register('IOTypeCache', IOTypeCache);
exports.default = IOTypeCache;
