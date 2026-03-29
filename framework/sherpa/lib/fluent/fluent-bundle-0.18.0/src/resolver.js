"use strict";
/* global Intl */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveComplexPattern = resolveComplexPattern;
/**
 * @overview
 *
 * The role of the Fluent resolver is to format a `Pattern` to an instance of
 * `FluentValue`. For performance reasons, primitive strings are considered
 * such instances, too.
 *
 * Translations can contain references to other messages or variables,
 * conditional logic in form of select expressions, traits which describe their
 * grammatical features, and can use Fluent builtins which make use of the
 * `Intl` formatters to format numbers and dates into the bundle's languages.
 * See the documentation of the Fluent syntax for more information.
 *
 * In case of errors the resolver will try to salvage as much of the
 * translation as possible. In rare situations where the resolver didn't know
 * how to recover from an error it will return an instance of `FluentNone`.
 *
 * All expressions resolve to an instance of `FluentValue`. The caller should
 * use the `toString` method to convert the instance to a native value.
 *
 * Functions in this file pass around an instance of the `Scope` class, which
 * stores the data required for successful resolution and error recovery.
 */
var types_js_1 = require("./types.js");
/**
 * The maximum number of placeables which can be expanded in a single call to
 * `formatPattern`. The limit protects against the Billion Laughs and Quadratic
 * Blowup attacks. See https://msdn.microsoft.com/en-us/magazine/ee335713.aspx.
 */
