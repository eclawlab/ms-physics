"use strict";
// Copyright 2017-2026, University of Colorado Boulder
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
 * Creates a Property that does synchronization of values with a swappable Property that itself can change.
 * Handles the case where you need a Property that can switch between acting like multiple other Properties.
 *
 * With no other options specified, the value of this Property is:
 * - null, if valuePropertyProperty.value === null
 * - valuePropertyProperty.value.value otherwise
 *
 * The value of this Property (generalized, with the options available) is:
 * - derive( defaultValue ), if valuePropertyProperty.value === null
 * - map( derive( valuePropertyProperty.value ).value ) otherwise
 *
 * Generally, this DynamicProperty uses one-way synchronization (it only listens to the source), but if the
 * 'bidirectional' option is true, it will use two-way synchronization (changes to this Property will change the active
 * source). Thus when this Property changes value (when bidirectional is true), it will set:
 * - derive( valuePropertyProperty.value ).value = inverseMap( this.value ), if valuePropertyProperty.value !== null
 *
 *******************************
 * General example
 *******************************
 *   const firstProperty = new Property( Color.RED );
 *   const secondProperty = new Property( Color.BLUE );
 *   const currentProperty = new Property( firstProperty ); // {Property.<Property.<Color>>}
 *
 *   const backgroundFill = new DynamicProperty( currentProperty ) // Turns into a {Property.<Color>}
 *   backgroundFill.value; // Color.RED, since: currentProperty.value === firstProperty and
 *                                              firstProperty.value === Color.RED
 *   firstProperty.value = Color.YELLOW;
 *   backgroundFill.value; // Color.YELLOW - It's connected to firstProperty right now
 *
 *   currentProperty.value = secondProperty;
 *   backgroundFill.value; // Color.BLUE - It's the secondProperty's value
 *
 *   secondProperty.value = Color.MAGENTA;
 *   backgroundFill.value; // Color.MAGENTA - Yes, it's listening to the other Property now.
 *
 * Also supports falling back to null if our main Property is set to null:
 *   currentProperty.value = null;
 *   backgroundFill.value; // null
 *
 *******************************
 * 'derive' option
 *******************************
 * Additionally, DynamicProperty supports the ability to derive the Property value from our main Property's value.
 * For example, say you have multiple scenes each with the type:
 *   scene: {
 *     backgroundColorProperty: {Property.<Color>}
 *   }
 * and you have a currentSceneProperty: {Property.<Scene>}, you may want to create:
 *   const currentBackgroundColorProperty = new DynamicProperty( currentSceneProperty, {
 *     derive: 'backgroundColorProperty'
 *   } );
 * This would always report the current scene's current background color.
 * What if you sometimes don't have a scene active, e.g. {Property.<Scene|null>}? You can provide a default value:
 *  new DynamicProperty( currentSceneProperty, {
 *    derive: 'backgroundColorProperty',
 *    defaultValue: Color.BLACK
 *  } );
 * So that if the currentSceneProperty's value is null, the value of our DynamicProperty will be Color.BLACK.
 * NOTE there are constraints using derive: 'string' when using parametric type parameters. See https://github.com/phetsims/projectile-data-lab/issues/10
 *
 *******************************
 * 'bidirectional' option
 *******************************
 * If you would like for direct changes to this Property to change the original source (bidirectional synchronization),
 * then pass bidirectional:true:
 *   const firstProperty = new Property( 5 );
 *   const secondProperty = new Property( 10 );
 *   const numberPropertyProperty = new Property( firstProperty );
 *   const dynamicProperty = new DynamicProperty( numberPropertyProperty, { bidirectional: true } );
 *   dynamicProperty.value = 2; // allowed now that it is bidirectional, otherwise prohibited
 *   firstProperty.value; // 2
 *   numberPropertyProperty.value = secondProperty; // change which Property is active
 *   dynamicProperty.value; // 10, from the new Property
 *   dynamicProperty.value = 0;
 *   secondProperty.value; // 0, set above.
 *   firstProperty.value; // still 2 from above, since our dynamic Property switched to the other Property
 *
 *******************************
 * 'map' and 'inverseMap' options
 *******************************
 * DynamicProperty also supports mapping values to different types. For example, say we have a
 * numberPropertyProperty {Property.<Property.<number>>}, but want to have a {Property.<string>} as the output. Then:
 *   new DynamicProperty( numberPropertyProperty, {
 *     map: function( number ) { return '' + number; }
 *   } );
 * will do the trick. If this needs to be done with a bidirectional DynamicProperty, also include inverseMap:
 *   new DynamicProperty( numberPropertyProperty, {
 *     bidirectional: true,
 *     map: function( number ) { return '' + number; },
 *     inverseMap: function( string ) { return Number.parseFloat( string ); }
 *   } );
 * so that changes to the dynamic Property will result in a change in the numberPropertyProperty's value.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var optionize_js_1 = require("../../phet-core/js/optionize.js");
