"use strict";
// Copyright 2020-2025, University of Colorado Boulder
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModulifiedFileString = exports.replace = void 0;
/**
 * Generates JS modules from resources such as images/strings/audio/etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson (PhET Interactive Simulations)
 */
var fs_1 = require("fs");
// eslint-disable-next-line phet/default-import-match-filename
var promises_1 = require("fs/promises");
var lodash_1 = require("lodash");
var path_1 = require("path");
var writeFileAndGitAdd_js_1 = require("../../../../perennial-alias/js/common/writeFileAndGitAdd.js");
var grunt_js_1 = require("../../../../perennial-alias/js/npm-dependencies/grunt.js");
var loadFileAsDataURI_js_1 = require("../../common/loadFileAsDataURI.js");
var pascalCase_js_1 = require("../../common/pascalCase.js");
var toLessEscapedString_js_1 = require("../../common/toLessEscapedString.js");
var createMipmap_js_1 = require("../createMipmap.js");
var generateDevelopmentStrings_js_1 = require("../generateDevelopmentStrings.js");
var getCopyrightLineFromFileContents_js_1 = require("../getCopyrightLineFromFileContents.js");
var convertStringsYamlToJson_js_1 = require("./convertStringsYamlToJson.js");
var createStringModule_js_1 = require("./createStringModule.js");
var generateFluentTypes_js_1 = require("./generateFluentTypes.js");
var modulifyFluentFile_js_1 = require("./modulifyFluentFile.js");
var svgo = require('svgo');
var OFF = 'off';
// disable lint in compiled files, because it increases the linting time
var HEADER = '/* eslint-disable */\n/* @formatter:' + OFF + ' */\n';
// supported image types, not case-sensitive
var IMAGE_SUFFIXES = ['.png', '.jpg', '.cur', '.svg'];
var SVG_SUFFIXES = ['.svg'];
var OTHER_IMAGE_SUFFIXES = IMAGE_SUFFIXES.filter(function (suffix) { return !SVG_SUFFIXES.includes(suffix); });
// supported sound file types, not case-sensitive
var SOUND_SUFFIXES = ['.mp3', '.wav'];
var FLUENT_SUFFIXES = ['.ftl'];
// Process images in various directories
var IMAGE_DIRECTORIES = ['images', 'phet/images', 'phet-io/images', 'adapted-from-phet/images'];
var MIPMAP_DIRECTORIES = ['mipmaps', 'phet/mipmaps', 'phet-io/mipmaps', 'adapted-from-phet/mipmaps'];
var SOUND_DIRECTORIES = ['sounds'];
var STRING_DIRECTORIES = ['strings'];
/**
 * String replacement
 * @param string - the string which will be searched
 * @param search - the text to be replaced
 * @param replacement - the new text
 */
var replace = function (string, search, replacement) { return string.split(search).join(replacement); };
exports.replace = replace;
/**
 * Gets the relative path to the root based on the depth of a resource
 */
var expandDots = function (relativePath) {
    relativePath = relativePath.replaceAll('\\', '/'); // Normalize the path to use forward slashes
    // Finds the depths of a directory relative to the root of where grunt.recurse was called from (a repo root)
    var depth = relativePath.split('/').length;
    var parentDirectory = '';
    for (var i = 0; i < depth; i++) {
        parentDirectory = "".concat(parentDirectory, "../");
    }
    return parentDirectory;
};
/**
 * Turn a file into a TS file that loads the image.
 */
var getModulifiedImage = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var abspath, dataURI;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                abspath = path_1.default.resolve("../".concat(repo), relativePath);
                return [4 /*yield*/, (0, loadFileAsDataURI_js_1.asyncLoadFileAsDataURI)(abspath)];
            case 1:
                dataURI = _a.sent();
                return [2 /*return*/, {
                        content: "".concat(HEADER, "\nimport asyncLoader from '").concat(expandDots(relativePath), "phet-core/js/asyncLoader.js';\n\nconst image = new Image();\nconst unlock = asyncLoader.createLock( image );\nimage.onload = unlock;\nimage.src = '").concat(dataURI, "';\nexport default image;"),
                        usedRelativeFiles: [relativePath]
                    }];
        }
    });
}); };
/**
 * Turn a file into a TS file that loads the SVG image.
 */
