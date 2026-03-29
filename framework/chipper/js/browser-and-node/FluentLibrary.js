"use strict";
// Copyright 2025-2026, University of Colorado Boulder
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
exports.FluentSyntaxResource = exports.FluentSyntaxPattern = exports.Visitor = exports.FluentParser = exports.FluentResource = exports.FluentBundle = exports.FluentVisitor = void 0;
var bundle_js_1 = require("../../../sherpa/lib/fluent/fluent-bundle-0.18.0/src/bundle.js");
Object.defineProperty(exports, "FluentBundle", { enumerable: true, get: function () { return bundle_js_1.FluentBundle; } });
var resource_js_1 = require("../../../sherpa/lib/fluent/fluent-bundle-0.18.0/src/resource.js");
Object.defineProperty(exports, "FluentResource", { enumerable: true, get: function () { return resource_js_1.FluentResource; } });
var ast_js_1 = require("../../../sherpa/lib/fluent/fluent-syntax-0.19.0/src/ast.js");
Object.defineProperty(exports, "FluentSyntaxPattern", { enumerable: true, get: function () { return ast_js_1.Pattern; } });
Object.defineProperty(exports, "FluentSyntaxResource", { enumerable: true, get: function () { return ast_js_1.Resource; } });
var parser_js_1 = require("../../../sherpa/lib/fluent/fluent-syntax-0.19.0/src/parser.js");
Object.defineProperty(exports, "FluentParser", { enumerable: true, get: function () { return parser_js_1.FluentParser; } });
var visitor_js_1 = require("../../../sherpa/lib/fluent/fluent-syntax-0.19.0/src/visitor.js");
Object.defineProperty(exports, "Visitor", { enumerable: true, get: function () { return visitor_js_1.Visitor; } });
var FluentLibrary = /** @class */ (function () {
    function FluentLibrary() {
    }
    /**
     * Indent all lines after the first so multiline strings are valid FTL.
     */
    FluentLibrary.formatMultilineForFtl = function (value) {
        return value.replace(/\n/g, '\n ');
    };
    /**
     * Gets all message keys (excluding terms) from a Fluent file string. This exists in
     * FluentLibrary (instead of FluentUtils) because it needs to be used outside of simulation
     * code.
     */
    FluentLibrary.getFluentMessageKeys = function (fluentFileString) {
        var parser = new parser_js_1.FluentParser();
        var resource = parser.parse(fluentFileString);
        var keys = resource.body
            .filter(function (entry) { return entry.type === 'Message'; })
            .map(function (entry) { return entry.id.name; });
        return keys;
    };
    /**
     * Verify syntax in the fluent file. Right now it checks for:
     *   - Message keys should use camelCase instead of dashes.
     *   - All terms used in the file should be defined.
     *   - All selectors must have a default case.
     *   - Terms are not allowed to use placeables because terms used in placeables cannot take forwarded variables.
     *      - This is PhET specific and was added because it an easy programming mistake to assume that terms with
     *      placeables can be used like messages. This can be relaxed if needed in the future.
     */
    FluentLibrary.verifyFluentFile = function (fluentFileString) {
        var parser = new parser_js_1.FluentParser();
        var resource = parser.parse(fluentFileString);
        // Collect all message keys. None of them should contain dashes.
        var messages = FluentLibrary.getFluentMessageKeys(fluentFileString);
        var messagesWithDashes = messages.filter(function (key) { return key.includes('-'); });
        if (messagesWithDashes.length > 0) {
            var messagesWithDashesFormatted = messagesWithDashes.join(', ');
            throw new Error("Message keys should not contain dashes: [ ".concat(messagesWithDashesFormatted, " ]"));
        }
        // Collect all defined term keys from the AST.
        var termKeys = resource.body
            .filter(function (entry) { return entry.type === 'Term'; })
            .map(function (entry) { return entry.id.name; });
        var collector = new FluentVisitor();
        collector.visit(resource);
        // Identify used terms that are not defined
        var undefinedTerms = Array.from(collector.usedTermNames).filter(function (term) { return !termKeys.includes(term); });
        if (undefinedTerms.length > 0) {
            var undefinedTermsFormatted = undefinedTerms.join(', ');
            throw new Error("These terms are not defined: [ ".concat(undefinedTermsFormatted, " ]"));
        }
        // Identify used messages that are not defined. A message can reference other messages or terms.
        var allDefinedKeys = __spreadArray(__spreadArray([], messages, true), termKeys, true);
        var undefinedMessages = Array.from(collector.usedMessageNames).filter(function (messageKey) { return !allDefinedKeys.includes(messageKey); });
        if (undefinedMessages.length > 0) {
            var undefinedMessagesFormatted = undefinedMessages.join(', ');
            throw new Error("These messages are not defined: [ ".concat(undefinedMessagesFormatted, " ]"));
        }
        // In the PhET project, terms with placeables are prohibited since they can't accept forwarded variables.
        // Fluent allows this for translation flexibility (see: https://projectfluent.org/fluent/guide/terms.html),
        // but it can be misleading, causing developers to treat terms like messages. We enforce this check to prevent errors.
        Array.from(collector.declaredTerms).forEach(function (term) {
            if (term && term.value &&
                term.value.elements &&
                term.value.elements.some(function (element) { return element.type === 'Placeable'; })) {
                throw new Error("Terms with placeables are not allowed: -".concat(term.id.name, ". Use a Message instead."));
            }
        });
        // Other problems found by the collector.
        collector.foundJunk.forEach(function (junk) {
            var messages = junk.annotations.map(function (annotation) { return annotation.message; }).join('\n');
            var errorReport = "Junk found in fluent file:\n      \n".concat(messages, "\n").concat(junk.content, "\n");
            throw new Error(errorReport);
        });
    };
    return FluentLibrary;
}());
/**
 * A visitor that uses Fluent AST traversal and collects information about terms, messages, and junk.
 */
var FluentVisitor = /** @class */ (function (_super) {
    __extends(FluentVisitor, _super);
    function FluentVisitor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.usedTermNames = new Set();
        _this.usedMessageNames = new Set();
        _this.usedTerms = new Set();
        _this.foundJunk = new Set();
        _this.declaredTerms = new Set();
        return _this;
    }
    FluentVisitor.prototype.visitTerm = function (node) {
        this.declaredTerms.add(node);
        this.genericVisit(node);
    };
    FluentVisitor.prototype.visitMessageReference = function (node) {
        this.usedMessageNames.add(node.id.name);
        this.genericVisit(node);
    };
    // IntentionalAny because the node type could not be found in Fluent source.
    FluentVisitor.prototype.visitTermReference = function (node) {
        // Add the term name to the set of used terms
        this.usedTermNames.add(node.id.name);
        this.usedTerms.add(node);
        // Continue traversing the AST
        this.genericVisit(node);
    };
    // Nodes with syntax errors are called "junk" in Fluent and can be visited with this method.
    FluentVisitor.prototype.visitJunk = function (node) {
        this.foundJunk.add(node);
        this.genericVisit(node);
    };
    return FluentVisitor;
}(visitor_js_1.Visitor));
exports.FluentVisitor = FluentVisitor;
exports.default = FluentLibrary;
