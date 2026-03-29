"use strict";
// @ts-nocheck
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transformer = exports.Visitor = void 0;
var AST = require("./ast.js");
/**
 * A read-only visitor.
 *
 * Subclasses can be used to gather information from an AST.
 *
 * To handle specific node types add methods like `visitPattern`.
 * Then, to descend into children call `genericVisit`.
 *
 * Visiting methods must implement the following interface:
 *
 * ```ts
 * interface VisitingMethod {
 *     (this: Visitor, node: AST.BaseNode): void;
 * }
 * ```
 */
var Visitor = /** @class */ (function () {
    function Visitor() {
    }
    Visitor.prototype.visit = function (node) {
        var visit = this["visit".concat(node.type)];
        if (typeof visit === "function") {
            visit.call(this, node);
        }
        else {
            this.genericVisit(node);
        }
    };
    Visitor.prototype.genericVisit = function (node) {
        for (var _i = 0, _a = Object.keys(node); _i < _a.length; _i++) {
            var key = _a[_i];
            var prop = node[key];
            if (prop instanceof AST.BaseNode) {
                this.visit(prop);
            }
            else if (Array.isArray(prop)) {
                for (var _b = 0, prop_1 = prop; _b < prop_1.length; _b++) {
                    var element = prop_1[_b];
                    this.visit(element);
                }
            }
        }
    };
    return Visitor;
}());
exports.Visitor = Visitor;
/**
 * A read-and-write visitor.
 *
 * Subclasses can be used to modify an AST in-place.
 *
 * To handle specific node types add methods like `visitPattern`.
 * Then, to descend into children call `genericVisit`.
 *
 * Visiting methods must implement the following interface:
 *
 * ```ts
 * interface TransformingMethod {
 *     (this: Transformer, node: AST.BaseNode): AST.BaseNode | undefined;
 * }
 * ```
 *
 * The returned node will replace the original one in the AST. Return
 * `undefined` to remove the node instead.
 */
var Transformer = /** @class */ (function (_super) {
    __extends(Transformer, _super);
    function Transformer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Transformer.prototype.visit = function (node) {
        var visit = this["visit".concat(node.type)];
        if (typeof visit === "function") {
            return visit.call(this, node);
        }
        return this.genericVisit(node);
    };
    Transformer.prototype.genericVisit = function (node) {
        for (var _i = 0, _a = Object.keys(node); _i < _a.length; _i++) {
            var key = _a[_i];
            var prop = node[key];
            if (prop instanceof AST.BaseNode) {
                var newVal = this.visit(prop);
                if (newVal === undefined) {
                    delete node[key];
                }
                else {
                    node[key] = newVal;
                }
            }
            else if (Array.isArray(prop)) {
                var newVals = [];
                for (var _b = 0, prop_2 = prop; _b < prop_2.length; _b++) {
                    var element = prop_2[_b];
                    var newVal = this.visit(element);
                    if (newVal !== undefined) {
                        newVals.push(newVal);
                    }
                }
                node[key] = newVals;
            }
        }
        return node;
    };
    return Transformer;
}(Visitor));
exports.Transformer = Transformer;
