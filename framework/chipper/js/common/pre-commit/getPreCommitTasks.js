"use strict";
// Copyright 2024-2025, University of Colorado Boulder
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
 * Parse options and build-local defaults to get the list of tasks to be run for pre-commit hooks.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 *
 */
var buildLocal_js_1 = require("../../../../perennial-alias/js/common/buildLocal.js");
var getOption_js_1 = require("../../../../perennial-alias/js/grunt/tasks/util/getOption.js");
var SUPPORTED_TASKS = ['lint', 'report-media', 'type-check', 'unit-test', 'phet-io-api'];
var getPreCommitTasks = function (outputToConsole) {
    // By default, run all tasks
    var OPT_OUT_ALL = '*'; // Key to opt out of all tasks
    var tasksToRun = (0, getOption_js_1.isOptionKeyProvided)(OPT_OUT_ALL) && !(0, getOption_js_1.default)(OPT_OUT_ALL) ? [] : __spreadArray([], SUPPORTED_TASKS, true);
    // check local preferences for overrides for which tasks to turn 'off'
    var hookPreCommit = buildLocal_js_1.default.hookPreCommit;
    if (hookPreCommit && hookPreCommit[OPT_OUT_ALL] === false) {
        outputToConsole && console.log('all tasks opted out from build-local.json');
        tasksToRun.length = 0;
    }
    SUPPORTED_TASKS.forEach(function (task) {
        // process the buildLocal preferences first
        if (hookPreCommit && hookPreCommit[task] === false) {
            outputToConsole && console.log('task opted out from build-local.json:', task);
            tasksToRun = tasksToRun.filter(function (t) { return t !== task; });
        }
        // process the CLI overrides
        if ((0, getOption_js_1.isOptionKeyProvided)(task)) {
            if ((0, getOption_js_1.default)(task)) {
                if (!tasksToRun.includes(task)) {
                    outputToConsole && console.log('task added from CLI:', task);
                    tasksToRun.push(task);
                }
            }
            else {
                outputToConsole && console.log('task removed from CLI:', task);
                tasksToRun = tasksToRun.filter(function (t) { return t !== task; });
            }
        }
    });
    if ((0, getOption_js_1.default)('allTasks')) {
        outputToConsole && console.log('forcing all tasks to run');
        tasksToRun = __spreadArray([], SUPPORTED_TASKS, true);
    }
    return tasksToRun;
};
exports.default = getPreCommitTasks;
