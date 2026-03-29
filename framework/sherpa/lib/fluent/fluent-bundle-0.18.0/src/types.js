"use strict";
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
exports.FluentDateTime = exports.FluentNumber = exports.FluentNone = exports.FluentType = void 0;
/**
 * The `FluentType` class is the base of Fluent's type system.
 *
 * Fluent types wrap JavaScript values and store additional configuration for
 * them, which can then be used in the `toString` method together with a proper
 * `Intl` formatter.
 */
var FluentType = /** @class */ (function () {
    /**
     * Create a `FluentType` instance.
     *
     * @param value The JavaScript value to wrap.
     */
    function FluentType(value) {
        this.value = value;
    }
    /**
     * Unwrap the raw value stored by this `FluentType`.
     */
    FluentType.prototype.valueOf = function () {
        return this.value;
    };
    return FluentType;
}());
exports.FluentType = FluentType;
/**
 * A `FluentType` representing no correct value.
 */
var FluentNone = /** @class */ (function (_super) {
    __extends(FluentNone, _super);
    /**
     * Create an instance of `FluentNone` with an optional fallback value.
     * @param value The fallback value of this `FluentNone`.
     */
    function FluentNone(value) {
        if (value === void 0) { value = "???"; }
        return _super.call(this, value) || this;
    }
    /**
     * Format this `FluentNone` to the fallback string.
     */
    FluentNone.prototype.toString = function (scope) {
        return "{".concat(this.value, "}");
    };
    return FluentNone;
}(FluentType));
exports.FluentNone = FluentNone;
/**
 * A `FluentType` representing a number.
 *
 * A `FluentNumber` instance stores the number value of the number it
 * represents. It may also store an option bag of options which will be passed
 * to `Intl.NumerFormat` when the `FluentNumber` is formatted to a string.
 */
var FluentNumber = /** @class */ (function (_super) {
    __extends(FluentNumber, _super);
    /**
     * Create an instance of `FluentNumber` with options to the
     * `Intl.NumberFormat` constructor.
     *
     * @param value The number value of this `FluentNumber`.
     * @param opts Options which will be passed to `Intl.NumberFormat`.
     */
    function FluentNumber(value, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, value) || this;
        _this.opts = opts;
        return _this;
    }
    /**
     * Format this `FluentNumber` to a string.
     */
    FluentNumber.prototype.toString = function (scope) {
        try {
            var nf = scope.memoizeIntlObject(Intl.NumberFormat, this.opts);
            return nf.format(this.value);
        }
        catch (err) {
            scope.reportError(err);
            return this.value.toString(10);
        }
    };
    return FluentNumber;
}(FluentType));
exports.FluentNumber = FluentNumber;
/**
 * A `FluentType` representing a date and time.
 *
 * A `FluentDateTime` instance stores the number value of the date it
 * represents, as a numerical timestamp in milliseconds. It may also store an
 * option bag of options which will be passed to `Intl.DateTimeFormat` when the
 * `FluentDateTime` is formatted to a string.
 */
var FluentDateTime = /** @class */ (function (_super) {
    __extends(FluentDateTime, _super);
    /**
     * Create an instance of `FluentDateTime` with options to the
     * `Intl.DateTimeFormat` constructor.
     *
     * @param value The number value of this `FluentDateTime`, in milliseconds.
     * @param opts Options which will be passed to `Intl.DateTimeFormat`.
     */
    function FluentDateTime(value, opts) {
        if (opts === void 0) { opts = {}; }
        var _this = _super.call(this, value) || this;
        _this.opts = opts;
        return _this;
    }
    /**
     * Format this `FluentDateTime` to a string.
     */
    FluentDateTime.prototype.toString = function (scope) {
        try {
            var dtf = scope.memoizeIntlObject(Intl.DateTimeFormat, this.opts);
            return dtf.format(this.value);
        }
        catch (err) {
            scope.reportError(err);
            return new Date(this.value).toISOString();
        }
    };
    return FluentDateTime;
}(FluentType));
exports.FluentDateTime = FluentDateTime;
