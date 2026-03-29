"use strict";
// Copyright 2022-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Size and raster data for levels in a mipmap.  See also type Mipmap in Imageable.ts.  Defined in phet-core instead of
 * scenery because it is loaded upstream and should not have any downstream dependencies such as scenery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var asyncLoader_js_1 = require("../../../phet-core/js/asyncLoader.js");
var MipmapElement = /** @class */ (function () {
    function MipmapElement(width, height, url, lock) {
        if (lock === void 0) { lock = true; }
        var _this = this;
        this.width = width;
        this.height = height;
        this.url = url;
        this.img = new Image(); // eslint-disable-line phet/no-html-constructors
        this.img.src = this.url; // trigger the loading of the image for its level
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        var context = this.canvas.getContext('2d');
        var unlock = lock ? asyncLoader_js_1.default.createLock(this.img) : null;
        this.img.onload = function () {
            context.drawImage(_this.img, 0, 0);
            unlock && unlock();
        };
    }
    return MipmapElement;
}());
exports.default = MipmapElement;
