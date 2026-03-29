"use strict";
// Copyright 2015-2026, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line phet/bad-typescript-text
// @ts-nocheck
/**
 * Given structured documentation output from extractDocumentation (and associated other metadata), this outputs both
 * HTML meant for a collapsible documentation index and HTML content for all of the documentation.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var typeURLs = {
// is replaced by every documentationToHTML() call
};
// borrowed from phet-core.
function escapeHTML(str) {
    // see https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
    // HTML Entity Encoding
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}
/**
 * Parses the HTML looking for examples (matching #begin and #end) that have embedded #on/#off to control where code
 * examples are displayed. Breaks up everything into a concise paragraph structure (blank lines trigger the end of a
 * paragraph).
 */
function descriptionHTML(string) {
    var result = '';
    var lines = string.split('\n');
    var inParagraph = false;
    function insideParagraph() {
        if (!inParagraph) {
            result += '<p>\n';
            inParagraph = true;
        }
    }
    function outsideParagraph() {
        if (inParagraph) {
            result += '</p>\n';
            inParagraph = false;
        }
    }
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        if (line.startsWith('#begin')) {
            var initialLine = lines[i];
            var runLines = [];
            var displayLines = [];
            var isDisplayed = false;
            for (i++; i < lines.length; i++) {
                if (lines[i].startsWith('#end')) {
                    break;
                }
                else if (lines[i].startsWith('#on')) {
                    isDisplayed = true;
                }
                else if (lines[i].startsWith('#off')) {
                    isDisplayed = false;
                }
                else {
                    runLines.push(lines[i]);
                    if (isDisplayed) {
                        displayLines.push(lines[i]);
                    }
                }
            }
            var runString = runLines.join('\n');
            var displayString = displayLines.join('\n');
            var canvasExampleMatch = initialLine.match(/^#begin canvasExample ([^ ]+) ([^x]+)x([^x]+)$/);
            if (canvasExampleMatch) {
                outsideParagraph();
                var name_1 = canvasExampleMatch[1];
                var width = canvasExampleMatch[2];
                var height = canvasExampleMatch[3];
                var exampleName = "example-".concat(name_1);
                result += "<canvas id=\"".concat(exampleName, "\" class=\"exampleScene\"></canvas>");
                result += '<script>(function(){';
                result += "var canvas = document.getElementById( \"".concat(exampleName, "\" );");
                result += "canvas.width = ".concat(width, ";");
                result += "canvas.height = ".concat(height, ";");
                result += 'var context = canvas.getContext( "2d" );';
                result += runString;
                result += '})();</' + 'script>'; // eslint-disable-line no-useless-concat
                result += '<pre class="brush: js">\n';
                result += displayString;
                result += '</pre>';
            }
        }
        else {
            if (line.length === 0) {
                outsideParagraph();
            }
            else {
                insideParagraph();
                result += "".concat(line, "\n");
            }
        }
    }
    outsideParagraph();
    return result;
}
function typeString(type) {
    var url = typeURLs[type];
    if (url) {
        return " <a href=\"".concat(url, "\" class=\"type\">").concat(escapeHTML(type), "</a>");
    }
    else {
        return " <span class=\"type\">".concat(escapeHTML(type), "</span>");
    }
}
function inlineParameterList(object) {
    var result = '';
    if (object.parameters) {
        result += "( ".concat(object.parameters.map(function (parameter) {
            var name = parameter.name;
            if (parameter.optional) {
                name = "<span class=\"optional\">".concat(name, "</span>");
            }
            return "<span class=\"args\">".concat(typeString(parameter.type), " ").concat(name, "</span>");
        }).join(', '), " )");
    }
    else if (object.type === 'function') {
        result += '()';
    }
    return result;
}
function parameterDetailsList(object) {
    var result = '';
    var parametersWithDescriptions = object.parameters ? object.parameters.filter(function (parameter) {
        return !!parameter.description;
    }) : [];
    if (parametersWithDescriptions.length) {
        result += '<table class="params">\n';
        parametersWithDescriptions.forEach(function (parameter) {
            var name = parameter.name;
            var description = parameter.description || '';
            if (parameter.optional) {
                name = "<span class=\"optional\">".concat(name, "</span>");
            }
            result += "<tr class=\"param\"><td>".concat(typeString(parameter.type), "</td><td>").concat(name, "</td><td> - </td><td>").concat(description, "</td></tr>\n");
        });
        result += '</table>\n';
    }
    return result;
}
function returnOrConstant(object) {
    var result = '';
    if (object.returns || object.constant) {
        var type = (object.returns || object.constant).type;
        if (object.returns) {
            result += ' :';
        }
        result += "<span class=\"return\">".concat(typeString(type), "</span>");
    }
    return result;
}
function nameLookup(array, name) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].name === name) {
            return array[i];
        }
    }
    return null;
}
/**
 * For a given doc (extractDocumentation output) and a base name for the file (e.g. 'Vector2' for Vector2.js),
 * collect top-level documentation (and public documentation for every type referenced in typeNmaes) and return an
 * object: { indexHTML: {string}, contentHTML: {string} } which includes the HTML for the index (list of types and
 * methods/fields/etc.) and content (the documentation itself).
 *
 * @param doc
 * @param baseName
 * @param typeNames - Names of types from this file to include in the documentation.
 * @param localTypeIds - Keys should be type names included in the same documentation output, and the values
 *                                should be a prefix applied for hash URLs of the given type. This helps prefix
 *                                things, so Vector2.angle will have a URL #vector2-angle.
 * @param externalTypeURLs - Keys should be type names NOT included in the same documentation output, and
 *                                    values should be URLs for those types.
 * @returns - With indexHTML and contentHTML fields, both strings of HTML.
 */
