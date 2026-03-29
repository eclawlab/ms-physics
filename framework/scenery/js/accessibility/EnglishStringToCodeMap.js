"use strict";
// Copyright 2022-2025, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventCodeToEnglishString = exports.metaEnglishKeys = void 0;
/**
 * Maps the english key you want to use to the associated KeyboardEvent.codes for usage in listeners.
 * If a key has multiple code values, listener behavior will fire if either are pressed.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */
var KeyboardUtils_js_1 = require("../accessibility/KeyboardUtils.js");
var scenery_js_1 = require("../scenery.js");
var EnglishStringToCodeMap = {
    // Letter keys
    q: [KeyboardUtils_js_1.default.KEY_Q],
    w: [KeyboardUtils_js_1.default.KEY_W],
    e: [KeyboardUtils_js_1.default.KEY_E],
    r: [KeyboardUtils_js_1.default.KEY_R],
    t: [KeyboardUtils_js_1.default.KEY_T],
    y: [KeyboardUtils_js_1.default.KEY_Y],
    u: [KeyboardUtils_js_1.default.KEY_U],
    i: [KeyboardUtils_js_1.default.KEY_I],
    o: [KeyboardUtils_js_1.default.KEY_O],
    p: [KeyboardUtils_js_1.default.KEY_P],
    a: [KeyboardUtils_js_1.default.KEY_A],
    s: [KeyboardUtils_js_1.default.KEY_S],
    d: [KeyboardUtils_js_1.default.KEY_D],
    f: [KeyboardUtils_js_1.default.KEY_F],
    g: [KeyboardUtils_js_1.default.KEY_G],
    h: [KeyboardUtils_js_1.default.KEY_H],
    j: [KeyboardUtils_js_1.default.KEY_J],
    k: [KeyboardUtils_js_1.default.KEY_K],
    l: [KeyboardUtils_js_1.default.KEY_L],
    z: [KeyboardUtils_js_1.default.KEY_Z],
    x: [KeyboardUtils_js_1.default.KEY_X],
    c: [KeyboardUtils_js_1.default.KEY_C],
    v: [KeyboardUtils_js_1.default.KEY_V],
    b: [KeyboardUtils_js_1.default.KEY_B],
    n: [KeyboardUtils_js_1.default.KEY_N],
    m: [KeyboardUtils_js_1.default.KEY_M],
    // number keys - number and numpad
    0: [KeyboardUtils_js_1.default.KEY_0, KeyboardUtils_js_1.default.KEY_NUMPAD_0],
    1: [KeyboardUtils_js_1.default.KEY_1, KeyboardUtils_js_1.default.KEY_NUMPAD_1],
    2: [KeyboardUtils_js_1.default.KEY_2, KeyboardUtils_js_1.default.KEY_NUMPAD_2],
    3: [KeyboardUtils_js_1.default.KEY_3, KeyboardUtils_js_1.default.KEY_NUMPAD_3],
    4: [KeyboardUtils_js_1.default.KEY_4, KeyboardUtils_js_1.default.KEY_NUMPAD_4],
    5: [KeyboardUtils_js_1.default.KEY_5, KeyboardUtils_js_1.default.KEY_NUMPAD_5],
    6: [KeyboardUtils_js_1.default.KEY_6, KeyboardUtils_js_1.default.KEY_NUMPAD_6],
    7: [KeyboardUtils_js_1.default.KEY_7, KeyboardUtils_js_1.default.KEY_NUMPAD_7],
    8: [KeyboardUtils_js_1.default.KEY_8, KeyboardUtils_js_1.default.KEY_NUMPAD_8],
    9: [KeyboardUtils_js_1.default.KEY_9, KeyboardUtils_js_1.default.KEY_NUMPAD_9],
    // various command keys
    enter: [KeyboardUtils_js_1.default.KEY_ENTER],
    tab: [KeyboardUtils_js_1.default.KEY_TAB],
    equals: [KeyboardUtils_js_1.default.KEY_EQUALS],
    plus: [KeyboardUtils_js_1.default.KEY_PLUS, KeyboardUtils_js_1.default.KEY_NUMPAD_PLUS],
    minus: [KeyboardUtils_js_1.default.KEY_MINUS, KeyboardUtils_js_1.default.KEY_NUMPAD_MINUS],
    period: [KeyboardUtils_js_1.default.KEY_PERIOD, KeyboardUtils_js_1.default.KEY_NUMPAD_DECIMAL],
    escape: [KeyboardUtils_js_1.default.KEY_ESCAPE],
    delete: [KeyboardUtils_js_1.default.KEY_DELETE],
    backspace: [KeyboardUtils_js_1.default.KEY_BACKSPACE],
    pageUp: [KeyboardUtils_js_1.default.KEY_PAGE_UP],
    pageDown: [KeyboardUtils_js_1.default.KEY_PAGE_DOWN],
    end: [KeyboardUtils_js_1.default.KEY_END],
    home: [KeyboardUtils_js_1.default.KEY_HOME],
    space: [KeyboardUtils_js_1.default.KEY_SPACE],
    arrowLeft: [KeyboardUtils_js_1.default.KEY_LEFT_ARROW],
    arrowRight: [KeyboardUtils_js_1.default.KEY_RIGHT_ARROW],
    arrowUp: [KeyboardUtils_js_1.default.KEY_UP_ARROW],
    arrowDown: [KeyboardUtils_js_1.default.KEY_DOWN_ARROW],
    // modifier keys
    ctrl: KeyboardUtils_js_1.default.CONTROL_KEYS,
    alt: KeyboardUtils_js_1.default.ALT_KEYS,
    shift: KeyboardUtils_js_1.default.SHIFT_KEYS,
    meta: KeyboardUtils_js_1.default.META_KEYS
};
scenery_js_1.default.register('EnglishStringToCodeMap', EnglishStringToCodeMap);
exports.default = EnglishStringToCodeMap;
exports.metaEnglishKeys = ['ctrl', 'alt', 'shift', 'meta'];
/**
 * Returns the first EnglishStringToCodeMap that corresponds to the provided event.code. Null if no match is found.
 * Useful when matching an english string used by KeyboardListener to the event code from a
 * SceneryEvent.domEvent.code.
 *
 * For example:
 *
 *   KeyboardUtils.eventCodeToEnglishString( 'KeyA' ) === 'a'
 *   KeyboardUtils.eventCodeToEnglishString( 'Numpad0' ) === '0'
 *   KeyboardUtils.eventCodeToEnglishString( 'Digit0' ) === '0'
 *
 * NOTE: This cannot be in KeyboardUtils because it would create a circular dependency.
 */
var eventCodeToEnglishString = function (eventCode) {
    for (var key in EnglishStringToCodeMap) {
        if (EnglishStringToCodeMap.hasOwnProperty(key) &&
            (EnglishStringToCodeMap[key]).includes(eventCode)) {
            return key;
        }
    }
    return null;
};
exports.eventCodeToEnglishString = eventCodeToEnglishString;
