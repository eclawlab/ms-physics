"use strict";
// Copyright 2019-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An object that contains a value for each item in an enumeration.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
// T = enumeration value type
// U = mapped value type
var EnumerationMap = /** @class */ (function () {
    /**
     * @param enumeration
     * @param factory - function( {TEnumeration.*} ) => {*}, maps an enumeration value to any value.
     */
    function EnumerationMap(enumeration, factory) {
        var _this = this;
        this._map = new Map();
        this._enumeration = enumeration;
        this._values = enumeration.enumeration.values;
        this._values.forEach(function (entry) {
            (0, affirm_js_1.default)(!_this._map.has(entry), 'Enumeration key override problem');
            _this._map.set(entry, factory(entry));
        });
    }
    /**
     * Returns the value associated with the given enumeration entry.
     */
    EnumerationMap.prototype.get = function (entry) {
        (0, affirm_js_1.default)(this._values.includes(entry));
        (0, affirm_js_1.default)(this._map.has(entry));
        return this._map.get(entry);
    };
    /**
     * Sets the value associated with the given enumeration entry.
     */
    EnumerationMap.prototype.set = function (entry, value) {
        (0, affirm_js_1.default)(this._values.includes(entry));
        this._map.set(entry, value);
    };
    /**
     * Returns a new EnumerationMap with mapped values.
     *
     * @param mapFunction - function( {*}, {TEnumeration.*} ): {*}
     * @returns With the mapped values
     */
    EnumerationMap.prototype.map = function (mapFunction) {
        var _this = this;
        return new EnumerationMap(this._enumeration, function (entry) { return mapFunction(_this.get(entry), entry); });
    };
    /**
     * Calls the callback on each item of the enumeration map.
     *
     * @param callback - function(value:*, enumerationValue:*)
     */
    EnumerationMap.prototype.forEach = function (callback) {
        var _this = this;
        this._values.forEach(function (entry) { return callback(_this.get(entry), entry); });
    };
    /**
     * Returns the values stored in the map, as an array
     *
     */
    EnumerationMap.prototype.values = function () {
        var _this = this;
        return this._values.map(function (entry) { return _this.get(entry); });
    };
    return EnumerationMap;
}());
phetCore_js_1.default.register('EnumerationMap', EnumerationMap);
exports.default = EnumerationMap;