function documentationToHTML(doc, baseName, typeNames, localTypeIds, externalTypeURLs) {
    var indexHTML = '';
    var contentHTML = '';
    // Initialize typeURLs for the output
    typeURLs = {};
    Object.keys(externalTypeURLs).forEach(function (typeId) {
        typeURLs[typeId] = externalTypeURLs[typeId];
    });
    Object.keys(localTypeIds).forEach(function (typeId) {
        typeURLs[typeId] = "#".concat(localTypeIds[typeId]);
    });
    var baseURL = typeURLs[baseName];
    indexHTML += "<a class=\"navlink\" href=\"".concat(baseURL, "\" data-toggle=\"collapse\" data-target=\"#collapse-").concat(baseName, "\" onclick=\"$( '.collapse.in' ).collapse( 'toggle' ); return true;\">").concat(baseName, "</a><br>\n");
    indexHTML += "<div id=\"collapse-".concat(baseName, "\" class=\"collapse\">\n");
    contentHTML += "<h3 id=\"".concat(baseURL.slice(1), "\" class=\"section\">").concat(baseName, "</h3>\n");
    contentHTML += descriptionHTML(doc.topLevelComment.description);
    typeNames.forEach(function (typeName) {
        var baseObject = doc[typeName];
        var baseURLPrefix = "".concat(localTypeIds[typeName], "-");
        // constructor
        if (baseObject.type === 'type') {
            // Add a target for #-links if we aren't the baseName.
            if (typeName !== baseName) {
                contentHTML += "<div id=\"".concat(baseURLPrefix.slice(0, baseURLPrefix.length - 1), "\"></div>");
            }
            var constructorLine = typeName + inlineParameterList(baseObject.comment);
            if (baseObject.supertype) {
                constructorLine += " <span class=\"inherit\">extends ".concat(typeString(baseObject.supertype), "</span>");
            }
            contentHTML += "<h4 id=\"".concat(baseURLPrefix, "constructor\" class=\"section\">").concat(constructorLine, "</h4>");
            contentHTML += descriptionHTML(baseObject.comment.description);
            contentHTML += parameterDetailsList(baseObject.comment);
        }
        var staticProperties = baseObject.staticProperties || baseObject.properties || [];
        var staticNames = staticProperties.map(function (prop) { return prop.name; }).sort();
        staticNames.forEach(function (name) {
            var object = nameLookup(staticProperties, name);
            indexHTML += "<a class=\"sublink\" href=\"#".concat(baseURLPrefix).concat(object.name, "\">").concat(object.name, "</a><br>");
            var typeLine = "<span class=\"entryName\">".concat(typeName, ".").concat(object.name, "</span>");
            typeLine += inlineParameterList(object);
            typeLine += returnOrConstant(object);
            contentHTML += "<h5 id=\"".concat(baseURLPrefix).concat(object.name, "\" class=\"section\">").concat(typeLine, "</h5>");
            if (object.description) {
                contentHTML += descriptionHTML(object.description);
            }
            contentHTML += parameterDetailsList(object);
        });
        if (baseObject.type === 'type') {
            var constructorNames = baseObject.constructorProperties.map(function (prop) { return prop.name; }).sort();
            constructorNames.forEach(function (name) {
                var object = nameLookup(baseObject.constructorProperties, name);
                indexHTML += "<a class=\"sublink\" href=\"#".concat(baseURLPrefix).concat(object.name, "\">").concat(object.name, "</a><br>");
                var typeLine = "<span class=\"entryName\">".concat(object.name, "</span>");
                typeLine += " <span class=\"property\">".concat(typeString(object.type), "</span>");
                contentHTML += "<h5 id=\"".concat(baseURLPrefix).concat(object.name, "\" class=\"section\">").concat(typeLine, "</h5>");
                if (object.description) {
                    contentHTML += descriptionHTML(object.description);
                }
            });
        }
        if (baseObject.type === 'type') {
            var instanceNames = baseObject.instanceProperties.map(function (prop) { return prop.name; }).sort();
            instanceNames.forEach(function (name) {
                var object = nameLookup(baseObject.instanceProperties, name);
                indexHTML += "<a class=\"sublink\" href=\"#".concat(baseURLPrefix).concat(object.name, "\">").concat(object.name, "</a><br>");
                var typeLine = "<span class=\"entryName\">".concat(object.name, "</span>");
                if (object.explicitGetName) {
                    typeLine += " <span class=\"property\">".concat(typeString(object.returns.type), "</span>");
                    typeLine += " <span class=\"entryName explicitSetterGetter\">".concat(object.explicitGetName);
                }
                if (object.explicitSetName) {
                    typeLine += " <span class=\"property\">".concat(typeString(object.returns.type), "</span>");
                    typeLine += " <span class=\"entryName explicitSetterGetter\">".concat(object.explicitSetName);
                }
                typeLine += inlineParameterList(object);
                typeLine += returnOrConstant(object);
                if (object.explicitSetName || object.explicitGetName) {
                    typeLine += '</span>';
                }
                contentHTML += "<h5 id=\"".concat(baseURLPrefix).concat(object.name, "\" class=\"section\">").concat(typeLine, "</h5>");
                contentHTML += descriptionHTML(object.description);
                contentHTML += parameterDetailsList(object);
            });
        }
    });
    indexHTML += '</div>';
    return {
        indexHTML: indexHTML,
        contentHTML: contentHTML
    };
}
exports.default = documentationToHTML;
