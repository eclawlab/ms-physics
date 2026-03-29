"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHoistedSelects = void 0;
/**
 * Converts nested select_* containers into Fluent select expressions, leaving other values untouched.
 *
 * Why it exists:
 * - YAML authors need a compact syntax for selects (e.g. `select_shownSides`) without littering files with fluent UI
 *   logic selector `|- { $var -> ... }` blocks.
 * - Fluent best practices warn against using variants for UI control flow (“Prefer separate messages over variants for
 *   UI logic”). Variants should only exist when grammar demands them, the default arm must make sense for every value,
 *   and other locales are free to collapse variants.
 * - Continue to use fluent selector logic for linguistic logic, such as pluralization.
 * - By expanding `select_*` nodes *in-memory*, we keep authoring ergonomic while guaranteeing that downstream tooling
 *   (JSON generation, Fluent type extraction, runtime value interpolation.) only sees canonical Fluent strings.
 *
 * Typical usage:
 *
 * ```ts
 * const yamlObj = safeLoadYaml( fileContents );
 * const unhoisted = convertHoistedSelects( yamlObj );
 * const nested = nestJSONStringValues( unhoisted );
 * ```
 *
 * Example input YAML
 *
 * ```yaml
 * currentDetails:
 *   select_shownSides:
 *     none: Counting area hidden.
 *     left: Right area hidden, total { $total }.
 *     right: Left area hidden, total { $total }.
 * ```
 *
 * Example Fluent output later in the pipeline
 *
 * ```fluent
 * currentDetails = { $shownSides ->
 *   [none] Counting area hidden.
 *   [left] Right area hidden, total { $total }.
 *  *[right] Left area hidden, total { $total }.
 * }
 * ```
 *
 * If any arm serves a different UI purpose (e.g. switching icons or behaviors), split it into separate messages so that
 * all locales must translate each case explicitly.
 *
 * NOTE that specifying one item as the default with * is arbitrary (required by Fluent), and our TypeScript system will
 * guarantee that one of the selector values is always used.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var assert_1 = require("assert");
var js_yaml_1 = require("js-yaml");
var SELECT_PREFIX = 'select_';
var SELECT_INDENT = '  ';
var convertHoistedSelects = function (node) {
    return convertHoistedSelectsImpl(node, new Set());
};
exports.convertHoistedSelects = convertHoistedSelects;
var convertHoistedSelectsImpl = function (node, activeVariables) {
    if (Array.isArray(node)) {
        return node.map(function (child) { return convertHoistedSelectsImpl(child, activeVariables); });
    }
    else if (isPlainObject(node)) {
        var keys = Object.keys(node);
        var selectChildKey = keys.find(function (key) { return key.startsWith(SELECT_PREFIX); });
        if (selectChildKey) {
            (0, assert_1.default)(keys.length === 1, "select_* helper '".concat(selectChildKey, "' must be the only child on its parent object. Found keys: ").concat(keys.join(', ')));
        }
        if (keys.length === 1 && keys[0].startsWith(SELECT_PREFIX)) {
            var selectKey = keys[0];
            var arms = node[selectKey];
            if (isPlainObject(arms) && Object.keys(arms).length > 0) {
                var variable = selectKey.slice(SELECT_PREFIX.length);
                (0, assert_1.default)(!activeVariables.has(variable), "Nested select_* helper collision detected for '".concat(variable, "'. Choose unique variable names along a branch."));
                return renderSelectExpression(variable, arms, activeVariables);
            }
        }
        var result = {};
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            result[key] = convertHoistedSelectsImpl(node[key], activeVariables);
        }
        return result;
    }
    return node;
};
var isPlainObject = function (value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};
var renderSelectExpression = function (variable, arms, activeVariables) {
    var entries = Object.entries(arms);
    var lines = ["{ $".concat(variable, " ->")];
    var nextActiveVariables = new Set(activeVariables);
    nextActiveVariables.add(variable);
    entries.forEach(function (_a, index) {
        var armKey = _a[0], armValue = _a[1];
        var processedValue = convertHoistedSelectsImpl(armValue, nextActiveVariables);
        var renderedValue = renderArmValue(processedValue);
        var isDefault = index === entries.length - 1;
        lines.push(formatArmLine(armKey, renderedValue, isDefault));
    });
    lines.push('}');
    return lines.join('\n');
};
var renderArmValue = function (value) {
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (value === null) {
        return 'null';
    }
    if (Array.isArray(value)) {
        return js_yaml_1.default.dump(value, { lineWidth: -1, noRefs: true }).trimEnd();
    }
    if (isPlainObject(value)) {
        return js_yaml_1.default.dump(value, { lineWidth: -1, noRefs: true }).trimEnd();
    }
    return String(value);
};
var formatArmLine = function (armKey, value, isDefault) {
    var indicator = isDefault ? '*' : '';
    var armHeader = "".concat(SELECT_INDENT).concat(indicator, "[").concat(armKey, "] ");
    var valueLines = value.split('\n');
    if (valueLines.length === 0) {
        return armHeader.trimEnd();
    }
    var formattedLines = ["".concat(armHeader).concat(valueLines[0])];
    if (valueLines.length > 1) {
        var continuationIndent = ' '.repeat(armHeader.length);
        for (var i = 1; i < valueLines.length; i++) {
            formattedLines.push("".concat(continuationIndent).concat(valueLines[i]));
        }
    }
    return formattedLines.join('\n');
};
exports.default = exports.convertHoistedSelects;
