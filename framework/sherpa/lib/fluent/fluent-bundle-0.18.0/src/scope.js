"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scope = void 0;
var Scope = /** @class */ (function () {
    function Scope(bundle, errors, args) {
        /**
         * The Set of patterns already encountered during this resolution.
         * Used to detect and prevent cyclic resolutions.
         * @ignore
         */
        this.dirty = new WeakSet();
        /** A dict of parameters passed to a TermReference. */
        this.params = null;
        /**
         * The running count of placeables resolved so far.
         * Used to detect the Billion Laughs and Quadratic Blowup attacks.
         * @ignore
         */
        this.placeables = 0;
        this.bundle = bundle;
        this.errors = errors;
        this.args = args;
    }
    Scope.prototype.reportError = function (error) {
        if (!this.errors || !(error instanceof Error)) {
            throw error;
        }
        this.errors.push(error);
    };
    Scope.prototype.memoizeIntlObject = function (ctor, opts) {
        var cache = this.bundle._intls.get(ctor);
        if (!cache) {
            cache = {};
            this.bundle._intls.set(ctor, cache);
        }
        var id = JSON.stringify(opts);
        if (!cache[id]) {
            // @ts-expect-error
            cache[id] = new ctor(this.bundle.locales, opts);
        }
        return cache[id];
    };
    return Scope;
}());
exports.Scope = Scope;
