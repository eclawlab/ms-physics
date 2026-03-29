"use strict";
// Copyright 2019-2026, University of Colorado Boulder
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
/**
 * Runs webpack - DO NOT RUN MULTIPLE CONCURRENTLY
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
var lodash_1 = require("lodash");
var modify_source_webpack_plugin_1 = require("modify-source-webpack-plugin");
var path_1 = require("path");
var dirname_js_1 = require("../../../perennial-alias/js/common/dirname.js");
var ChipperConstants_js_1 = require("../common/ChipperConstants.js");
var webpackGlobalLibraries_js_1 = require("../common/webpackGlobalLibraries.js");
var webpack = require('webpack');
// @ts-expect-error - until we have "type": "module" in our package.json
var __dirname = (0, dirname_js_1.default)(import.meta.url);
var activeRepos = fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../../../perennial-alias/data/active-repos'), 'utf-8').trim().split(/\r?\n/).map(function (s) { return s.trim(); });
var reposByNamespace = {};
var aliases = {};
for (var _i = 0, activeRepos_1 = activeRepos; _i < activeRepos_1.length; _i++) {
    var repo = activeRepos_1[_i];
    var packageFile = path_1.default.resolve(__dirname, "../../../".concat(repo, "/package.json"));
    if (fs_1.default.existsSync(packageFile)) {
        var packageObject = JSON.parse(fs_1.default.readFileSync(packageFile, 'utf-8'));
        if (packageObject.phet && packageObject.phet.requirejsNamespace) {
            reposByNamespace[packageObject.phet.requirejsNamespace] = repo;
            aliases[packageObject.phet.requirejsNamespace] = path_1.default.resolve(__dirname, "../../../".concat(repo).concat(repo === 'brand' ? '/phet' : '', "/js"));
        }
    }
}
var getModuleRules = function getModuleRules() {
    return Object.keys(webpackGlobalLibraries_js_1.default).map(function (globalKey) {
        return {
            // path.join to normalize on the right path separator, perhaps there is another way?!
            test: function (fileName) { return fileName.includes(path_1.default.join(webpackGlobalLibraries_js_1.default[globalKey])); },
            loader: '../chipper/node_modules/expose-loader',
            options: {
                exposes: globalKey
            }
        };
    });
};
/**
 * Convert absolute paths of modules to relative ones
 */
var getRelativeModules = function (modules) {
    var root = path_1.default.resolve(__dirname, '../../../');
    return modules
        // Webpack 5 reports intermediate paths which need to be filtered out
        .filter(function (m) { return fs_1.default.lstatSync(m).isFile(); })
        // Get the relative path to the root, like "joist/js/Sim.js" or, on Windows, "joist\js\Sim.js"
        .map(function (m) { return path_1.default.relative(root, m); })
        // Some developers check in a package.json to the root of the checkouts, as described in https://github.com/phetsims/chipper/issues/494#issuecomment-821292542
        // like: /Users/samreid/apache-document-root/package.json. This powers grunt only and should not be included in the modules
        .filter(function (m) { return m !== '../package.json' && m !== '..\\package.json'; });
};
/**
 * Runs webpack - DO NOT RUN MULTIPLE CONCURRENTLY
 *
 * @returns The combined JS output from the process
 */
