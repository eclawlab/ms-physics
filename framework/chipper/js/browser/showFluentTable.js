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
exports.default = showFluentTable;
/**
 * When a sim is run with ?fluentTable, show a UI that displays translations, for evaluation purposes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
var DerivedProperty_js_1 = require("../../../axon/js/DerivedProperty.js");
var Property_js_1 = require("../../../axon/js/Property.js");
var localeProperty_js_1 = require("../../../joist/js/i18n/localeProperty.js");
var FluentConstant_js_1 = require("./FluentConstant.js");
var FluentPattern_js_1 = require("./FluentPattern.js");
var FluentComment_js_1 = require("./FluentComment.js");
function showFluentTable(simFluent, translationLocale) {
    window.phetSplashScreen && window.phetSplashScreen.dispose();
    // Create the main container
    var container = document.createElement('div');
    container.style.cssText = "\n    position: fixed;\n    top: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    background: white;\n    z-index: 10000;\n    font-family: Arial, sans-serif;\n    overflow: hidden;\n    display: flex;\n    flex-direction: column;\n  ";
    // Create header
    var header = document.createElement('div');
    header.style.cssText = "\n    background: #2c3e50;\n    color: white;\n    padding: 1rem 1.5rem;\n    flex-shrink: 0;\n  ";
    var title = document.createElement('h1');
    title.textContent = 'Fluent String Evaluation Tool';
    title.style.cssText = "\n    margin: 0 0 0.5rem 0;\n    font-size: 1.5rem;\n  ";
    var subtitle = document.createElement('p');
    subtitle.textContent = 'Evaluate fluent string translations with real-time parameter interpolation';
    subtitle.style.margin = '0';
    header.appendChild(title);
    header.appendChild(subtitle);
    // Create controls
    var controls = document.createElement('div');
    controls.style.cssText = "\n    background: #ecf0f1;\n    padding: 1rem 1.5rem;\n    border-bottom: 1px solid #bdc3c7;\n    display: flex;\n    gap: 1rem;\n    align-items: center;\n    flex-wrap: wrap;\n    flex-shrink: 0;\n  ";
    // Create column visibility checkboxes
    var checkboxes = [
        { id: 'showKey', label: 'Show Key', checked: true },
        { id: 'showOptions', label: 'Show Options', checked: true },
        { id: 'showEnglish', label: 'Show English', checked: true },
        { id: 'showTranslation', label: 'Show Translation', checked: true }
    ];
    checkboxes.forEach(function (_a) {
        var id = _a.id, label = _a.label, checked = _a.checked;
        var controlGroup = document.createElement('label');
        controlGroup.style.cssText = "\n      display: flex;\n      align-items: center;\n      gap: 0.5rem;\n      font-weight: bold;\n      color: #2c3e50;\n      cursor: pointer;\n    ";
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.addEventListener('change', updateColumnVisibility);
        var labelText = document.createElement('span');
        labelText.textContent = label;
        controlGroup.appendChild(checkbox);
        controlGroup.appendChild(labelText);
        controls.appendChild(controlGroup);
    });
    // Create locale selector
    var localeGroup = document.createElement('div');
    localeGroup.style.cssText = "\n    display: flex;\n    align-items: center;\n    gap: 0.5rem;\n    font-weight: bold;\n    color: #2c3e50;\n  ";
    var localeLabel = document.createElement('span');
    localeLabel.textContent = 'Locale:';
    var localeInput = document.createElement('select');
    localeInput.id = 'localeInput';
    localeInput.style.cssText = "\n    padding: 0.25rem;\n    border: 1px solid #bdc3c7;\n    border-radius: 3px;\n    font-size: 0.85rem;\n  ";
    // Populate with available locales
    localeProperty_js_1.default.availableRuntimeLocales.forEach(function (locale) {
        var option = document.createElement('option');
        option.value = locale;
        option.textContent = locale;
        if (locale === translationLocale) {
            option.selected = true;
        }
        localeInput.appendChild(option);
    });
    // Create Property for the selected locale
    var userSelectedLocaleProperty = new Property_js_1.default(translationLocale);
    localeInput.addEventListener('change', function () {
        userSelectedLocaleProperty.value = localeInput.value;
    });
    localeGroup.appendChild(localeLabel);
    localeGroup.appendChild(localeInput);
    controls.appendChild(localeGroup);
    // Create table container
    var tableContainer = document.createElement('div');
    tableContainer.style.cssText = "\n    flex: 1;\n    overflow: auto;\n    background: white;\n  ";
    // Create table
    var table = document.createElement('table');
    table.style.cssText = "\n    width: 100%;\n    border-collapse: collapse;\n    font-size: 0.9rem;\n  ";
    // Create table header
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    var headers = [
        { id: 'keyHeader', text: 'Key' },
        { id: 'optionsHeader', text: 'Options' },
        { id: 'englishHeader', text: 'English' },
        { id: 'translationHeader', text: 'Translation' }
    ];
    headers.forEach(function (_a) {
        var id = _a.id, text = _a.text;
        var th = document.createElement('th');
        th.id = id;
        th.textContent = text;
        th.style.cssText = "\n      background: #34495e;\n      color: white;\n      padding: 0.75rem;\n      text-align: left;\n      font-weight: bold;\n      position: sticky;\n      top: 0;\n      z-index: 10;\n      border-right: 1px solid #2c3e50;\n    ";
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    // Create table body
    var tbody = document.createElement('tbody');
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    // Collect all fluent entries
    var fluentEntries = [];
    var collectEntries = function (obj, prefix, seen) {
        if (prefix === void 0) { prefix = ''; }
        if (seen === void 0) { seen = new WeakSet(); }
        if (obj === null || typeof obj !== 'object') {
            return;
        }
        if (seen.has(obj)) {
            return;
        }
        seen.add(obj);
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = obj[key];
            var fullKey = prefix ? "".concat(prefix, ".").concat(key) : key;
            if (value instanceof FluentConstant_js_1.default) {
                fluentEntries.push({
                    key: fullKey,
                    fluentConstant: value,
                    isConstant: true,
                    isComment: false
                });
            }
            else if (value instanceof FluentPattern_js_1.default) {
                fluentEntries.push({
                    key: fullKey,
                    fluentPattern: value,
                    isConstant: false,
                    isComment: false
                });
            }
            else if (value instanceof FluentComment_js_1.default) {
                fluentEntries.push({
                    key: fullKey,
                    fluentComment: value,
                    isConstant: false,
                    isComment: true
                });
            }
            else {
                collectEntries(value, fullKey, seen);
            }
        }
    };
    // NOTE: This preserves the order from the SimFluent file.
    collectEntries(simFluent);
    // Store parameter Properties for each row
    var rowParameterProperties = new Map();
    var rowEnglishProperties = new Map();
    var rowTranslationProperties = new Map();
    // Create table rows
    fluentEntries.forEach(function (entry) {
        var row = document.createElement('tr');
        row.style.cssText = "\n      border-bottom: 1px solid #ecf0f1;\n    ";
        row.classList.add('fluent-row');
        // Key column
        var keyCell = document.createElement('td');
        keyCell.className = 'key-cell';
        keyCell.textContent = entry.key;
        keyCell.style.cssText = "\n      font-family: 'Courier New', monospace;\n      font-size: 0.85rem;\n      color: #2c3e50;\n      padding: 0.75rem;\n      vertical-align: top;\n      min-width: 200px;\n      max-width: 300px;\n      word-break: break-word;\n      border-right: 1px solid #ecf0f1;\n    ";
        // Options column
        var optionsCell = document.createElement('td');
        optionsCell.className = 'options-cell';
        optionsCell.style.cssText = "\n      padding: 0.75rem;\n      vertical-align: top;\n      min-width: 200px;\n      max-width: 300px;\n      border-right: 1px solid #ecf0f1;\n    ";
        // English column
        var englishCell = document.createElement('td');
        englishCell.className = 'english-cell';
        englishCell.style.cssText = "\n      padding: 0.75rem;\n      vertical-align: top;\n      max-width: 400px;\n      word-wrap: break-word;\n      color: #2c74e8;\n      border-right: 1px solid #ecf0f1;\n    ";
        // Translation column
        var translationCell = document.createElement('td');
        translationCell.className = 'translation-cell';
        translationCell.style.cssText = "\n      padding: 0.75rem;\n      vertical-align: top;\n      max-width: 400px;\n      word-wrap: break-word;\n      color: black;\n    ";
        if (entry.isConstant && entry.fluentConstant) {
            // Handle FluentConstant (no parameters)
            optionsCell.textContent = '';
            optionsCell.style.fontStyle = 'italic';
            optionsCell.style.color = '#2c74e8';
            localeProperty_js_1.default.value = 'en';
            var result = entry.fluentConstant.value;
            // Create Properties for English and translation values
            var englishProperty = new Property_js_1.default(result);
            var translationProperty = new DerivedProperty_js_1.default([userSelectedLocaleProperty], function () {
                localeProperty_js_1.default.value = userSelectedLocaleProperty.value;
                return entry.fluentConstant.value;
            });
            // Link Properties to DOM elements
            englishProperty.link(function (value) {
                englishCell.textContent = value;
            });
            translationProperty.link(function (value) {
                translationCell.textContent = value;
            });
            // Store Properties for cleanup if needed
            rowEnglishProperties.set(entry.key, englishProperty);
            rowTranslationProperties.set(entry.key, translationProperty);
        }
        else if (!entry.isConstant && entry.fluentPattern) {
            // Handle FluentPattern (has parameters)
            var pattern_1 = entry.fluentPattern;
            // Create parameter inputs
            var inputContainer_1 = document.createElement('div');
            var parameterProperties_1 = new Map();
            if (pattern_1.args && pattern_1.args.length > 0) {
                pattern_1.args.forEach(function (argDef, index) {
                    var inputGroup = document.createElement('div');
                    inputGroup.style.cssText = "\n            margin-bottom: 0.5rem;\n          ";
                    var label = document.createElement('label');
                    label.style.cssText = "\n            display: block;\n            font-weight: bold;\n            margin-bottom: 0.25rem;\n            font-size: 0.8rem;\n            color: #34495e;\n          ";
                    // Extract parameter name and variants from the arg definition
                    var paramName = argDef.name || "param".concat(index);
                    var variants = argDef.variants;
                    label.textContent = paramName;
                    var input;
                    var variantMap;
                    var parameterProperty;
                    if (variants && variants.length > 0) {
                        // Create dropdown for parameters with variants
                        input = document.createElement('select');
                        variantMap = new Map();
                        variants.forEach(function (variant, index) {
                            var option = document.createElement('option');
                            // Handle complex variant objects like {"type":"number","value":"one"}
                            var value = typeof variant === 'object' && variant.value !== undefined ? variant.value : variant;
                            var optionKey = "".concat(index);
                            option.value = optionKey;
                            option.textContent = String(value);
                            variantMap.set(optionKey, value);
                            input.appendChild(option);
                        });
                        input.style.cssText = "\n              width: 100%;\n              padding: 0.25rem;\n              border: 1px solid #bdc3c7;\n              border-radius: 3px;\n              font-size: 0.8rem;\n            ";
                        // Create Property with initial value
                        parameterProperty = new Property_js_1.default(variantMap.get(input.value));
                    }
                    else {
                        // Create text input for parameters without variants
                        input = document.createElement('input');
                        input.type = 'text';
                        input.value = "{ $".concat(paramName, " }"); // Default value is to show the name of the parameter in fluent syntax
                        input.style.cssText = "\n              width: 100%;\n              padding: 0.25rem;\n              border: 1px solid #bdc3c7;\n              border-radius: 3px;\n              font-size: 0.8rem;\n            ";
                        // Create Property with initial value
                        parameterProperty = new Property_js_1.default(input.value);
                    }
                    // Add event listener to update Property
                    input.addEventListener('input', function () {
                        if (variantMap) {
                            // For dropdowns, use the original value from the map
                            parameterProperty.value = variantMap.get(input.value);
                        }
                        else {
                            // For text inputs, use the string value
                            parameterProperty.value = input.value;
                        }
                    });
                    parameterProperties_1.set(paramName, parameterProperty);
                    inputGroup.appendChild(label);
                    inputGroup.appendChild(input);
                    inputContainer_1.appendChild(inputGroup);
                });
            }
            else {
                var noParamsText = document.createElement('span');
                noParamsText.textContent = 'No parameters defined';
                noParamsText.style.cssText = "\n          font-style: italic;\n          color: #7f8c8d;\n        ";
                inputContainer_1.appendChild(noParamsText);
            }
            optionsCell.appendChild(inputContainer_1);
            rowParameterProperties.set(entry.key, parameterProperties_1);
            // Create parameter object for FluentPattern.createProperty()
            var parameterObject_1 = {};
            parameterProperties_1.forEach(function (property, paramName) {
                parameterObject_1[paramName] = property;
            });
            // Create English Property (always uses 'en' locale)
            var englishProperty = DerivedProperty_js_1.default.deriveAny(Array.from(parameterProperties_1.values()), function () {
                localeProperty_js_1.default.value = 'en';
                try {
                    return pattern_1.createProperty(parameterObject_1).value;
                }
                catch (error) {
                    return "Error: ".concat(error instanceof Error ? error.message : String(error));
                }
            });
            // Create Translation Property (uses selected locale)
            var translationProperty = DerivedProperty_js_1.default.deriveAny(__spreadArray([userSelectedLocaleProperty], Array.from(parameterProperties_1.values()), true), function () {
                localeProperty_js_1.default.value = userSelectedLocaleProperty.value;
                try {
                    return pattern_1.format(parameterObject_1);
                }
                catch (error) {
                    return "Error: ".concat(error instanceof Error ? error.message : String(error));
                }
            });
            // Link Properties to DOM elements
            englishProperty.link(function (value) {
                englishCell.textContent = value;
                englishCell.style.color = value.startsWith('Error:') ? '#e74c3c' : '#2c74e8';
            });
            translationProperty.link(function (value) {
                translationCell.textContent = value;
                translationCell.style.color = value.startsWith('Error:') ? '#e74c3c' : 'black';
            });
            // Store Properties for cleanup if needed
            rowEnglishProperties.set(entry.key, englishProperty);
            rowTranslationProperties.set(entry.key, translationProperty);
        }
        else if (entry.isComment && entry.fluentComment) {
            // Handle FluentComment - create a single cell that spans all columns
            row.style.cssText += "\n        background-color: #f8f9fa;\n        border-left: 4px solid #6c757d;\n      ";
            // Create a single cell that spans all 4 columns
            var commentCell = document.createElement('td');
            commentCell.setAttribute('colspan', '4');
            commentCell.textContent = entry.fluentComment.comment;
            commentCell.style.cssText = "\n        padding: 0.75rem;\n        font-weight: bold;\n        font-size: 1rem;\n        color: #2c3e50;\n        background-color: #f8f9fa;\n        text-align: left;\n      ";
            row.appendChild(commentCell);
        }
        // Add cells for non-comment entries
        if (!entry.isComment) {
            row.appendChild(keyCell);
            row.appendChild(optionsCell);
            row.appendChild(englishCell);
            row.appendChild(translationCell);
        }
        tbody.appendChild(row);
    });
    // Assemble the UI
    container.appendChild(header);
    container.appendChild(controls);
    container.appendChild(tableContainer);
    document.body.appendChild(container);
    // Function to update column visibility
    function updateColumnVisibility() {
        var showKey = document.getElementById('showKey').checked;
        var showOptions = document.getElementById('showOptions').checked;
        var showEnglish = document.getElementById('showEnglish').checked;
        var showTranslation = document.getElementById('showTranslation').checked;
        // Update headers
        var keyHeader = document.getElementById('keyHeader');
        var optionsHeader = document.getElementById('optionsHeader');
        var englishHeader = document.getElementById('englishHeader');
        var translationHeader = document.getElementById('translationHeader');
        if (keyHeader) {
            keyHeader.style.display = showKey ? '' : 'none';
        }
        if (optionsHeader) {
            optionsHeader.style.display = showOptions ? '' : 'none';
        }
        if (englishHeader) {
            englishHeader.style.display = showEnglish ? '' : 'none';
        }
        if (translationHeader) {
            translationHeader.style.display = showTranslation ? '' : 'none';
        }
        // Update cells
        var keyCells = document.querySelectorAll('.key-cell');
        var optionsCells = document.querySelectorAll('.options-cell');
        var englishCells = document.querySelectorAll('.english-cell');
        var translationCells = document.querySelectorAll('.translation-cell');
        keyCells.forEach(function (cell) {
            cell.style.display = showKey ? '' : 'none';
        });
        optionsCells.forEach(function (cell) {
            cell.style.display = showOptions ? '' : 'none';
        });
        englishCells.forEach(function (cell) {
            cell.style.display = showEnglish ? '' : 'none';
        });
        translationCells.forEach(function (cell) {
            cell.style.display = showTranslation ? '' : 'none';
        });
    }
    // Add some responsive styles
    var style = document.createElement('style');
    style.textContent = "\n    @media (max-width: 768px) {\n      .fluent-row td {\n        padding: 0.5rem 0.25rem !important;\n        font-size: 0.8rem !important;\n      }\n      .fluent-row .key-cell {\n        min-width: 120px !important;\n        max-width: 200px !important;\n      }\n      .fluent-row .options-cell {\n        min-width: 150px !important;\n        max-width: 250px !important;\n      }\n    }\n  ";
    document.head.appendChild(style);
    // Set once after building, so it doesn't swap back and forth locales during the build
    userSelectedLocaleProperty.value = translationLocale;
}