var MAX_PLACEABLES = 100;
/** Unicode bidi isolation characters. */
var FSI = "\u2068";
var PDI = "\u2069";
/** Helper: match a variant key to the given selector. */
function match(scope, selector, key) {
    if (key === selector) {
        // Both are strings.
        return true;
    }
    // XXX Consider comparing options too, e.g. minimumFractionDigits.
    if (key instanceof types_js_1.FluentNumber &&
        selector instanceof types_js_1.FluentNumber &&
        key.value === selector.value) {
        return true;
    }
    if (selector instanceof types_js_1.FluentNumber && typeof key === "string") {
        var category = scope
            .memoizeIntlObject(Intl.PluralRules, selector.opts)
            .select(selector.value);
        if (key === category) {
            return true;
        }
    }
    return false;
}
/** Helper: resolve the default variant from a list of variants. */
function getDefault(scope, variants, star) {
    if (variants[star]) {
        return resolvePattern(scope, variants[star].value);
    }
    scope.reportError(new RangeError("No default"));
    return new types_js_1.FluentNone();
}
/** Helper: resolve arguments to a call expression. */
function getArguments(scope, args) {
    var positional = [];
    var named = Object.create(null);
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        if (arg.type === "narg") {
            named[arg.name] = resolveExpression(scope, arg.value);
        }
        else {
            positional.push(resolveExpression(scope, arg));
        }
    }
    return { positional: positional, named: named };
}
/** Resolve an expression to a Fluent type. */
function resolveExpression(scope, expr) {
    switch (expr.type) {
        case "str":
            return expr.value;
        case "num":
            return new types_js_1.FluentNumber(expr.value, {
                minimumFractionDigits: expr.precision,
            });
        case "var":
            return resolveVariableReference(scope, expr);
        case "mesg":
            return resolveMessageReference(scope, expr);
        case "term":
            return resolveTermReference(scope, expr);
        case "func":
            return resolveFunctionReference(scope, expr);
        case "select":
            return resolveSelectExpression(scope, expr);
        default:
            return new types_js_1.FluentNone();
    }
}
/** Resolve a reference to a variable. */
function resolveVariableReference(scope, _a) {
    var name = _a.name;
    var arg;
    if (scope.params) {
        // We're inside a TermReference. It's OK to reference undefined parameters.
        if (Object.prototype.hasOwnProperty.call(scope.params, name)) {
            arg = scope.params[name];
        }
        else {
            return new types_js_1.FluentNone("$".concat(name));
        }
    }
    else if (scope.args &&
        Object.prototype.hasOwnProperty.call(scope.args, name)) {
        // We're in the top-level Pattern or inside a MessageReference. Missing
        // variables references produce ReferenceErrors.
        arg = scope.args[name];
    }
    else {
        scope.reportError(new ReferenceError("Unknown variable: $".concat(name)));
        return new types_js_1.FluentNone("$".concat(name));
    }
    // Return early if the argument already is an instance of FluentType.
    if (arg instanceof types_js_1.FluentType) {
        return arg;
    }
    // Convert the argument to a Fluent type.
    switch (typeof arg) {
        case "string":
            return arg;
        case "number":
            return new types_js_1.FluentNumber(arg);
        case "object":
            if (arg instanceof Date) {
                return new types_js_1.FluentDateTime(arg.getTime());
            }
        // eslint-disable-next-line no-fallthrough
        default:
            scope.reportError(new TypeError("Variable type not supported: $".concat(name, ", ").concat(typeof arg)));
            return new types_js_1.FluentNone("$".concat(name));
    }
}
/** Resolve a reference to another message. */
function resolveMessageReference(scope, _a) {
    var name = _a.name, attr = _a.attr;
    var message = scope.bundle._messages.get(name);
    if (!message) {
        scope.reportError(new ReferenceError("Unknown message: ".concat(name)));
        return new types_js_1.FluentNone(name);
    }
    if (attr) {
        var attribute = message.attributes[attr];
        if (attribute) {
            return resolvePattern(scope, attribute);
        }
        scope.reportError(new ReferenceError("Unknown attribute: ".concat(attr)));
        return new types_js_1.FluentNone("".concat(name, ".").concat(attr));
    }
    if (message.value) {
        return resolvePattern(scope, message.value);
    }
    scope.reportError(new ReferenceError("No value: ".concat(name)));
    return new types_js_1.FluentNone(name);
}
/** Resolve a call to a Term with key-value arguments. */
function resolveTermReference(scope, _a) {
    var name = _a.name, attr = _a.attr, args = _a.args;
    var id = "-".concat(name);
    var term = scope.bundle._terms.get(id);
    if (!term) {
        scope.reportError(new ReferenceError("Unknown term: ".concat(id)));
        return new types_js_1.FluentNone(id);
    }
    if (attr) {
        var attribute = term.attributes[attr];
        if (attribute) {
            // Every TermReference has its own variables.
            scope.params = getArguments(scope, args).named;
            var resolved_1 = resolvePattern(scope, attribute);
            scope.params = null;
            return resolved_1;
        }
        scope.reportError(new ReferenceError("Unknown attribute: ".concat(attr)));
        return new types_js_1.FluentNone("".concat(id, ".").concat(attr));
    }
    scope.params = getArguments(scope, args).named;
    var resolved = resolvePattern(scope, term.value);
    scope.params = null;
    return resolved;
}
/** Resolve a call to a Function with positional and key-value arguments. */
function resolveFunctionReference(scope, _a) {
    var name = _a.name, args = _a.args;
    // Some functions are built-in. Others may be provided by the runtime via
    // the `FluentBundle` constructor.
    var func = scope.bundle._functions[name];
    if (!func) {
        scope.reportError(new ReferenceError("Unknown function: ".concat(name, "()")));
        return new types_js_1.FluentNone("".concat(name, "()"));
    }
    if (typeof func !== "function") {
        scope.reportError(new TypeError("Function ".concat(name, "() is not callable")));
        return new types_js_1.FluentNone("".concat(name, "()"));
    }
    try {
        var resolved = getArguments(scope, args);
        return func(resolved.positional, resolved.named);
    }
    catch (err) {
        scope.reportError(err);
        return new types_js_1.FluentNone("".concat(name, "()"));
    }
}
/** Resolve a select expression to the member object. */
function resolveSelectExpression(scope, _a) {
    var selector = _a.selector, variants = _a.variants, star = _a.star;
    var sel = resolveExpression(scope, selector);
    if (sel instanceof types_js_1.FluentNone) {
        return getDefault(scope, variants, star);
    }
    // Match the selector against keys of each variant, in order.
    for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
        var variant = variants_1[_i];
        var key = resolveExpression(scope, variant.key);
        if (match(scope, sel, key)) {
            return resolvePattern(scope, variant.value);
        }
    }
    return getDefault(scope, variants, star);
}
/** Resolve a pattern (a complex string with placeables). */
function resolveComplexPattern(scope, ptn) {
    if (scope.dirty.has(ptn)) {
        scope.reportError(new RangeError("Cyclic reference"));
        return new types_js_1.FluentNone();
    }
    // Tag the pattern as dirty for the purpose of the current resolution.
    scope.dirty.add(ptn);
    var result = [];
    // Wrap interpolations with Directional Isolate Formatting characters
    // only when the pattern has more than one element.
    var useIsolating = scope.bundle._useIsolating && ptn.length > 1;
    for (var _i = 0, ptn_1 = ptn; _i < ptn_1.length; _i++) {
        var elem = ptn_1[_i];
        if (typeof elem === "string") {
            result.push(scope.bundle._transform(elem));
            continue;
        }
        scope.placeables++;
        if (scope.placeables > MAX_PLACEABLES) {
            scope.dirty.delete(ptn);
            // This is a fatal error which causes the resolver to instantly bail out
            // on this pattern. The length check protects against excessive memory
            // usage, and throwing protects against eating up the CPU when long
            // placeables are deeply nested.
            throw new RangeError("Too many placeables expanded: ".concat(scope.placeables, ", ") +
                "max allowed is ".concat(MAX_PLACEABLES));
        }
        if (useIsolating) {
            result.push(FSI);
        }
        result.push(resolveExpression(scope, elem).toString(scope));
        if (useIsolating) {
            result.push(PDI);
        }
    }
    scope.dirty.delete(ptn);
    return result.join("");
}
/**
 * Resolve a simple or a complex Pattern to a FluentString
 * (which is really the string primitive).
 */
function resolvePattern(scope, value) {
    // Resolve a simple pattern.
    if (typeof value === "string") {
        return scope.bundle._transform(value);
    }
    return resolveComplexPattern(scope, value);
}
