"use strict";
// Copyright 2022-2026, University of Colorado Boulder
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = optionize;
exports.optionize3 = optionize3;
exports.optionize4 = optionize4;
exports.combineOptions = combineOptions;
/**
 * Optionize is a TypeScript layer built on PHET_CORE/merge. Its goal is to satisfy type safety within PhET's "options"
 * pattern.
 *
 * For up-to-date examples on how to use this file and information about limitations and known problems, see
 * WILDER/WilderOptionsPatterns.ts.
 *
 * This pattern is still being solidified. Although the long term location of PhET's options pattern documentation
 * can be found at https://github.com/phetsims/phet-info/blob/main/doc/phet-software-design-patterns.md#options-and-config,
 * that document is currently out of date. Please see https://github.com/phetsims/phet-core/issues/128 for current
 * progress on this pattern.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var merge_js_1 = require("./merge.js");
var phetCore_js_1 = require("./phetCore.js");
// Factor out the merge arrow closure to avoid heap/cpu at runtime
var merge4 = function (a, b, c, d) { return (0, merge_js_1.default)(a, b, c, d); };
// ProvidedOptions = The type of this class's public API (type of the providedOptions parameter in the constructor)
// SelfOptions = Options that are defined by "this" class. Anything optional in this block must have a default provided in "defaults"
// ParentOptions = The public API for parent options, this will be exported by the parent class, like "NodeOptions"
// KeysUsedInSubclassConstructor = list of keys from ParentOptions that are used in this constructor.
function optionize() {
    return merge4;
}
// Use this function to gain the typing that optionize provides but in a case where the first argument is an empty object.
function optionize3() {
    return merge4;
}
/**
 * Use this function to replace merge in cases like:
 *
 * const options = m-e-r-g-e(
 *   {},
 *
 *   // ParentOptions defaults that are common throughout the sim
 *   MyConstants.SOME_COMMON_OPTIONS,
 *
 *   // SelfOptions and ParentOptions defaults that are provided by this class
 *   { ... },
 *
 *   // option values that are provided by the caller
 *   providedOptions );
 */
function optionize4() {
    return merge4;
}
// Use combineOptions to combine object literals (typically options) that all have the same type.
function combineOptions(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    return merge4.apply(void 0, __spreadArray([target], sources, false));
}
// function optionize<ProvidedOptions, // eslint-disable-line no-redeclare
//   SelfOptions = ProvidedOptions,
//   ParentOptions = EmptySelfOptions>():
//   <KeysUsedInSubclassConstructor extends keyof ( ParentOptions )>(
//     emptyObject: ObjectWithNoKeys,
//     defaults: OptionizeDefaults<SelfOptions, ParentOptions>,
//     providedOptions?: ProvidedOptions
//   ) => OptionizeDefaults<SelfOptions, ParentOptions> & ProvidedOptions & Required<Pick<ParentOptions, KeysUsedInSubclassConstructor>>;
//
// function optionize<ProvidedOptions, // eslint-disable-line no-redeclare
//   SelfOptions = ProvidedOptions,
//   ParentOptions = EmptySelfOptions,
//   KeysUsedInSubclassConstructor extends keyof ParentOptions = never>():
//   (
//     empytObject: ObjectWithNoKeys,
//     defaults: OptionizeDefaults<SelfOptions, ParentOptions, KeysUsedInSubclassConstructor>,
//     providedOptions?: ProvidedOptions
//   ) => ObjectWithNoKeys & OptionizeDefaults<SelfOptions, ParentOptions, KeysUsedInSubclassConstructor> & ProvidedOptions;
// The implementation gets "any" types because of the above signatures
// function optionize<???>() { return ( a: any, b?: any, c?: any ) => merge( a, b, c ); } // eslint-disable-line no-redeclare,bad-text
// TypeScript is all-or-none on inferring generic parameter types (per function), so we must use the nested strategy in
// https://stackoverflow.com/questions/63678306/typescript-partial-type-inference to specify the types we want
// while still allowing definitions to flow through.
// This also works, we will keep it here now in case it helps with further improvements with inference.
// const optionize = <S, P, M extends keyof P = never>() => {
//   return <B>( defaults: Required<Options<S>> & Partial<P> & Required<Pick<P, M>>, providedOptions?: B ) => {
//     return merge( defaults, providedOptions );
//   };
// };
/*
Limitation (I):

This gets us half way there, when you have required args to the parent, this makes sure that you don't make
providedOptions optional (with a question mark). We still need a way to note when the required param is specified via the self options.
const optionize = <S, P = EmptySelfOptions, M extends keyof P = never, A = S & P>(
  defaults: Required<Options<S>> & Partial<P> & Required<Pick<P, M>>,
  providedOptions: RequiredKeys<A> extends never ? ( A | undefined ) : A
) => {
  return merge( defaults, providedOptions );
};

TEST TO SEE IF WE CAN GET TYPESCRIPT TO KNOW ABOUT REQUIRED ARGUMENTS TO POTENTIALLY COME FROM EITHER ARG.
const optionize = <S, P = EmptySelfOptions, M extends keyof P = never, A = S & P>() => {
  type FirstArg = Required<Options<S>> & Partial<P> & Required<Pick<P, M>>;
  return (
    defaults: FirstArg,
    //NOT WORKING: If any required elements were in the first arg, then we don't need them here, and potentially can mark providedOptions as a whole as optional
    providedOptions: RequiredKeys<FirstArg> extends never ? RequiredKeys<A> extends never ? ( A | undefined ) : A : A
  ) => {
    return merge( defaults, providedOptions );
  };
};
 */
phetCore_js_1.default.register('optionize', optionize);