var getModulifiedSVGImage = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var abspath, fileContents, optimizedContents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                abspath = path_1.default.resolve("../".concat(repo), relativePath);
                return [4 /*yield*/, promises_1.default.readFile(abspath, 'utf-8')];
            case 1:
                fileContents = _a.sent();
                if (!fileContents.includes('width="') || !fileContents.includes('height="')) {
                    throw new Error("SVG file ".concat(abspath, " does not contain width and height attributes"));
                }
                optimizedContents = svgo.optimize(fileContents, {
                    multipass: true,
                    plugins: [
                        {
                            name: 'preset-default',
                            params: {
                                overrides: {
                                    // We can't scale things and get the right bounds if the view box is removed.
                                    removeViewBox: false
                                }
                            }
                        }
                    ]
                }).data;
                return [2 /*return*/, {
                        content: "".concat(HEADER, "\nimport asyncLoader from '").concat(expandDots(relativePath), "phet-core/js/asyncLoader.js';\n\nconst image = new Image();\nconst unlock = asyncLoader.createLock( image );\nimage.onload = unlock;\nimage.src = `data:image/svg+xml;base64,${btoa(").concat((0, toLessEscapedString_js_1.default)(optimizedContents), ")}`;\nexport default image;"),
                        usedRelativeFiles: [relativePath]
                    }];
        }
    });
}); };
/**
 * Turn a file into a TS file that loads the mipmap
 */
var getModulifiedMipmap = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var config, abspath, mipmapLevels, entries;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                config = {
                    level: 4, // maximum level
                    quality: 98
                };
                abspath = path_1.default.resolve("../".concat(repo), relativePath);
                return [4 /*yield*/, (0, createMipmap_js_1.default)(abspath, config.level, config.quality)];
            case 1:
                mipmapLevels = _a.sent();
                entries = mipmapLevels.map(function (_a) {
                    var width = _a.width, height = _a.height, url = _a.url;
                    return "  new MipmapElement( ".concat(width, ", ").concat(height, ", '").concat(url, "' )");
                });
                return [2 /*return*/, {
                        content: "".concat(HEADER, "\nimport MipmapElement from '").concat(expandDots(relativePath), "chipper/js/browser/MipmapElement.js';\n\n// The levels in the mipmap. Specify explicit types rather than inferring to assist the type checker, for this boilerplate case.\nconst mipmaps = [\n").concat(entries.join(',\n'), "\n];\n\nexport default mipmaps;"),
                        usedRelativeFiles: [relativePath]
                    }];
        }
    });
}); };
/**
 * Turn a file into a TS file that loads the sound
 */
