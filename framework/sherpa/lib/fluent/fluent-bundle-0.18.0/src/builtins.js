"use strict";
/**
 * @overview
 *
 * The FTL resolver ships with a number of functions built-in.
 *
 * Each function take two arguments:
 *   - args - an array of positional args
 *   - opts - an object of key-value args
 *
 * Arguments to functions are guaranteed to already be instances of
 * `FluentValue`.  Functions must return `FluentValues` as well.
 */
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
exports.NUMBER = NUMBER;
exports.DATETIME = DATETIME;
var types_js_1 = require("./types.js");
function values(opts, allowed) {
    var unwrapped = Object.create(null);
    for (var _i = 0, _a = Object.entries(opts); _i < _a.length; _i++) {
        var _b = _a[_i], name_1 = _b[0], opt = _b[1];
        if (allowed.includes(name_1)) {
            unwrapped[name_1] = opt.valueOf();
        }
    }
    return unwrapped;
}
var NUMBER_ALLOWED = [
    "unitDisplay",
    "currencyDisplay",
    "useGrouping",
    "minimumIntegerDigits",
    "minimumFractionDigits",
    "maximumFractionDigits",
    "minimumSignificantDigits",
    "maximumSignificantDigits",
];
/**
 * The implementation of the `NUMBER()` builtin available to translations.
 *
 * Translations may call the `NUMBER()` builtin in order to specify formatting
 * options of a number. For example:
 *
 *     pi = The value of π is {NUMBER($pi, maximumFractionDigits: 2)}.
 *
 * The implementation expects an array of `FluentValues` representing the
 * positional arguments, and an object of named `FluentValues` representing the
 * named parameters.
 *
 * The following options are recognized:
 *
 *     unitDisplay
 *     currencyDisplay
 *     useGrouping
 *     minimumIntegerDigits
 *     minimumFractionDigits
 *     maximumFractionDigits
 *     minimumSignificantDigits
 *     maximumSignificantDigits
 *
 * Other options are ignored.
 *
 * @param args The positional arguments passed to this `NUMBER()`.
 * @param opts The named argments passed to this `NUMBER()`.
 */
function NUMBER(args, opts) {
    var arg = args[0];
    if (arg instanceof types_js_1.FluentNone) {
        return new types_js_1.FluentNone("NUMBER(".concat(arg.valueOf(), ")"));
    }
    if (arg instanceof types_js_1.FluentNumber) {
        return new types_js_1.FluentNumber(arg.valueOf(), __assign(__assign({}, arg.opts), values(opts, NUMBER_ALLOWED)));
    }
    if (arg instanceof types_js_1.FluentDateTime) {
        return new types_js_1.FluentNumber(arg.valueOf(), __assign({}, values(opts, NUMBER_ALLOWED)));
    }
    throw new TypeError("Invalid argument to NUMBER");
}
var DATETIME_ALLOWED = [
    "dateStyle",
    "timeStyle",
    "fractionalSecondDigits",
    "dayPeriod",
    "hour12",
    "weekday",
    "era",
    "year",
    "month",
    "day",
    "hour",
    "minute",
    "second",
    "timeZoneName",
];
/**
 * The implementation of the `DATETIME()` builtin available to translations.
 *
 * Translations may call the `DATETIME()` builtin in order to specify
 * formatting options of a number. For example:
 *
 *     now = It's {DATETIME($today, month: "long")}.
 *
 * The implementation expects an array of `FluentValues` representing the
 * positional arguments, and an object of named `FluentValues` representing the
 * named parameters.
 *
 * The following options are recognized:
 *
 *     dateStyle
 *     timeStyle
 *     fractionalSecondDigits
 *     dayPeriod
 *     hour12
 *     weekday
 *     era
 *     year
 *     month
 *     day
 *     hour
 *     minute
 *     second
 *     timeZoneName
 *
 * Other options are ignored.
 *
 * @param args The positional arguments passed to this `DATETIME()`.
 * @param opts The named argments passed to this `DATETIME()`.
 */
function DATETIME(args, opts) {
    var arg = args[0];
    if (arg instanceof types_js_1.FluentNone) {
        return new types_js_1.FluentNone("DATETIME(".concat(arg.valueOf(), ")"));
    }
    if (arg instanceof types_js_1.FluentDateTime) {
        return new types_js_1.FluentDateTime(arg.valueOf(), __assign(__assign({}, arg.opts), values(opts, DATETIME_ALLOWED)));
    }
    if (arg instanceof types_js_1.FluentNumber) {
        return new types_js_1.FluentDateTime(arg.valueOf(), __assign({}, values(opts, DATETIME_ALLOWED)));
    }
    throw new TypeError("Invalid argument to DATETIME");
}
