"use strict";
// Copyright 2013-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Creates an array of results from an iterator that takes a callback.
 *
 * For instance, if calling a function f( g ) will call g( 1 ), g( 2 ), and g( 3 ),
 * collect( function( callback ) { f( callback ); } );
 * will return [1,2,3].
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("./phetCore.js");
function collect(iterate) {
    var result = [];
    iterate(function (ob) {
        result.push(ob);
    });
    return result;
}
phetCore_js_1.default.register('collect', collect);
exports.default = collect;
