"use strict";
// Copyright 2014-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Multilink is used to link to multiple properties.  It is very similar to a DerivedProperty, but has no value and
 * does not conform to the Property API because it is intended for use with callbacks that do not compute a value.
 *
 * For situations where a reference to the Multilink instance is not needed (for calling dispose), use convenience
 * methods Multilink.multilink or Property.lazyLink to avoid these types of lint errors:
 *
 * // lint error: Do not use 'new' for side effects (no-new)
 * new Multilink( ... );
 *
 * // lint error: 'multilink' is assigned a value but never used (no-unused-vars)
 * const multilink = new Multilink( ... );
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var axon_js_1 = require("./axon.js");
var Multilink = /** @class */ (function () {
    function Multilink(dependencies, callback, lazy) {
        var _this = this;
        this.dependencies = dependencies;
        assert && assert(dependencies.every(_.identity), 'dependencies should all be truthy');
        assert && assert(dependencies.length === _.uniq(dependencies).length, 'duplicate dependencies');
        this.dependencyListeners = new Map();
        // When a dependency value changes, update the list of dependencies and call back to the callback
        dependencies.forEach(function (dependency) {
            var listener = function () {
                // don't call listener if this Multilink has been disposed, see https://github.com/phetsims/axon/issues/192
                if (!_this.isDisposed) {
                    var values = dependencies.map(function (dependency) { return dependency.get(); });
                    callback.apply(void 0, values);
                }
            };
            _this.dependencyListeners.set(dependency, listener);
            dependency.lazyLink(listener, {
                // All other dependencies should undefer (taking deferred value) before this dependency notifies. This is
                // crucial to prevent this Multilink callback from firing with intermediate (buggy) states before all dependencies
                // have taken their final value.
                phetioDependencies: _.without(dependencies, dependency)
            });
        });
        // Send initial call back but only if we are non-lazy
        if (!lazy) {
            var values = dependencies.map(function (dependency) { return dependency.get(); });
            callback.apply(void 0, values);
        }
        this.isDisposed = false;
    }
    Object.defineProperty(Multilink.prototype, "definedDependencies", {
        /**
         * Returns dependencies that are guaranteed to be defined internally.
         */
        get: function () {
            assert && assert(this.dependencies !== null, 'Dependencies should be defined, has this Property been disposed?');
            return this.dependencies;
        },
        enumerable: false,
        configurable: true
    });
    Multilink.prototype.dispose = function () {
        assert && assert(this.dependencies, 'A Multilink cannot be disposed twice.');
        var dependencies = this.definedDependencies;
        // Unlink from dependent properties
        for (var i = 0; i < dependencies.length; i++) {
            var dependency = dependencies[i];
            var listener = this.dependencyListeners.get(dependency);
            assert && assert(listener, 'The listener should exist');
            if (dependency.hasListener(listener)) {
                dependency.unlink(listener);
            }
        }
        this.dependencies = null;
        this.dependencyListeners.clear();
        this.isDisposed = true;
    };
    Multilink.multilink = function (dependencies, callback) {
        return new Multilink(dependencies, callback, false /* lazy */);
    };
    /**
     * Create a Multilink from a dynamic or unknown number of dependencies.
     */
    Multilink.multilinkAny = function (dependencies, callback) {
        // @ts-expect-error
        return new Multilink(dependencies, callback);
    };
    Multilink.lazyMultilink = function (dependencies, callback) {
        return new Multilink(dependencies, callback, true /* lazy */);
    };
    /**
     * Create a lazy Multilink from a dynamic or unknown number of dependencies.
     */
    Multilink.lazyMultilinkAny = function (dependencies, callback) {
        // @ts-expect-error
        return new Multilink(dependencies, callback, true /* lazy */);
    };
    /**
     * Unlinks a listener that was added with multilink or lazyMultilink.
     */
    Multilink.unmultilink = function (multilink) {
        multilink.dispose();
    };
    return Multilink;
}());
exports.default = Multilink;
axon_js_1.default.register('Multilink', Multilink);
