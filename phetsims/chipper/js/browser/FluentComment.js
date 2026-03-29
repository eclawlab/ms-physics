"use strict";
// Copyright 2025-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
var FluentComment = /** @class */ (function () {
    function FluentComment(data) {
        this.comment = data.comment;
        this.associatedKey = data.associatedKey;
    }
    /**
     * Returns the comment text for display purposes.
     */
    FluentComment.prototype.toString = function () {
        return this.comment;
    };
    return FluentComment;
}());
exports.default = FluentComment;