var getModulifiedSound = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var abspath, dataURI;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                abspath = path_1.default.resolve("../".concat(repo), relativePath);
                return [4 /*yield*/, (0, loadFileAsDataURI_js_1.asyncLoadFileAsDataURI)(abspath)];
            case 1:
                dataURI = _a.sent();
                // output the contents of the file that will define the sound in JS format
                return [2 /*return*/, {
                        content: "".concat(HEADER, "\nimport asyncLoader from '").concat(expandDots(relativePath), "phet-core/js/asyncLoader.js';\nimport base64SoundToByteArray from '").concat(expandDots(relativePath), "tambo/js/base64SoundToByteArray.js';\nimport WrappedAudioBuffer from '").concat(expandDots(relativePath), "tambo/js/WrappedAudioBuffer.js';\nimport phetAudioContext from '").concat(expandDots(relativePath), "tambo/js/phetAudioContext.js';\n\nconst soundURI = '").concat(dataURI, "';\nconst soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );\nconst unlock = asyncLoader.createLock( soundURI );\nconst wrappedAudioBuffer = new WrappedAudioBuffer();\n\n// safe way to unlock\nlet unlocked = false;\nconst safeUnlock = () => {\n  if ( !unlocked ) {\n    unlock();\n    unlocked = true;\n  }\n};\n\nconst onDecodeSuccess = decodedAudio => {\n  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {\n    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );\n    safeUnlock();\n  }\n};\nconst onDecodeError = decodeError => {\n  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );\n  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );\n  safeUnlock();\n};\nconst decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );\nif ( decodePromise ) {\n  decodePromise\n    .then( decodedAudio => {\n      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {\n        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );\n        safeUnlock();\n      }\n    } )\n    .catch( e => {\n      console.warn( 'promise rejection caught for audio decode, error = ' + e );\n      safeUnlock();\n    } );\n}\nexport default wrappedAudioBuffer;"),
                        usedRelativeFiles: [relativePath]
                    }];
        }
    });
}); };
// the image module at js/${_.camelCase( repo )}Images.js for repos that need it.
var getImageModule = function (repo, supportedRegionsAndCultures) { return __awaiter(void 0, void 0, void 0, function () {
    var spec, _a, _b, namespace, imageModuleName, relativeImageModuleFile, providedRegionsAndCultures, imageNames, imageFiles, getImportName, importNames_1, duplicates, firstDuplicate_1, originalNames, copyrightLine;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _b = (_a = JSON).parse;
                return [4 /*yield*/, promises_1.default.readFile("../".concat(repo, "/").concat(repo, "-images.json"), 'utf8')];
            case 1:
                spec = _b.apply(_a, [_c.sent()]);
                namespace = lodash_1.default.camelCase(repo);
                imageModuleName = "".concat((0, pascalCase_js_1.default)(repo), "Images");
                relativeImageModuleFile = "js/".concat(imageModuleName, ".ts");
                providedRegionsAndCultures = Object.keys(spec);
                // Ensure our regionAndCultures in the -images.json file match with the supportedRegionsAndCultures in the package.json
                supportedRegionsAndCultures.forEach(function (regionAndCulture) {
                    if (!providedRegionsAndCultures.includes(regionAndCulture)) {
                        throw new Error("regionAndCulture '".concat(regionAndCulture, "' is required, but not found in ").concat(repo, "-images.json"));
                    }
                });
                providedRegionsAndCultures.forEach(function (regionAndCulture) {
                    if (!supportedRegionsAndCultures.includes(regionAndCulture)) {
                        throw new Error("regionAndCulture '".concat(regionAndCulture, "' is not supported, but found in ").concat(repo, "-images.json"));
                    }
                });
                imageNames = lodash_1.default.uniq(providedRegionsAndCultures.flatMap(function (regionAndCulture) {
                    return Object.keys(spec[regionAndCulture]);
                })).sort();
                imageFiles = lodash_1.default.uniq(providedRegionsAndCultures.flatMap(function (regionAndCulture) {
                    return Object.values(spec[regionAndCulture]);
                })).sort();
                // Do images exist?
                imageFiles.forEach(function (imageFile) {
                    if (!fs_1.default.existsSync("../".concat(repo, "/").concat(imageFile))) {
                        throw new Error("Image file ".concat(imageFile, " is referenced in ").concat(repo, "-images.json, but does not exist"));
                    }
                });
                // Ensure that all image names are provided for all regionAndCultures
                providedRegionsAndCultures.forEach(function (regionAndCulture) {
                    imageNames.forEach(function (imageName) {
                        if (!spec[regionAndCulture].hasOwnProperty(imageName)) {
                            throw new Error("Image name ".concat(imageName, " is not provided for regionAndCulture ").concat(regionAndCulture, " (but provided for others)"));
                        }
                    });
                });
                getImportName = function (imageFile) { return path_1.default.basename(imageFile, path_1.default.extname(imageFile)); };
                // Check that import names are unique
                // NOTE: we could disambiguate in the future in an automated way fairly easily, but should it be done?
                if (lodash_1.default.uniq(imageFiles.map(getImportName)).length !== imageFiles.length) {
                    importNames_1 = imageFiles.map(getImportName);
                    duplicates = importNames_1.filter(function (name, index) { return importNames_1.indexOf(name) !== index; });
                    if (duplicates.length) { // sanity check!
                        firstDuplicate_1 = duplicates[0];
                        originalNames = imageFiles.filter(function (imageFile) { return getImportName(imageFile) === firstDuplicate_1; });
                        throw new Error("Multiple images result in the same import name ".concat(firstDuplicate_1, ": ").concat(originalNames.join(', ')));
                    }
                }
                return [4 /*yield*/, (0, getCopyrightLineFromFileContents_js_1.default)(repo, relativeImageModuleFile)];
            case 2:
                copyrightLine = _c.sent();
                return [2 /*return*/, {
                        content: "".concat(copyrightLine, "\n/* eslint-disable */\n/* @formatter:").concat(OFF, " */\n/**\n * Auto-generated from modulify, DO NOT manually modify.\n */\n \nimport LocalizedImageProperty from '../../joist/js/i18n/LocalizedImageProperty.js';\nimport ").concat(namespace, " from './").concat(namespace, ".js';\n").concat(imageFiles.map(function (imageFile) { return "import ".concat(getImportName(imageFile), " from '../").concat(imageFile.replace('.ts', '.js'), "';"); }).join('\n'), "\n\nconst ").concat(imageModuleName, " = {\n  ").concat(imageNames.map(function (imageName) {
                            return "".concat(imageName, "ImageProperty: new LocalizedImageProperty( '").concat(imageName, "', {\n    ").concat(supportedRegionsAndCultures.map(function (regionAndCulture) { return "".concat(regionAndCulture, ": ").concat(getImportName(spec[regionAndCulture][imageName])); }).join(',\n    '), "\n  } )");
                        }).join(',\n  '), "\n};\n\n").concat(namespace, ".register( '").concat(imageModuleName, "', ").concat(imageModuleName, " );\n\nexport default ").concat(imageModuleName, ";\n"),
                        usedRelativeFiles: [
                            "".concat(repo, "/").concat(repo, "-images.json"),
                            "".concat(repo, "/package.json")
                            // We don't actually do anything but error if the files aren't there, so we don't need them here
                        ]
                    }];
        }
    });
}); };
/**
 * Transform an image file to a JS file that loads the image.
 * @param repo - repository name for the modulify command
 * @param relativePath - the relative path of the image file
 */
