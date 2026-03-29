"use strict";
/**
 * @module fluent
 * @overview
 *
 * `fluent` is a JavaScript implementation of Project Fluent, a localization
 * framework designed to unleash the expressive power of the natural language.
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentDateTime = exports.FluentNumber = exports.FluentNone = exports.FluentType = exports.FluentResource = exports.FluentBundle = void 0;
var bundle_js_1 = require("./bundle.js");
Object.defineProperty(exports, "FluentBundle", { enumerable: true, get: function () { return bundle_js_1.FluentBundle; } });
var resource_js_1 = require("./resource.js");
Object.defineProperty(exports, "FluentResource", { enumerable: true, get: function () { return resource_js_1.FluentResource; } });
var types_js_1 = require("./types.js");
Object.defineProperty(exports, "FluentType", { enumerable: true, get: function () { return types_js_1.FluentType; } });
Object.defineProperty(exports, "FluentNone", { enumerable: true, get: function () { return types_js_1.FluentNone; } });
Object.defineProperty(exports, "FluentNumber", { enumerable: true, get: function () { return types_js_1.FluentNumber; } });
Object.defineProperty(exports, "FluentDateTime", { enumerable: true, get: function () { return types_js_1.FluentDateTime; } });
