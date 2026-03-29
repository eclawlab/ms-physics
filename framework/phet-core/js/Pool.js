"use strict";
// Copyright 2022-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * PROTOTYPE version for better support
 *
 * Object pooling mixin, for cases where creating new objects is expensive, and we'd rather mark some objects as able
 * to be reused (i.e. 'in the pool'). This provides a pool of objects for each type it is invoked on. It allows for
 * getting "new" objects that can either be constructed OR pulled in from a pool, and requires that the objects are
 * essentially able to "re-run" the constructor. Then when putting the object back in the pool, references should be
 * released, so memory isn't leaked.
 *
 * With this style of pooling, the following should be standard boilerplate within the class:

 public freeToPool(): void {
 MyType.pool.freeToPool( this );
 }

 public static readonly pool = new Pool( MyType );

 * and can additionally implement TPoolable to make it clear that the type is pooled
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../perennial-alias/js/browser-and-node/affirm.js");
var optionize_js_1 = require("./optionize.js");
var phetCore_js_1 = require("./phetCore.js");
var Pool = /** @class */ (function () {
    // The `initialize` option is required if the type doesn't have a correctly-typed initialize method. Therefore, we
    // do some Typescript magic to require providedOptions if that's the case (otherwise providedOptions is optional).
    function Pool(type) {
        var providedOptionsSpread = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            providedOptionsSpread[_i - 1] = arguments[_i];
        }
        this.objects = [];
        var options = (0, optionize_js_1.default)()({
            defaultArguments: [],
            initialize: type.prototype.initialize,
            maxSize: 100,
            initialSize: 0,
            useDefaultConstruction: false
        }, providedOptionsSpread[0]);
        (0, affirm_js_1.default)(options.maxSize >= 0);
        (0, affirm_js_1.default)(options.initialSize >= 0);
        this._maxPoolSize = options.maxSize;
        // There is a madness to this craziness. We'd want to use the method noted at
        // https://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible, but the type is
        // not provided in the arguments array below. By calling bind on itself, we're able to get a version of bind that
        // inserts the constructor as the first argument of the .apply called later so we don't create garbage by having
        // to pack `arguments` into an array AND THEN concatenate it with a new first element (the type itself).
        this.partialConstructor = Function.prototype.bind.bind(type, type);
        // Basically our type constructor, but with the default arguments included already.
        this.DefaultConstructor = this.partialConstructor.apply(this, options.defaultArguments); // eslint-disable-line @typescript-eslint/no-unnecessary-type-assertion
        this.initialize = options.initialize;
        (0, affirm_js_1.default)(this.initialize, 'Either pass in an initialize option, or provide a method named initialize on the type with the proper signature');
        this.useDefaultConstruction = options.useDefaultConstruction;
        // Initialize the pool (if it should have objects)
        while (this.objects.length < options.initialSize) {
            this.objects.push(this.createDefaultObject());
        }
    }
    Pool.prototype.createDefaultObject = function () {
        return new (this.DefaultConstructor)();
    };
    /**
     * Returns an object with arbitrary state (possibly constructed with the default arguments).
     */
    Pool.prototype.fetch = function () {
        return this.objects.length ? this.objects.pop() : this.createDefaultObject();
    };
    /**
     * Returns an object that behaves as if it was constructed with the given arguments. May result in a new object
     * being created (if the pool is empty), or it may use the constructor to mutate an object from the pool.
     */
    Pool.prototype.create = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var result;
        if (this.objects.length) {
            result = this.objects.pop();
            this.initialize.apply(result, args);
        }
        else if (this.useDefaultConstruction) {
            result = this.createDefaultObject();
            this.initialize.apply(result, args);
        }
        else {
            result = new (this.partialConstructor.apply(this, args))();
        }
        return result;
    };
    Object.defineProperty(Pool.prototype, "poolSize", {
        /**
         * Returns the current size of the pool.
         */
        get: function () {
            return this.objects.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Pool.prototype, "maxPoolSize", {
        /**
         * Returns the maximum pool size.
         */
        get: function () {
            return this._maxPoolSize;
        },
        /**
         * Sets the maximum pool size.
         */
        set: function (value) {
            (0, affirm_js_1.default)(value === Number.POSITIVE_INFINITY || (Number.isInteger(value) && value >= 0), 'maxPoolSize should be a non-negative integer or infinity');
            this._maxPoolSize = value;
        },
        enumerable: false,
        configurable: true
    });
    Pool.prototype.freeToPool = function (object) {
        if (this.objects.length < this.maxPoolSize) {
            this.objects.push(object);
        }
    };
    Pool.prototype.forEach = function (callback) {
        this.objects.forEach(callback);
    };
    return Pool;
}());
exports.default = Pool;
phetCore_js_1.default.register('Pool', Pool);
