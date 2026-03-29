"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.NUMBER_LITERAL = void 0;
exports.parseFluentToMap = parseFluentToMap;
exports.getFluentParamsFromIndex = getFluentParamsFromIndex;
/**
 * Returns every variable / selector that can influence the pattern identified
 * by `key` within the given Fluent file contents.
 *
 * - fluentFileFTL : raw FTL file contents
 * - key           : message id ("id") or term id ("-id")
 * ← ParamInfo[]   : information about each parameter including name and variant options
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var affirm_js_1 = require("../../../../perennial-alias/js/browser-and-node/affirm.js");
var FluentLibrary_js_1 = require("../../browser-and-node/FluentLibrary.js");
var NUMERIC_KEYWORDS = ['zero', 'one', 'two', 'few', 'many', 'other'];
exports.NUMBER_LITERAL = 'number';
/**
 * Returns parameters and their variant options (if applicable) for a Fluent message.
 * Also detects if the message has any references to other messages.
 */
function parseFluentToMap(fluentFileFTL) {
    var parser = new FluentLibrary_js_1.FluentParser();
    var resourceAst = parser.parse(fluentFileFTL);
    var entryIndex = new Map(); // "id" | "-id" → Entry
    for (var _i = 0, _a = resourceAst.body; _i < _a.length; _i++) {
        var entry = _a[_i];
        if ('id' in entry) {
            // @ts-expect-error – AST node types are slightly wider than Entry
            var id = entry.id.name;
            entryIndex.set(entry.type === 'Term' ? "-".concat(id) : id, entry);
        }
    }
    return entryIndex;
}
/**
 * Get fluent parameters from a pre-parsed entry index (optimized version).
 */
function getFluentParamsFromIndex(entryIndex, key) {
    var rootEntry = entryIndex.get(key);
    if (!rootEntry) {
        return [];
    }
    // Map to store parameter info (name -> ParamInfo)
    var paramsMap = new Map();
    // ─── Recursive parameter extraction ─────────────────────────────────────
    var collect = function (entry, seen) {
        var _a;
        if (seen === void 0) { seen = new Set(); }
        if (seen.has(entry)) {
            return;
        }
        seen.add(entry);
        var walkPattern = function (pat) {
            if (!pat) {
                return;
            }
            for (var _i = 0, _a = pat.elements; _i < _a.length; _i++) {
                var elem = _a[_i];
                if (elem.type === 'Placeable') {
                    visitExpression(elem.expression);
                }
            }
        };
        var visitExpression = function (expr) {
            // eslint-disable-next-line default-case
            switch (expr.type) {
                case 'VariableReference': {
                    var paramName = expr.id.name;
                    if (!paramsMap.has(paramName)) {
                        paramsMap.set(paramName, { name: paramName });
                    }
                    break;
                }
                case 'SelectExpression': {
                    if (expr.selector.type === 'VariableReference') {
                        var paramName = expr.selector.id.name;
                        // Extract variant keys from the SelectExpression
                        var variants = expr.variants.map(function (variant) {
                            if (variant.key.type && variant.key.type === 'NumberLiteral') {
                                var parsed = Number(variant.key.value);
                                (0, affirm_js_1.default)(Number.isFinite(parsed), "Expected a finite number for variant key, got: ".concat(variant.key.value));
                                return parsed;
                            }
                            else {
                                // Treat zero, one, two, few, many, and other as numeric values, as type 'number'
                                // and all other keys as strings.
                                return NUMERIC_KEYWORDS.includes(variant.key.name) ? { type: exports.NUMBER_LITERAL, value: variant.key.name } : variant.key.name;
                            }
                        });
                        // Store param with its variants
                        if (paramsMap.has(paramName)) {
                            // If already exists, add/merge variants
                            var existing = paramsMap.get(paramName);
                            if (!existing.variants) {
                                existing.variants = variants;
                            }
                            else {
                                // Merge with existing variants
                                for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
                                    var variant = variants_1[_i];
                                    if (!existing.variants.includes(variant)) {
                                        existing.variants.push(variant);
                                    }
                                }
                            }
                        }
                        else {
                            paramsMap.set(paramName, { name: paramName, variants: variants });
                        }
                    }
                    // Process the selector and all variants
                    for (var _a = 0, _b = expr.variants; _a < _b.length; _a++) {
                        var variant = _b[_a];
                        walkPattern(variant.value);
                    }
                    visitExpression(expr.selector);
                    break;
                }
                case 'MessageReference':
                case 'TermReference': {
                    var refName = expr.id.type === 'Identifier' ? expr.id.name : String(expr.id.value);
                    var refKey = expr.type === 'TermReference' ? "-".concat(refName) : refName;
                    var refEntry = entryIndex.get(refKey);
                    if (refEntry) {
                        collect(refEntry, seen);
                    }
                    break;
                }
                case 'CallExpression': {
                    for (var _c = 0, _d = expr.positional; _c < _d.length; _c++) {
                        var pos = _d[_c];
                        visitExpression(pos);
                    }
                    for (var _e = 0, _f = expr.named; _e < _f.length; _e++) {
                        var named = _f[_e];
                        visitExpression(named.value);
                    }
                    break;
                }
                case 'AttributeExpression':
                case 'VariantExpression':
                    visitExpression(expr.id);
                    break;
            }
        };
        // @ts-expect-error – Entry may include value/attributes depending on kind
        if (entry.value) {
            walkPattern(entry.value);
        }
        // @ts-expect-error
        if ((_a = entry.attributes) === null || _a === void 0 ? void 0 : _a.length) {
            // @ts-expect-error
            for (var _i = 0, _b = entry.attributes; _i < _b.length; _i++) {
                var attr = _b[_i];
                walkPattern(attr.value);
            }
        }
    };
    // Run the collection process
    collect(rootEntry);
    // Convert the map to an array of ParamInfo objects, sorted by name
    return Array.from(paramsMap.values()).sort(function (a, b) { return a.name.localeCompare(b.name); });
}
