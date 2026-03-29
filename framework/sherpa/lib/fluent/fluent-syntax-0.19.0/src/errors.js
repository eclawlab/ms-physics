"use strict";
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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
exports.ParseError = void 0;
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError(code) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this.code = code;
        _this.args = args;
        _this.message = getErrorMessage(code, args);
        return _this;
    }
    return ParseError;
}(Error));
exports.ParseError = ParseError;
/* eslint-disable complexity */
function getErrorMessage(code, args) {
    switch (code) {
        case "E0001":
            return "Generic error";
        case "E0002":
            return "Expected an entry start";
        case "E0003": {
            var token = args[0];
            return "Expected token: \"".concat(token, "\"");
        }
        case "E0004": {
            var range = args[0];
            return "Expected a character from range: \"".concat(range, "\"");
        }
        case "E0005": {
            var id = args[0];
            return "Expected message \"".concat(id, "\" to have a value or attributes");
        }
        case "E0006": {
            var id = args[0];
            return "Expected term \"-".concat(id, "\" to have a value");
        }
        case "E0007":
            return "Keyword cannot end with a whitespace";
        case "E0008":
            return "The callee has to be an upper-case identifier or a term";
        case "E0009":
            return "The argument name has to be a simple identifier";
        case "E0010":
            return "Expected one of the variants to be marked as default (*)";
        case "E0011":
            return 'Expected at least one variant after "->"';
        case "E0012":
            return "Expected value";
        case "E0013":
            return "Expected variant key";
        case "E0014":
            return "Expected literal";
        case "E0015":
            return "Only one variant can be marked as default (*)";
        case "E0016":
            return "Message references cannot be used as selectors";
        case "E0017":
            return "Terms cannot be used as selectors";
        case "E0018":
            return "Attributes of messages cannot be used as selectors";
        case "E0019":
            return "Attributes of terms cannot be used as placeables";
        case "E0020":
            return "Unterminated string expression";
        case "E0021":
            return "Positional arguments must not follow named arguments";
        case "E0022":
            return "Named arguments must be unique";
        case "E0024":
            return "Cannot access variants of a message.";
        case "E0025": {
            var char = args[0];
            return "Unknown escape sequence: \\".concat(char, ".");
        }
        case "E0026": {
            var sequence = args[0];
            return "Invalid Unicode escape sequence: ".concat(sequence, ".");
        }
        case "E0027":
            return "Unbalanced closing brace in TextElement.";
        case "E0028":
            return "Expected an inline expression";
        case "E0029":
            return "Expected simple expression as selector";
        default:
            return code;
    }
}