var modulifyImage = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, tsFilename;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getModulifiedImage(repo, relativePath)];
            case 1:
                contents = (_a.sent()).content;
                tsFilename = convertSuffix(relativePath, '.ts');
                return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, tsFilename, contents)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Transform an SVG image file to a JS file that loads the image.
 * @param repo - repository name for the modulify command
 * @param relativePath - the relative path of the SVG file
 */
var modulifySVG = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, tsFilename;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getModulifiedSVGImage(repo, relativePath)];
            case 1:
                contents = (_a.sent()).content;
                tsFilename = convertSuffix(relativePath, '.ts');
                return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, tsFilename, contents)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Transform an image file to a JS file that loads the image as a mipmap.
 * @param repo - repository name for the modulify command
 * @param relativePath - the relative path of the image file
 */
var modulifyMipmap = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, tsFilename;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getModulifiedMipmap(repo, relativePath)];
            case 1:
                contents = (_a.sent()).content;
                tsFilename = convertSuffix(relativePath, '.ts');
                return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, tsFilename, contents)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Decode a sound file into a Web Audio AudioBuffer.
 * @param repo - repository name for the modulify command
 * @param relativePath - the relative path of the sound file
 */
var modulifySound = function (repo, relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var contents, jsFilename;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getModulifiedSound(repo, relativePath)];
            case 1:
                contents = (_a.sent()).content;
                jsFilename = convertSuffix(relativePath, '.js');
                return [4 /*yield*/, (0, writeFileAndGitAdd_js_1.default)(repo, jsFilename, contents)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Convert .png => _png_mipmap.js, etc.
 *
 * @param abspath - file name with a suffix or a path to it
 * @param suffix - the new suffix, such as '.js'
 */
var convertSuffix = function (abspath, suffix) {
    var lastDotIndex = abspath.lastIndexOf('.');
    return "".concat(abspath.substring(0, lastDotIndex), "_").concat(abspath.substring(lastDotIndex + 1)).concat(suffix);
};
/**
 * Determines the suffix from a filename, everything after the final '.'
 */
var getSuffix = function (filename) {
    var index = filename.lastIndexOf('.');
    return filename.substring(index);
};
/**
 * Creates the image module at js/${_.camelCase( repo )}Images.js for repos that need it.
 */
var createImageModule = function (repo, supportedRegionsAndCultures) { return __awaiter(void 0, void 0, void 0, function () {
    var imageModuleName, relativeImageModuleFile, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                imageModuleName = "".concat((0, pascalCase_js_1.default)(repo), "Images");
                relativeImageModuleFile = "js/".concat(imageModuleName, ".ts");
                _a = writeFileAndGitAdd_js_1.default;
                _b = [repo, relativeImageModuleFile];
                return [4 /*yield*/, getImageModule(repo, supportedRegionsAndCultures)];
            case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([(_c.sent()).content]))];
            case 2:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
 * Entry point for modulify, which transforms all the resources in a repo to *.js files.
 *
 * @param repo - the name of a repo, such as 'joist'
 * @param targets - the targets to process, or null for all
 */
exports.default = (function (repo, targets) { return __awaiter(void 0, void 0, void 0, function () {
    var targetImages, targetStrings, targetSounds, visitDirectories, _a, _b, _c, _d, _e, packageObject, _f, _g, supportedRegionsAndCultures, concreteRegionsAndCultures;
    var _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                targetImages = targets === null || targets.includes('images');
                targetStrings = targets === null || targets.includes('strings');
                targetSounds = targets === null || targets.includes('sounds');
                console.log("modulifying ".concat(repo, " for targets: ").concat(targets ? targets.join(', ') : 'all'));
                visitDirectories = function (dirs, suffixes, processor) { return __awaiter(void 0, void 0, void 0, function () {
                    var _loop_1, _i, dirs_1, dir;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _loop_1 = function (dir) {
                                    var dirPath, paths_1, i;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                dirPath = "../".concat(repo, "/").concat(dir);
                                                if (!fs_1.default.existsSync(dirPath)) return [3 /*break*/, 4];
                                                paths_1 = [];
                                                grunt_js_1.default.file.recurse(dirPath, function (abspath) { return __awaiter(void 0, void 0, void 0, function () {
                                                    return __generator(this, function (_a) {
                                                        if (suffixes.includes(getSuffix(abspath))) {
                                                            paths_1.push(path_1.default.relative("../".concat(repo), abspath));
                                                        }
                                                        return [2 /*return*/];
                                                    });
                                                }); });
                                                i = 0;
                                                _b.label = 1;
                                            case 1:
                                                if (!(i < paths_1.length)) return [3 /*break*/, 4];
                                                return [4 /*yield*/, processor(repo, paths_1[i])];
                                            case 2:
                                                _b.sent();
                                                _b.label = 3;
                                            case 3:
                                                i++;
                                                return [3 /*break*/, 1];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                };
                                _i = 0, dirs_1 = dirs;
                                _a.label = 1;
                            case 1:
                                if (!(_i < dirs_1.length)) return [3 /*break*/, 4];
                                dir = dirs_1[_i];
                                return [5 /*yield**/, _loop_1(dir)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); };
                _a = targetImages;
                if (!_a) return [3 /*break*/, 2];
                return [4 /*yield*/, visitDirectories(IMAGE_DIRECTORIES, SVG_SUFFIXES, modulifySVG)];
            case 1:
                _a = (_k.sent());
                _k.label = 2;
            case 2:
                _a;
                _b = targetImages;
                if (!_b) return [3 /*break*/, 4];
                return [4 /*yield*/, visitDirectories(IMAGE_DIRECTORIES, OTHER_IMAGE_SUFFIXES, modulifyImage)];
            case 3:
                _b = (_k.sent());
                _k.label = 4;
            case 4:
                _b;
                _c = targetImages;
                if (!_c) return [3 /*break*/, 6];
                return [4 /*yield*/, visitDirectories(MIPMAP_DIRECTORIES, IMAGE_SUFFIXES, modulifyMipmap)];
            case 5:
                _c = (_k.sent());
                _k.label = 6;
            case 6:
                _c;
                _d = targetSounds;
                if (!_d) return [3 /*break*/, 8];
                return [4 /*yield*/, visitDirectories(SOUND_DIRECTORIES, SOUND_SUFFIXES, modulifySound)];
            case 7:
                _d = (_k.sent());
                _k.label = 8;
            case 8:
                _d;
                _e = targetStrings;
                if (!_e) return [3 /*break*/, 10];
                return [4 /*yield*/, visitDirectories(STRING_DIRECTORIES, FLUENT_SUFFIXES, modulifyFluentFile_js_1.default)];
            case 9:
                _e = (_k.sent());
                _k.label = 10;
            case 10:
                _e;
                _g = (_f = JSON).parse;
                return [4 /*yield*/, promises_1.default.readFile("../".concat(repo, "/package.json"), 'utf8')];
            case 11:
                packageObject = _g.apply(_f, [_k.sent()]);
                if (!(targetStrings && fs_1.default.existsSync("../".concat(repo, "/").concat(repo, "-strings_en.yaml")))) return [3 /*break*/, 14];
                return [4 /*yield*/, (0, convertStringsYamlToJson_js_1.default)(repo)];
            case 12:
                _k.sent();
                return [4 /*yield*/, (0, generateFluentTypes_js_1.default)(repo)];
            case 13:
                _k.sent();
                _k.label = 14;
            case 14:
                if (!(targetStrings && fs_1.default.existsSync("../".concat(repo, "/").concat(repo, "-strings_en.json")) && packageObject.phet && packageObject.phet.requirejsNamespace)) return [3 /*break*/, 17];
                return [4 /*yield*/, (0, createStringModule_js_1.default)(repo)];
            case 15:
                _k.sent();
                return [4 /*yield*/, (0, generateDevelopmentStrings_js_1.default)(repo)];
            case 16:
                _k.sent();
                _k.label = 17;
            case 17:
                if (!(targetImages && fs_1.default.existsSync("../".concat(repo, "/").concat(repo, "-images.json")))) return [3 /*break*/, 19];
                supportedRegionsAndCultures = (_j = (_h = packageObject === null || packageObject === void 0 ? void 0 : packageObject.phet) === null || _h === void 0 ? void 0 : _h.simFeatures) === null || _j === void 0 ? void 0 : _j.supportedRegionsAndCultures;
                if (!supportedRegionsAndCultures) {
                    throw new Error("supportedRegionsAndCultures is not defined in package.json, but ".concat(repo, "-images.json exists"));
                }
                if (!supportedRegionsAndCultures.includes('usa')) {
                    throw new Error('regionAndCulture \'usa\' is required, but not found in supportedRegionsAndCultures');
                }
                if (supportedRegionsAndCultures.includes('multi') && supportedRegionsAndCultures.length < 3) {
                    throw new Error('regionAndCulture \'multi\' is supported, but there are not enough regionAndCultures to support it');
                }
                concreteRegionsAndCultures = supportedRegionsAndCultures.filter(function (regionAndCulture) { return regionAndCulture !== 'random'; });
                // Update the images module file
                return [4 /*yield*/, createImageModule(repo, concreteRegionsAndCultures)];
            case 18:
                // Update the images module file
                _k.sent();
                _k.label = 19;
            case 19: return [2 /*return*/];
        }
    });
}); });
/**
 * Returns either the modulified file content (to be replaced), or null if the file is not a modulified (result) resource.
 *
 * @param relativePath - the relative path of the modulified file, from the project root, e.g. 'joist/images/foo_png.ts'
 */
var getModulifiedFileString = function (relativePath) { return __awaiter(void 0, void 0, void 0, function () {
    var repo, repoRelativePath, pathWithSuffix, _i, IMAGE_DIRECTORIES_1, dir, imageSuffix, _a, MIPMAP_DIRECTORIES_1, dir, mipmapSuffix, _b, SOUND_DIRECTORIES_1, dir, soundSuffix, getEnglishStringsModulifiedFile, requestedRepo, _c, _d, packageObject, _e, _f, supportedRegionsAndCultures, concreteRegionsAndCultures;
    var _g, _h, _j, _k, _l, _m, _o, _p;
    return __generator(this, function (_q) {
        switch (_q.label) {
            case 0:
                repo = relativePath.split('/')[0];
                repoRelativePath = path_1.default.relative("".concat(repo, "/"), relativePath);
                pathWithSuffix = function (suffix, codeSuffix) {
                    var nonDotSuffix = suffix.substring(1);
                    return repoRelativePath.replace("_".concat(nonDotSuffix).concat(codeSuffix), suffix);
                };
                // Image (SVG/other) module files
                for (_i = 0, IMAGE_DIRECTORIES_1 = IMAGE_DIRECTORIES; _i < IMAGE_DIRECTORIES_1.length; _i++) {
                    dir = IMAGE_DIRECTORIES_1[_i];
                    if (relativePath.startsWith("".concat(repo, "/").concat(dir, "/"))) {
                        imageSuffix = ".".concat((_h = (_g = relativePath.match(/_(\w+)\.ts$/)) === null || _g === void 0 ? void 0 : _g[1]) !== null && _h !== void 0 ? _h : '');
                        if (SVG_SUFFIXES.includes(imageSuffix)) {
                            return [2 /*return*/, getModulifiedSVGImage(repo, pathWithSuffix(imageSuffix, '.ts'))];
                        }
                        else if (OTHER_IMAGE_SUFFIXES.includes(imageSuffix)) {
                            return [2 /*return*/, getModulifiedImage(repo, pathWithSuffix(imageSuffix, '.ts'))];
                        }
                    }
                }
                // Mipmap module files
                for (_a = 0, MIPMAP_DIRECTORIES_1 = MIPMAP_DIRECTORIES; _a < MIPMAP_DIRECTORIES_1.length; _a++) {
                    dir = MIPMAP_DIRECTORIES_1[_a];
                    if (relativePath.startsWith("".concat(repo, "/").concat(dir, "/"))) {
                        mipmapSuffix = ".".concat((_k = (_j = relativePath.match(/_(\w+)\.ts$/)) === null || _j === void 0 ? void 0 : _j[1]) !== null && _k !== void 0 ? _k : '');
                        if (IMAGE_SUFFIXES.includes(mipmapSuffix)) {
                            return [2 /*return*/, getModulifiedMipmap(repo, pathWithSuffix(mipmapSuffix, '.ts'))];
                        }
                    }
                }
                // Sound module files
                for (_b = 0, SOUND_DIRECTORIES_1 = SOUND_DIRECTORIES; _b < SOUND_DIRECTORIES_1.length; _b++) {
                    dir = SOUND_DIRECTORIES_1[_b];
                    if (relativePath.startsWith("".concat(repo, "/").concat(dir, "/"))) {
                        soundSuffix = ".".concat((_m = (_l = relativePath.match(/_(\w+)\.js$/)) === null || _l === void 0 ? void 0 : _l[1]) !== null && _m !== void 0 ? _m : '');
                        if (SOUND_SUFFIXES.includes(soundSuffix)) {
                            return [2 /*return*/, getModulifiedSound(repo, pathWithSuffix(soundSuffix, '.js'))];
                        }
                    }
                }
                // Fluent files
                if (relativePath.startsWith("".concat(repo, "/js/strings/")) && relativePath.endsWith('Messages.ts')) {
                    return [2 /*return*/, (0, modulifyFluentFile_js_1.getModulifiedFluentFile)(repo, "strings/".concat(path_1.default.basename(relativePath.replace(/Messages\.ts$/, '')), "_en.ftl"))];
                }
                getEnglishStringsModulifiedFile = function (requestedRepo) { return __awaiter(void 0, void 0, void 0, function () {
                    var usedRelativeFiles;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                usedRelativeFiles = [
                                    "".concat(requestedRepo, "/").concat(requestedRepo, "-strings_en.yaml"),
                                    "".concat(requestedRepo, "/").concat(requestedRepo, "-strings_en.json")
                                ];
                                if (!fs_1.default.existsSync("../".concat(requestedRepo, "/").concat(requestedRepo, "-strings_en.yaml"))) return [3 /*break*/, 2];
                                _a = {};
                                return [4 /*yield*/, (0, convertStringsYamlToJson_js_1.getJSONFromYamlStrings)(requestedRepo)];
                            case 1: return [2 /*return*/, (_a.content = _c.sent(),
                                    _a.usedRelativeFiles = usedRelativeFiles,
                                    _a)];
                            case 2:
                                _b = {};
                                return [4 /*yield*/, promises_1.default.readFile("../".concat(requestedRepo, "/").concat(requestedRepo, "-strings_en.json"), 'utf8')];
                            case 3: return [2 /*return*/, (_b.content = _c.sent(),
                                    _b.usedRelativeFiles = usedRelativeFiles,
                                    _b)];
                        }
                    });
                }); };
                // If we have YAML strings and get a direct request for the JSON, modulify it on the fly.
                if (relativePath === "".concat(repo, "/").concat(repo, "-strings_en.json") && fs_1.default.existsSync("../".concat(repo, "/").concat(repo, "-strings_en.yaml"))) {
                    return [2 /*return*/, getEnglishStringsModulifiedFile(repo)];
                }
                // String module file
                if (relativePath === "".concat(repo, "/js/").concat(lodash_1.default.camelCase(repo), "Strings.js")) {
                    return [2 /*return*/, (0, createStringModule_js_1.getStringModuleContents)(repo)];
                }
                if (!(relativePath.startsWith('babel/_generated_development_strings/') && relativePath.endsWith('_all.json'))) return [3 /*break*/, 2];
                requestedRepo = path_1.default.basename(relativePath).split('_')[0];
                _c = generateDevelopmentStrings_js_1.getDevelopmentStringsContents;
                _d = [requestedRepo];
                return [4 /*yield*/, getEnglishStringsModulifiedFile(requestedRepo)];
            case 1: return [2 /*return*/, _c.apply(void 0, _d.concat([_q.sent()]))];
            case 2:
                if (!(relativePath === "".concat(repo, "/js/").concat((0, pascalCase_js_1.default)(repo), "Images.ts"))) return [3 /*break*/, 4];
                _f = (_e = JSON).parse;
                return [4 /*yield*/, promises_1.default.readFile("../".concat(repo, "/package.json"), 'utf8')];
            case 3:
                packageObject = _f.apply(_e, [_q.sent()]);
                supportedRegionsAndCultures = (_p = (_o = packageObject === null || packageObject === void 0 ? void 0 : packageObject.phet) === null || _o === void 0 ? void 0 : _o.simFeatures) === null || _p === void 0 ? void 0 : _p.supportedRegionsAndCultures;
                concreteRegionsAndCultures = supportedRegionsAndCultures.filter(function (regionAndCulture) { return regionAndCulture !== 'random'; });
                return [2 /*return*/, getImageModule(repo, concreteRegionsAndCultures)];
            case 4:
                // Fluent types file
                if (relativePath === "".concat(repo, "/js/").concat((0, pascalCase_js_1.default)(repo), "Fluent.ts")) {
                    return [2 /*return*/, (0, generateFluentTypes_js_1.getFluentTypesFileContent)(repo)];
                }
                return [2 /*return*/, null];
        }
    });
}); };
exports.getModulifiedFileString = getModulifiedFileString;
