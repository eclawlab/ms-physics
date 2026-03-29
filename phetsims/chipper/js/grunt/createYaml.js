"use strict";
// Copyright 2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Create the {sim}_en.yaml string file from the {sim}_en.json string file.
 *
 * This script now supports extracting metadata from JSON to YAML:
 * - deprecated: true → __deprecated: true
 * - _comment: "text" → __comment: "text"
 * - simMetadata: {...} → __simMetadata: {...}
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var fs = require("fs");
var yaml = require("js-yaml");
var getRepo_js_1 = require("../../../perennial-alias/js/grunt/tasks/util/getRepo.js");
var repo = (0, getRepo_js_1.default)();
var jsonFile = "../".concat(repo, "/").concat(repo, "-strings_en.json");
var yamlFile = "../".concat(repo, "/").concat(repo, "-strings_en.yaml");
var json = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
var getValues = function (json) {
    if (typeof json === 'object' && json !== null) {
        // If this object has a 'value' property, it's a string entry
        if (json.hasOwnProperty('value')) {
            // First, process the base key with its value
            var baseResult = json.value;
            // Then check for metadata and add sibling keys
            var metadata = {};
            if (json.deprecated === true) {
                metadata.__deprecated = true;
            }
            if (json._comment) {
                metadata.__comment = json._comment;
            }
            if (json.simMetadata) {
                metadata.__simMetadata = json.simMetadata;
            }
            // If we have metadata, we need to return an object that will be processed later
            if (Object.keys(metadata).length > 0) {
                var result = { __value: baseResult };
                // Add metadata properties individually to avoid spread on non-literal
                for (var key in metadata) {
                    result[key] = metadata[key];
                }
                return result;
            }
            return baseResult;
        }
        // Otherwise, recursively process all properties
        var newJson = {};
        for (var key in json) {
            var processed = getValues(json[key]);
            // If the processed value has metadata, we need to split it into separate keys
            if (typeof processed === 'object' && processed !== null && processed.__value !== undefined) {
                newJson[key] = processed.__value;
                // Add metadata as sibling keys
                for (var metaKey in processed) {
                    if (metaKey !== '__value') {
                        newJson[key + metaKey] = processed[metaKey];
                    }
                }
            }
            else {
                newJson[key] = processed;
            }
        }
        return newJson;
    }
    return json;
};
var yamlData = getValues(json);
fs.writeFileSync(yamlFile, yaml.dump(yamlData));
console.log("Created ".concat(yamlFile, " from ").concat(jsonFile, ". Manually inspect the result. This script now supports deprecated tags, comments, and simMetadata."));
