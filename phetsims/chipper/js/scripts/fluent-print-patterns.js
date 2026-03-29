"use strict";
// Copyright 2025, University of Colorado Boulder
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
 * fluent-print-patterns.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Emit up‑to‑10 sample renderings for every Fluent entry (message **or** term,
 * plus each attribute) in a given FTL file, along with a summary of the
 * parameters (variables / selectors) that influence it.
 *
 * usage:  sage run js/scripts/fluent-print-patterns.ts path/to/file.ftl
 *
 * Highlights
 * ──────────
 * • Correctly renders **terms** (identifiers that start with “‑”) by reading
 *   the compiled data held in  `bundle._terms`.
 * • Prints a `params:` line that lists every variable and its enumerated
 *   choices (or “(any)” if the variable has no fixed choice list).
 * • Guarantees at most 10 examples; constant strings produce exactly one.
 *
 * See https://github.com/phetsims/rosetta/issues/459
 *
 * @author Sam Reid (PhET Interactive Simulations)
 *
 * This software was developed with OpenAI o3.
 */
var fs = require("fs");
var FluentLibrary_js_1 = require("../browser-and-node/FluentLibrary.js");
// ─── CLI handling ────────────────────────────────────────────────────────────
var filePath = process.argv[2];
if (!filePath) {
    console.error('usage: sage run js/scripts/fluent-print-patterns.ts <ftl-file>');
    process.exit(1);
}
var source = fs.readFileSync(filePath, 'utf-8');
// ─── Parse FTL & build entry index (for recursive walks) ─────────────────────
var parser = new FluentLibrary_js_1.FluentParser();
var resourceAst = parser.parse(source);
var entryIndex = new Map(); // "id" | "-id" → Entry
for (var _i = 0, _a = resourceAst.body; _i < _a.length; _i++) {
    var entry = _a[_i];
    if ('id' in entry) {
        // @ts-expect-error
        var id = entry.id.name;
        entryIndex.set(entry.type === 'Term' ? "-".concat(id) : id, entry);
    }
}
function collectChoices(entry, seen, out) {
    if (seen === void 0) { seen = new Set(); }
    if (seen.has(entry)) {
        return out !== null && out !== void 0 ? out : new Map();
    }
    seen.add(entry);
    var choices = out !== null && out !== void 0 ? out : new Map();
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
        switch (expr.type) {
            case 'VariableReference': {
                var v = expr.id.name;
                if (!choices.has(v)) {
                    choices.set(v, new Set());
                }
                break;
            }
            case 'SelectExpression': {
                if (expr.selector.type === 'VariableReference') {
                    var v = expr.selector.id.name;
                    if (!choices.has(v)) {
                        choices.set(v, new Set());
                    }
                    for (var _i = 0, _a = expr.variants; _i < _a.length; _i++) {
                        var variant = _a[_i];
                        var key = variant.key.type === 'NumberLiteral'
                            ? variant.key.value
                            : variant.key.name;
                        choices.get(v).add(String(key));
                        walkPattern(variant.value);
                    }
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
                    collectChoices(refEntry, seen, choices);
                }
                break;
            }
            case 'CallExpression': {
                for (var _b = 0, _c = expr.positional; _b < _c.length; _b++) {
                    var pos = _c[_b];
                    visitExpression(pos);
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
    if ('value' in entry && entry.value) {
        // @ts-expect-error
        walkPattern(entry.value);
    }
    if ('attributes' in entry && entry.attributes) {
        // @ts-expect-error
        for (var _i = 0, _a = entry.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            walkPattern(attr.value);
        }
    }
    return choices;
}
// ─── Build runtime bundle ────────────────────────────────────────────────────
var bundle = new FluentLibrary_js_1.FluentBundle('en-US');
bundle.addResource(new FluentLibrary_js_1.FluentResource(source));
// Helper: obtain the COMPILED pattern (array of elements) that the bundle
// uses internally.  Needed because we cannot pass raw AST `Pattern` objects
// into `formatPattern`.
function getCompiledPattern(id, attrName) {
    var _a, _b;
    if (id.startsWith('-')) {
        // It's a term
        var termData = bundle._terms.get(id.slice(1));
        if (!termData) {
            return undefined;
        }
        return attrName ? (_a = termData.attributes) === null || _a === void 0 ? void 0 : _a[attrName] : termData.value;
    }
    else {
        // It's a message
        var msg = bundle.getMessage(id);
        if (!msg) {
            return undefined;
        }
        return attrName ? (_b = msg.attributes) === null || _b === void 0 ? void 0 : _b[attrName] : msg.value;
    }
}
// ─── Helper: print parameter summary line ────────────────────────────────────
function printParams(paramArrays) {
    if (paramArrays.size === 0) {
        console.log('  params: (none)');
        return;
    }
    var parts = __spreadArray([], paramArrays.entries(), true).sort(function (_a, _b) {
        var a = _a[0];
        var b = _b[0];
        return a.localeCompare(b);
    })
        .map(function (_a) {
        var v = _a[0], arr = _a[1];
        return "".concat(v, " = ").concat(arr.length ? arr.join(' | ') : '(any)');
    });
    console.log("  params: ".concat(parts.join(', ')));
}
var _loop_1 = function (id, entry) {
    // 1. Collect parameter choices (recursive)
    var choices = collectChoices(entry);
    var paramArrays = new Map();
    var longest = 1;
    for (var _d = 0, choices_1 = choices; _d < choices_1.length; _d++) {
        var _e = choices_1[_d], v = _e[0], set = _e[1];
        var arr = __spreadArray([], set, true);
        paramArrays.set(v, arr);
        if (arr.length > longest) {
            longest = arr.length;
        }
    }
    var examples = Math.min(10, longest);
    // 2. Helper to build FluentArgs for sample i
    var buildArgs = function (i) {
        var args = {};
        for (var _i = 0, paramArrays_1 = paramArrays; _i < paramArrays_1.length; _i++) {
            var _a = paramArrays_1[_i], v = _a[0], arr = _a[1];
            args[v] = arr.length ? arr[i % arr.length] : "".concat(v).concat(i);
        }
        return args;
    };
    // 3. Render main value (message or term)
    var mainPattern = getCompiledPattern(id);
    if (mainPattern) {
        console.log("".concat(id, ":"));
        printParams(paramArrays);
        for (var i = 0; i < examples; i++) {
            var rendered = bundle.formatPattern(mainPattern, buildArgs(i));
            console.log("  - ".concat(rendered));
        }
        console.log('');
    }
    // 4. Render each attribute (id.attrName)
    if ('attributes' in entry && entry.attributes) {
        // @ts-expect-error
        for (var _f = 0, _g = entry.attributes; _f < _g.length; _f++) {
            var attr = _g[_f];
            var attrKey = "".concat(id, ".").concat(attr.id.name);
            var attrPattern = getCompiledPattern(id, attr.id.name);
            if (!attrPattern) {
                continue;
            }
            console.log("".concat(attrKey, ":"));
            printParams(paramArrays);
            for (var i = 0; i < examples; i++) {
                var rendered = bundle.formatPattern(attrPattern, buildArgs(i));
                console.log("  - ".concat(rendered));
            }
            console.log('');
        }
    }
};
// ─── Main loop: iterate over every entry and emit output ─────────────────────
for (var _b = 0, entryIndex_1 = entryIndex; _b < entryIndex_1.length; _b++) {
    var _c = entryIndex_1[_b], id = _c[0], entry = _c[1];
    _loop_1(id, entry);
}
