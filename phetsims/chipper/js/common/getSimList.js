"use strict";
// Copyright 2021-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getSimList;
/**
 * Parses command line arguments--sims=sim1,sim2,... or --simList=path/to/filename to get a list of sims.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
function getSimList() {
    var args = process.argv.slice(2);
    // if the arg is just a flag, then the callback will be called with a null parameter
    var processKey = function (key, callback) {
        var prefix = "--".concat(key);
        var values = args.filter(function (arg) { return arg.startsWith(prefix); });
        if (values.length === 1) {
            if (values[0].startsWith("".concat(prefix, "="))) {
                callback(values[0].substring(prefix.length + 1));
            }
            else {
                callback(null);
            }
        }
        else if (values.length > 1) {
            console.log("Too many --".concat(prefix, "... specified"));
            process.exit(1);
        }
    };
    var repos = [];
    processKey('simList', function (value) {
        var contents = fs_1.default.readFileSync(value, 'utf8').trim();
        repos = contents.split('\n').map(function (sim) { return sim.trim(); });
    });
    processKey('stable', function () {
        var contents = fs_1.default.readFileSync('../perennial-alias/data/phet-io-api-stable', 'utf8').trim();
        repos = contents.split('\n').map(function (sim) { return sim.trim(); });
    });
    processKey('sims', function (value) {
        repos = value.split(',');
    });
    return repos;
}
