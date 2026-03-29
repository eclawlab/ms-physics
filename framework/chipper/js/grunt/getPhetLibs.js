"use strict";
// Copyright 2017-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getPhetLibs;
/**
 * Determines a list of all dependent repositories (for dependencies.json or other creation)
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
/**
 * Returns a list of all dependent repositories.
 *
 * @param repo
 * @param [brand] - If not specified, it will return the dependencies for all brands.
 */
function getPhetLibs(repo, brand) {
    if (brand === undefined || brand.length === 0) {
        return getPhetLibs(repo, ChipperConstants_js_1.default.BRANDS);
    }
    else if (Array.isArray(brand)) {
        return lodash_1.default.reduce(brand, function (dependencies, brand) {
            return lodash_1.default.uniq(dependencies.concat(getPhetLibs(repo, brand)).sort());
        }, []);
    }
    else {
        var packageObject = JSON.parse((0, fs_1.readFileSync)("../".concat(repo, "/package.json"), 'utf8'));
        var buildObject_1;
        try {
            buildObject_1 = JSON.parse((0, fs_1.readFileSync)('../chipper/build.json', 'utf8'));
        }
        catch (e) {
            buildObject_1 = {};
        }
        // start with package.json
        var phetLibs_1 = packageObject &&
            packageObject.phet &&
            packageObject.phet.phetLibs ?
            packageObject.phet.phetLibs : [];
        // add the repo that's being built
        phetLibs_1.push(packageObject.name);
        // add common and brand-specific entries from build.json
        ['common', brand].forEach(function (id) {
            if (buildObject_1[id] && buildObject_1[id].phetLibs) {
                phetLibs_1 = phetLibs_1.concat(buildObject_1[id].phetLibs);
            }
        });
        // add brand specific dependencies from the package json
        if (packageObject.phet && packageObject.phet[brand] && packageObject.phet[brand].phetLibs) {
            phetLibs_1 = phetLibs_1.concat(packageObject.phet[brand].phetLibs);
        }
        // wrappers are also marked as phetLibs, so we can get their shas without listing them twice
        if (brand === 'phet-io' && packageObject.phet && packageObject.phet[brand] && packageObject.phet[brand].wrappers) {
            var wrapperRepos = (packageObject.phet[brand].wrappers).filter(function (wrapper) { return !wrapper.includes('/'); });
            phetLibs_1 = phetLibs_1.concat(wrapperRepos);
        }
        // sort and remove duplicates
        return lodash_1.default.uniq(phetLibs_1.sort());
    }
}