var axon_js_1 = require("./axon.js");
var ReadOnlyProperty_js_1 = require("./ReadOnlyProperty.js");
// ThisValueType: The value type of the resulting DynamicProperty
// InnerValueType: The value type of the inner (derived) Property, whose value gets mapped to ThisValueType and back
// OuterValueType: The value type of the main passed-in Property (whose value may be derived to the InnerValueType)
// e.g.:
// class Foo { colorProperty: Property<Color> }
// new DynamicProperty<number, Color, Foo>( someFooProperty, {
//   derive: 'colorProperty',
//   map: ( color: Color ) => color.alpha
// } );
// Here, ThisValueType=number (we're a Property<number>). You've passed in a Property<Foo>, so OuterValueType is a Foo.
// InnerValueType is what we get from our derive (Color), and what the parameter of our map is.
var DynamicProperty = /** @class */ (function (_super) {
    __extends(DynamicProperty, _super);
    /**
     * @param valuePropertyProperty - If the value is null, it is considered disconnected.
     * @param [providedOptions] - options
     */
    function DynamicProperty(valuePropertyProperty, providedOptions) {
        var _this = this;
        var options = (0, optionize_js_1.default)()({
            bidirectional: false,
            defaultValue: null,
            derive: _.identity,
            map: _.identity,
            inverseMap: _.identity
        }, providedOptions);
        var optionsDerive = options.derive;
        var optionsMap = options.map;
        var optionsInverseMap = options.inverseMap;
        var derive = typeof optionsDerive === 'function' ? optionsDerive : (function (u) { return u[optionsDerive]; });
        var map = typeof optionsMap === 'function' ? optionsMap : (function (v) { return v[optionsMap]; });
        var inverseMap = typeof optionsInverseMap === 'function' ? optionsInverseMap : (function (t) { return t[optionsInverseMap]; });
        // Use the Property's initial value
        var initialValue = valuePropertyProperty.value === null ?
            map(options.defaultValue) :
            map(derive(valuePropertyProperty.value).value);
        _this = _super.call(this, initialValue, options) || this;
        _this.defaultValue = options.defaultValue;
        _this.derive = derive;
        _this.map = map;
        _this.inverseMap = inverseMap;
        _this.bidirectional = options.bidirectional;
        _this.valuePropertyProperty = valuePropertyProperty;
        _this.isExternallyChanging = false;
        _this.propertyPropertyListener = _this.onPropertyPropertyChange.bind(_this);
        _this.propertyListener = _this.onPropertyChange.bind(_this);
        // Rehook our listener to whatever is the active Property.
        valuePropertyProperty.link(_this.propertyListener);
        // If we aren't bidirectional, we should never add this listener.
        if (options.bidirectional) {
            // No unlink needed, since our own disposal will remove this listener.
            _this.lazyLink(_this.onSelfChange.bind(_this));
        }
        return _this;
    }
    /**
     * Listener added to the active inner Property.
     *
     * @param value - Should be either our defaultValue (if valuePropertyProperty.value is null), or
     *                derive( valuePropertyProperty.value ).value otherwise.
     * @param oldValue - Ignored for our purposes, but is the 2nd parameter for Property listeners.
     * @param innerProperty
     */
    DynamicProperty.prototype.onPropertyPropertyChange = function (value, oldValue, innerProperty) {
        // If the value of the inner Property is already the inverse of our value, we will never attempt to update our
        // own value in an attempt to limit "ping-ponging" cases mainly due to numerical error. Otherwise it would be
        // possible, given certain values and map/inverse, for both Properties to toggle back-and-forth.
        // See https://github.com/phetsims/axon/issues/197 for more details.
        if (this.bidirectional && this.valuePropertyProperty.value !== null && innerProperty) {
            var currentProperty = this.derive(this.valuePropertyProperty.value);
            // Notably, we only want to cancel interactions if the Property that sent the notification is still the Property
            // we are paying attention to.
            if (currentProperty === innerProperty && innerProperty.areValuesEqual(this.inverseMap(this.value), innerProperty.get())) {
                return;
            }
        }
        // Since we override the setter here, we need to call the version on the prototype
        _super.prototype.set.call(this, this.map(value));
    };
    /**
     * Listener added to the outer Property.
     *
     * @param newPropertyValue - If derive is not provided then it should be a {Property.<*>|null}
     * @param oldPropertyValue - If derive is not provided then it should be a {Property.<*>|null}.
     *                                              We additionally handle the initial link() case where this is
     *                                              undefined.
     */
    DynamicProperty.prototype.onPropertyChange = function (newPropertyValue, oldPropertyValue) {
        if (oldPropertyValue) {
            var propertyThatIsDerived = this.derive(oldPropertyValue); // eslint-disable-line phet/require-property-suffix
            // This assertion is vital to prevent memory leaks, there are order-dependency cases where this may trigger, (like
            // for PhET-iO State in https://github.com/phetsims/buoyancy/issues/67). In these cases, this unlink should not be
            // graceful because there IS another propertyThatIsDerived out there with this listener attached.
            assert && assert(propertyThatIsDerived.hasListener(this.propertyPropertyListener), 'DynamicProperty tried to clean up a listener on its propertyProperty that doesn\'t exist.');
            propertyThatIsDerived.unlink(this.propertyPropertyListener);
        }
        if (newPropertyValue) {
            this.derive(newPropertyValue).link(this.propertyPropertyListener);
        }
        else {
            // Switch to null when our Property's value is null.
            this.onPropertyPropertyChange(this.defaultValue, null, null);
        }
    };
    /**
     * Listener added to ourself when we are bidirectional
     */
    DynamicProperty.prototype.onSelfChange = function (value) {
        assert && assert(this.bidirectional);
        if (this.valuePropertyProperty.value !== null) {
            var innerProperty = this.derive(this.valuePropertyProperty.value);
            // If our new value is the result of map() from the inner Property's value, we don't want to propagate that
            // change back to the innerProperty in the case where the map/inverseMap are not exact matches (generally due
            // to floating-point issues).
            // See https://github.com/phetsims/axon/issues/197 for more details.
            if (!this.areValuesEqual(value, this.map(innerProperty.value))) {
                // We'll fail at runtime if needed, this cast is needed since sometimes we can do non-bidirectional work on
                // things like a DerivedProperty
                innerProperty.value = this.inverseMap(value);
            }
        }
    };
    /**
     * Disposes this Property
     */
    DynamicProperty.prototype.dispose = function () {
        assert && assert(!this.isDisposed, 'should not dispose twice, especially for DynamicProperty cleanup');
        this.valuePropertyProperty.unlink(this.propertyListener);
        if (this.valuePropertyProperty.value !== null) {
            var propertyThatIsDerived = this.derive(this.valuePropertyProperty.value); // eslint-disable-line phet/require-property-suffix
            // This assertion is vital to prevent memory leaks, there are order-dependency cases where this may trigger, (like
            // for PhET-iO State in https://github.com/phetsims/buoyancy/issues/67). In these cases, this unlink should not be
            // graceful because there IS another propertyThatIsDerived out there with this listener attached, and so
            // this DynamicProperty won't be disposed.
            assert && assert(propertyThatIsDerived.hasListener(this.propertyPropertyListener), 'DynamicProperty tried to clean up a listener on its propertyProperty that doesn\'t exist.');
            propertyThatIsDerived.unlink(this.propertyPropertyListener);
        }
        _super.prototype.dispose.call(this);
    };
    /**
     * Resets the current property (if it's a Property instead of a TinyProperty)
     */
    DynamicProperty.prototype.reset = function () {
        assert && assert(this.bidirectional, 'Cannot reset a non-bidirectional DynamicProperty');
        if (this.valuePropertyProperty.value !== null) {
            var property = this.derive(this.valuePropertyProperty.value);
            property.reset();
        }
    };
    /**
     * Prevent setting this Property manually if it is not marked as bidirectional.
     */
    DynamicProperty.prototype.set = function (value) {
        assert && assert(this.bidirectional, "Cannot set values directly to a non-bidirectional DynamicProperty, tried to set: ".concat(value).concat(this.isPhetioInstrumented() ? ' for ' + this.phetioID : ''));
        this.isExternallyChanging = true;
        _super.prototype.set.call(this, value);
        this.isExternallyChanging = false;
    };
    Object.defineProperty(DynamicProperty.prototype, "value", {
        /**
         * Overridden to make public
         */
        get: function () {
            return _super.prototype.value;
        },
        /**
         * Overridden to make public
         * We ran performance tests on Chrome, and determined that calling super.value = newValue is statistically significantly
         * slower at the p = 0.10 level( looping over 10,000 value calls). Therefore, we prefer this optimization.
         */
        set: function (value) {
            this.set(value);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns true if this Property value can be set externally, by set() or .value =
     */
    DynamicProperty.prototype.isSettable = function () {
        return _super.prototype.isSettable.call(this) || this.bidirectional;
    };
    return DynamicProperty;
}(ReadOnlyProperty_js_1.default));
exports.default = DynamicProperty;
axon_js_1.default.register('DynamicProperty', DynamicProperty);
