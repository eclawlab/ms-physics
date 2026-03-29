"use strict";
// Copyright 2018-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates a simple enumeration, with most of the boilerplate.
 *
 * An EnumerationDeprecated can be created like this:
 *
 *   const CardinalDirection = EnumerationDeprecated.byKeys( [ 'NORTH', 'SOUTH', 'EAST', 'WEST' ] );
 *
 * OR using rich values like so:
 *
 *   const CardinalDirection = EnumerationDeprecated.byMap( {NORTH: northObject, SOUTH: southObject, EAST: eastObject, WEST: westObject} );
 *
 * and values are referenced like this:
 *
 *   CardinalDirection.NORTH;
 *   CardinalDirection.SOUTH;
 *   CardinalDirection.EAST;
 *   CardinalDirection.WEST;
 *
 *   CardinalDirection.VALUES;
 *   // returns [ CardinalDirection.NORTH, CardinalDirection.SOUTH, CardinalDirection.EAST, CardinalDirection.WEST ]
 *
 * And support for checking whether any value is a value of the enumeration:
 *
 *   CardinalDirection.includes( CardinalDirection.NORTH ); // true
 *   CardinalDirection.includes( CardinalDirection.SOUTHWEST ); // false
 *   CardinalDirection.includes( 'NORTH' ); // false, values are not strings
 *
 * Conventions for using EnumerationDeprecated, from https://github.com/phetsims/phet-core/issues/53:
 *
 * (1) Enumerations are named like classes/types. Nothing in the name needs to identify that they are Enumerations.
 *     See the example above: CardinalDirection, not CardinalDirectionEnum or CardinalDirectionEnumeration.
 *
 * (2) EnumerationDeprecated values are named like constants, using uppercase. See the example above.
 *
 * (3) If an EnumerationDeprecated is closely related to some class, then make it a static field of that class. If an
 *     EnumerationDeprecated is specific to a Property, then the EnumerationDeprecated should likely be owned by the class that
 *     owns that Property.
 *
 * (4) If an EnumerationDeprecated is not closely related to some class, then put the EnumerationDeprecated in its own .js file.
 *     Do not combine multiple Enumerations into one file.
 *
 * (5) If a Property takes an EnumerationDeprecated value, its validation typically looks like this:
 *
 *     const cardinalDirectionProperty = new Property( CardinalDirection.NORTH, {
 *       validValues: CardinalDirection.VALUES
 *     }
 *
 * (6) Values of the EnumerationDeprecated are considered instances of the EnumerationDeprecated in documentation. For example, a method
 *     that that takes an EnumerationDeprecated value as an argument would be documented like this:
 *
 *     // @param mode - value from Scene EnumerationDeprecated
 *     setSceneMode( mode ) {
 *       affirm( Scene.includes( mode ) );
 *       //...
 *     }
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var lodash_js_1 = require("../../sherpa/js/lodash.js");
var deprecationWarning_js_1 = require("./deprecationWarning.js");
var merge_js_1 = require("./merge.js");
var phetCore_js_1 = require("./phetCore.js");
/**
 * @deprecated
 */
var EnumerationDeprecated = /** @class */ (function () {
    /**
     * @param config - must provide keys such as {keys:['RED','BLUE]}
     *                          - or map such as {map:{RED: myRedValue, BLUE: myBlueValue}}
     *
     * clients should use EnumerationDeprecated.byKeys or EnumerationDeprecated.byMap
     */
    function EnumerationDeprecated(config) {
        var _this = this;
        var _a;
        (0, deprecationWarning_js_1.default)('EnumerationDeprecated should be exchanged for classes that extend EnumerationValue, see WilderEnumerationPatterns for examples.');
        (0, affirm_js_1.default)(config, 'config must be provided');
        var keysProvided = !!config.keys;
        var mapProvided = !!config.map;
        (0, affirm_js_1.default)(keysProvided !== mapProvided, 'must provide one or the other but not both of keys/map');
        var keys = config.keys || Object.keys(config.map);
        var map = config.map || {};
        config = (0, merge_js_1.default)({
            // {string|null} Will be appended to the EnumerationIO documentation, if provided
            phetioDocumentation: null,
            // {function(EnumerationDeprecated):|null} If provided, it will be called as beforeFreeze( enumeration ) just before the
            // enumeration is frozen. Since it's not possible to modify the enumeration after
            // it is frozen (e.g. adding convenience functions), and there is no reference to
            // the enumeration object beforehand, this allows defining custom values/methods
            // on the enumeration object itself.
            beforeFreeze: null
        }, config);
        (0, affirm_js_1.default)(Array.isArray(keys), 'Values should be an array');
        (0, affirm_js_1.default)(lodash_js_1.default.uniq(keys).length === keys.length, 'There should be no duplicated values provided');
        (0, affirm_js_1.isAffirmEnabled)() && keys.forEach(function (value) { return (0, affirm_js_1.default)(typeof value === 'string', 'Each value should be a string'); });
        (0, affirm_js_1.isAffirmEnabled)() && keys.forEach(function (value) { return (0, affirm_js_1.default)(/^[A-Z][A-Z0-9_]*$/g.test(value), 'EnumerationDeprecated values should be uppercase alphanumeric with underscores and begin with a letter'); });
        (0, affirm_js_1.default)(!lodash_js_1.default.includes(keys, 'VALUES'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
        (0, affirm_js_1.default)(!lodash_js_1.default.includes(keys, 'KEYS'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
        (0, affirm_js_1.default)(!lodash_js_1.default.includes(keys, 'includes'), 'This is the name of a built-in provided value, so it cannot be included as an enumeration value');
        this.phetioDocumentation = (_a = config.phetioDocumentation) !== null && _a !== void 0 ? _a : null;
        this.KEYS = keys;
        this.VALUES = [];
        keys.forEach(function (key) {
            var value = (map[key] || {});
            // Set attributes of the enumeration value
            (0, affirm_js_1.default)(value.name === undefined, '"rich" enumeration values cannot provide their own name attribute');
            (0, affirm_js_1.default)(value.toString === Object.prototype.toString, '"rich" enumeration values cannot provide their own toString');
            // PhET-iO public API relies on this mapping, do not change it lightly
            value.name = key;
            value.toString = function () { return key; };
            // Assign to the enumeration
            // @ts-expect-error - dynamic property assignment by key
            _this[key] = value;
            _this.VALUES.push(value);
        });
        config.beforeFreeze && config.beforeFreeze(this);
        (0, affirm_js_1.isAffirmEnabled)() && Object.freeze(this);
        (0, affirm_js_1.isAffirmEnabled)() && Object.freeze(this.VALUES);
        (0, affirm_js_1.isAffirmEnabled)() && Object.freeze(this.KEYS);
        (0, affirm_js_1.isAffirmEnabled)() && keys.forEach(function (key) { return (0, affirm_js_1.isAffirmEnabled)() && Object.freeze(map[key]); });
    }
    /**
     * Based solely on the keys in EnumerationDeprecated.
     */
    EnumerationDeprecated.prototype.toString = function () {
        return this.KEYS.join(', ');
    };
    /**
     * Checks whether the given value is a value of this enumeration. Should generally be used for assertions
     */
    EnumerationDeprecated.prototype.includes = function (value) {
        return lodash_js_1.default.includes(this.VALUES, value);
    };
    /**
     * To support consistent API with Enumeration.
     */
    EnumerationDeprecated.prototype.getValue = function (key) {
        // @ts-expect-error - dynamic property access by key
        return this[key];
    };
    /**
     * To support consistent API with Enumeration.
     */
    EnumerationDeprecated.prototype.getKey = function (enumerationValue) {
        return enumerationValue.name;
    };
    Object.defineProperty(EnumerationDeprecated.prototype, "values", {
        /**
         * To support consistent API with Enumeration.
         */
        get: function () {
            return this.VALUES;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnumerationDeprecated.prototype, "keys", {
        /**
         * To support consistent API with Enumeration.
         */
        get: function () {
            return this.KEYS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(EnumerationDeprecated.prototype, "enumeration", {
        /**
         * To support consistent API with Enumeration.
         */
        get: function () {
            return this;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Creates an enumeration based on the provided string array
     * @param keys - such as ['RED','BLUE']
     * @param [options]
     */
    EnumerationDeprecated.byKeys = function (keys, options) {
        (0, affirm_js_1.default)(Array.isArray(keys), 'keys must be an array');
        (0, affirm_js_1.default)(!options || options.keys === undefined);
        return new EnumerationDeprecated((0, merge_js_1.default)({ keys: keys }, options));
    };
    /**
     * Creates a "rich" enumeration based on the provided map
     * @param map - such as {RED: myRedValue, BLUE: myBlueValue}
     * @param [options]
     */
    EnumerationDeprecated.byMap = function (map, options) {
        (0, affirm_js_1.default)(!options || options.map === undefined);
        if ((0, affirm_js_1.isAffirmEnabled)()) {
            var values_1 = lodash_js_1.default.values(map);
            (0, affirm_js_1.default)(values_1.length >= 1, 'must have at least 2 entries in an enumeration');
            (0, affirm_js_1.default)(lodash_js_1.default.every(values_1, function (value) { return value.constructor === values_1[0].constructor; }), 'Values must have same constructor');
        }
        return new EnumerationDeprecated((0, merge_js_1.default)({ map: map }, options));
    };
    return EnumerationDeprecated;
}());
phetCore_js_1.default.register('EnumerationDeprecated', EnumerationDeprecated);
exports.default = EnumerationDeprecated;
