"use strict";
// Copyright 2018-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tracks object allocations for reporting using binder.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
var phetCore_js_1 = require("../phetCore.js");
function registerImplementation(instance, key, map) {
    instance.toDataURL(function (dataURL) {
        map[key].push(dataURL);
    });
}
var InstanceRegistry = /** @class */ (function () {
    function InstanceRegistry() {
    }
    /**
     * Adds a screenshot of the given scenery Node
     */
    InstanceRegistry.registerDataURL = function (repoName, typeName, instance) {
        if (phet.chipper.queryParameters.binder) {
            // Create the map if we haven't seen that component type before
            var key_1 = "".concat(repoName, "/").concat(typeName);
            InstanceRegistry.componentMap[key_1] = InstanceRegistry.componentMap[key_1] || [];
            try {
                if (instance.boundsProperty.value.isFinite()) {
                    registerImplementation(instance, key_1, InstanceRegistry.componentMap);
                }
                else {
                    var boundsListener_1 = function (bounds) {
                        if (bounds.isFinite()) {
                            registerImplementation(instance, key_1, InstanceRegistry.componentMap);
                            instance.boundsProperty.unlink(boundsListener_1); // less for memory, and more to not double add
                        }
                    };
                    instance.boundsProperty.lazyLink(boundsListener_1);
                }
            }
            catch (e) {
                // Ignore nodes that don't draw anything
                // TODO https://github.com/phetsims/phet-core/issues/80 is this masking a problem?
            }
        }
    };
    /**
     * Register a toolbox pattern node. There is no strict class for this, so this factored out method can be used by any constructor
     */
    InstanceRegistry.registerToolbox = function (instance) {
        if (phet.chipper.queryParameters.binder) {
            InstanceRegistry.registerDataURL('sun', 'ToolboxPattern', instance);
        }
    };
    /**
     * Register a Hotkey for binder documentation.
     */
    InstanceRegistry.registerHotkey = function (hotkeyData) {
        if (phet.chipper.queryParameters.binder) {
            InstanceRegistry.hotkeys.push(hotkeyData.serialize());
        }
    };
    // Per named component, store image URIs of what their usages look like
    InstanceRegistry.componentMap = {};
    // An array of all Hotkeys that have been registered.
    InstanceRegistry.hotkeys = [];
    return InstanceRegistry;
}());
phetCore_js_1.default.register('InstanceRegistry', InstanceRegistry);
exports.default = InstanceRegistry;
