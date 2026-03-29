"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FluentBundle = void 0;
var resolver_js_1 = require("./resolver.js");
var scope_js_1 = require("./scope.js");
var types_js_1 = require("./types.js");
var builtins_js_1 = require("./builtins.js");
var memoizer_js_1 = require("./memoizer.js");
/**
 * Message bundles are single-language stores of translation resources. They are
 * responsible for formatting message values and attributes to strings.
 */
var FluentBundle = /** @class */ (function () {
    /**
     * Create an instance of `FluentBundle`.
     *
     * @example
     * ```js
     * let bundle = new FluentBundle(["en-US", "en"]);
     *
     * let bundle = new FluentBundle(locales, {useIsolating: false});
     *
     * let bundle = new FluentBundle(locales, {
     *   useIsolating: true,
     *   functions: {
     *     NODE_ENV: () => process.env.NODE_ENV
     *   }
     * });
     * ```
     *
     * @param locales - Used to instantiate `Intl` formatters used by translations.
     * @param options - Optional configuration for the bundle.
     */
    function FluentBundle(locales, _a) {
        var _b = _a === void 0 ? {} : _a, functions = _b.functions, _c = _b.useIsolating, useIsolating = _c === void 0 ? true : _c, _d = _b.transform, transform = _d === void 0 ? function (v) { return v; } : _d;
        /** @ignore */
        this._terms = new Map();
        /** @ignore */
        this._messages = new Map();
        this.locales = Array.isArray(locales) ? locales : [locales];
        this._functions = __assign({ NUMBER: builtins_js_1.NUMBER, DATETIME: builtins_js_1.DATETIME }, functions);
        this._useIsolating = useIsolating;
        this._transform = transform;
        this._intls = (0, memoizer_js_1.getMemoizerForLocale)(locales);
    }
    /**
     * Check if a message is present in the bundle.
     *
     * @param id - The identifier of the message to check.
     */
    FluentBundle.prototype.hasMessage = function (id) {
        return this._messages.has(id);
    };
    /**
     * Return a raw unformatted message object from the bundle.
     *
     * Raw messages are `{value, attributes}` shapes containing translation units
     * called `Patterns`. `Patterns` are implementation-specific; they should be
     * treated as black boxes and formatted with `FluentBundle.formatPattern`.
     *
     * @param id - The identifier of the message to check.
     */
    FluentBundle.prototype.getMessage = function (id) {
        return this._messages.get(id);
    };
    /**
     * Add a translation resource to the bundle.
     *
     * @example
     * ```js
     * let res = new FluentResource("foo = Foo");
     * bundle.addResource(res);
     * bundle.getMessage("foo");
     * // → {value: .., attributes: {..}}
     * ```
     *
     * @param res
     * @param options
     */
    FluentBundle.prototype.addResource = function (res, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.allowOverrides, allowOverrides = _c === void 0 ? false : _c;
        var errors = [];
        for (var i = 0; i < res.body.length; i++) {
            var entry = res.body[i];
            if (entry.id.startsWith("-")) {
                // Identifiers starting with a dash (-) define terms. Terms are private
                // and cannot be retrieved from FluentBundle.
                if (allowOverrides === false && this._terms.has(entry.id)) {
                    errors.push(new Error("Attempt to override an existing term: \"".concat(entry.id, "\"")));
                    continue;
                }
                this._terms.set(entry.id, entry);
            }
            else {
                if (allowOverrides === false && this._messages.has(entry.id)) {
                    errors.push(new Error("Attempt to override an existing message: \"".concat(entry.id, "\"")));
                    continue;
                }
                this._messages.set(entry.id, entry);
            }
        }
        return errors;
    };
    /**
     * Format a `Pattern` to a string.
     *
     * Format a raw `Pattern` into a string. `args` will be used to resolve
     * references to variables passed as arguments to the translation.
     *
     * In case of errors `formatPattern` will try to salvage as much of the
     * translation as possible and will still return a string. For performance
     * reasons, the encountered errors are not returned but instead are appended
     * to the `errors` array passed as the third argument.
     *
     * If `errors` is omitted, the first encountered error will be thrown.
     *
     * @example
     * ```js
     * let errors = [];
     * bundle.addResource(
     *     new FluentResource("hello = Hello, {$name}!"));
     *
     * let hello = bundle.getMessage("hello");
     * if (hello.value) {
     *     bundle.formatPattern(hello.value, {name: "Jane"}, errors);
     *     // Returns "Hello, Jane!" and `errors` is empty.
     *
     *     bundle.formatPattern(hello.value, undefined, errors);
     *     // Returns "Hello, {$name}!" and `errors` is now:
     *     // [<ReferenceError: Unknown variable: name>]
     * }
     * ```
     */
    FluentBundle.prototype.formatPattern = function (pattern, args, errors) {
        if (args === void 0) { args = null; }
        if (errors === void 0) { errors = null; }
        // Resolve a simple pattern without creating a scope. No error handling is
        // required; by definition simple patterns don't have placeables.
        if (typeof pattern === "string") {
            return this._transform(pattern);
        }
        // Resolve a complex pattern.
        var scope = new scope_js_1.Scope(this, errors, args);
        try {
            var value = (0, resolver_js_1.resolveComplexPattern)(scope, pattern);
            return value.toString(scope);
        }
        catch (err) {
            if (scope.errors && err instanceof Error) {
                scope.errors.push(err);
                return new types_js_1.FluentNone().toString(scope);
            }
            throw err;
        }
    };
    return FluentBundle;
}());
exports.FluentBundle = FluentBundle;
