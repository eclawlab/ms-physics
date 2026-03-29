"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFluentInternalReferences = getFluentInternalReferences;
var FluentLibrary_js_1 = require("../../browser-and-node/FluentLibrary.js");
/**
 * Recursively collect all internal message/term references used by `key`.
 */
function getFluentInternalReferences(fluentFileFTL, key) {
    // ── Build an index of entries for fast look-ups ──────────────────────────────
    var parser = new FluentLibrary_js_1.FluentParser();
    var resourceAst = parser.parse(fluentFileFTL);
    var entryIndex = new Map();
    for (var _i = 0, _a = resourceAst.body; _i < _a.length; _i++) {
        var entry = _a[_i];
        if ('id' in entry) {
            // @ts-expect-error – AST node types are slightly wider than Entry
            var id = entry.id.name;
            entryIndex.set(entry.type === 'Term' ? "-".concat(id) : id, entry);
        }
    }
    var rootEntry = entryIndex.get(key);
    if (!rootEntry) {
        return [];
    }
    // ── Depth-first traversal collecting internal references ─────────────────────
    var collected = new Set();
    var collect = function (entry, seen) {
        var _a;
        if (seen === void 0) { seen = new Set(); }
        if (seen.has(entry)) {
            return;
        }
        seen.add(entry);
        var walkPattern = function (pattern) {
            if (!pattern) {
                return;
            }
            for (var _i = 0, _a = pattern.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                if (element.type === 'Placeable') {
                    visitExpression(element.expression);
                }
            }
        };
        var visitExpression = function (expr) {
            switch (expr.type) {
                case 'MessageReference':
                case 'TermReference': {
                    var refName = expr.id.type === 'Identifier' ? expr.id.name : String(expr.id.value);
                    var refKey = expr.type === 'TermReference' ? "-".concat(refName) : refName;
                    if (refKey !== key) {
                        collected.add(refKey);
                    }
                    var refEntry = entryIndex.get(refKey);
                    if (refEntry) {
                        collect(refEntry, seen);
                    }
                    break;
                }
                // Only recurse through constructs that can contain further references
                case 'SelectExpression': {
                    visitExpression(expr.selector);
                    for (var _i = 0, _a = expr.variants; _i < _a.length; _i++) {
                        var variant = _a[_i];
                        walkPattern(variant.value);
                    }
                    break;
                }
                case 'CallExpression': {
                    for (var _b = 0, _c = expr.positional; _b < _c.length; _b++) {
                        var positional = _c[_b];
                        visitExpression(positional);
                    }
                    for (var _d = 0, _e = expr.named; _d < _e.length; _d++) {
                        var named = _e[_d];
                        visitExpression(named.value);
                    }
                    break;
                }
                case 'AttributeExpression':
                case 'VariantExpression':
                    visitExpression(expr.id);
                    break;
                default:
                    break;
            }
        };
        // @ts-expect-error – Entry may include value/attributes depending on kind
        if (entry.value) {
            walkPattern(entry.value);
        }
        // @ts-expect-error – Attributes are optional
        if ((_a = entry.attributes) === null || _a === void 0 ? void 0 : _a.length) {
            // @ts-expect-error
            for (var _i = 0, _b = entry.attributes; _i < _b.length; _i++) {
                var attr = _b[_i];
                walkPattern(attr.value);
            }
        }
    };
    collect(rootEntry);
    return Array.from(collected).sort();
}