var webpackBuild = function webpackBuild(repo, brand, providedOptions) {
    return new Promise(function (resolve, reject) {
        var options = lodash_1.default.merge({
            outputDir: repo
        }, providedOptions);
        var outputDir = path_1.default.resolve(__dirname, "../../".concat(ChipperConstants_js_1.default.BUILD_DIR), options.outputDir);
        var outputFileName = "".concat(repo, ".js");
        var outputPath = path_1.default.resolve(outputDir, outputFileName);
        // Create plugins to ignore brands that we are not building at this time. Here "resource" is the module getting
        // imported, and "context" is the directory that holds the module doing the importing. This is split up because
        // of how brands are loaded in simLauncher.js. They are a dynamic import who's import path resolves to the current
        // brand. The way that webpack builds this is by creating a map of all the potential resources that could be loaded
        // by that import (by looking at the file structure). Thus the following resource/context regex split is accounting
        // for the "map" created in the built webpack file, in which the "resource" starts with "./{{brand}}" even though
        // the simLauncher line includes the parent directory: "brand/". For more details see https://github.com/phetsims/chipper/issues/879
        var ignorePhetBrand = new webpack.IgnorePlugin({ resourceRegExp: /\/phet\//, contextRegExp: /brand/ });
        var ignorePhetioBrand = new webpack.IgnorePlugin({ resourceRegExp: /\/phet-io\//, contextRegExp: /brand/ });
        var ignoreAdaptedFromPhetBrand = new webpack.IgnorePlugin({
            resourceRegExp: /\/adapted-from-phet\//,
            contextRegExp: /brand/
        });
        // Allow builds for developers that do not have the phet-io repo checked out. IgnorePlugin will skip any require
        // that matches the following regex.
        var ignorePhetioDirectories = new webpack.IgnorePlugin({
            resourceRegExp: /\/phet-io\// // ignore anything in a phet-io named directory
        });
        var compiler = webpack({
            module: {
                rules: __spreadArray([
                    // Apply affirm transformation before any other processing
                    {
                        test: /\.js$/,
                        exclude: /affirm\.js$/,
                        // Run this loader at 'pre' priority so the 'affirm' => 'assert && affirm' rewrite sees original source before
                        // other webpack phases. For each matched file Webpack gathers post-enforced loaders first, then normal,
                        // then pre, and executes the list right-to-left—so without 'pre' this loader would run last, when it’s too late.
                        enforce: 'pre',
                        use: [{
                                loader: require.resolve('./affirmTransformLoader.js')
                            }]
                    }
                ], getModuleRules(), true)
            },
            // We uglify as a step after this, with many custom rules. So we do NOT optimize or uglify in this step.
            optimization: {
                minimize: false
            },
            // Simulations or runnables will have a single entry point
            entry: {
                repo: "../chipper/dist/js/".concat(repo, "/js/").concat(repo, "-main.js")
            },
            // We output our builds to the following dir
            output: {
                path: outputDir,
                filename: outputFileName,
                hashFunction: 'xxhash64' // for Node 17+, see https://github.com/webpack/webpack/issues/14532
            },
            // {Array.<Plugin>}
            plugins: __spreadArray(__spreadArray([], (brand === 'phet' ? [ignorePhetioBrand, ignorePhetioDirectories, ignoreAdaptedFromPhetBrand] :
                brand === 'phet-io' ? [ignorePhetBrand, ignoreAdaptedFromPhetBrand] :
                    // adapted-from-phet and all other brands
                    [ignorePhetBrand, ignorePhetioBrand, ignorePhetioDirectories]), true), (options.profileFileSize ? [
                new modify_source_webpack_plugin_1.ModifySourcePlugin({
                    rules: [{
                            test: /.*/,
                            operations: [
                                new modify_source_webpack_plugin_1.ConcatOperation('start', 'console.log(\'START_MODULE\',\'$FILE_PATH\');\n\n'),
                                new modify_source_webpack_plugin_1.ConcatOperation('end', '\n\nconsole.log(\'END_MODULE\',\'$FILE_PATH\');\n\n')
                            ]
                        }]
                })
            ] : []), true)
        });
        compiler.run(function (err, stats) {
            if (err || stats.hasErrors()) {
                console.error('Webpack build errors:', stats.compilation.errors);
                reject(err || stats.compilation.errors[0]);
            }
            else {
                var jsFile = outputPath;
                var js = fs_1.default.readFileSync(jsFile, 'utf-8');
                fs_1.default.unlinkSync(jsFile);
                resolve({
                    js: js,
                    usedModules: getRelativeModules(Array.from(stats.compilation.fileDependencies))
                });
            }
        });
    });
};
webpackBuild.getModuleRules = getModuleRules;
exports.default = webpackBuild;
