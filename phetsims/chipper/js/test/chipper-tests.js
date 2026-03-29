"use strict";
// Copyright 2019-2024, University of Colorado Boulder
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * launch point to load any tests located around the chipper repo. This is to support running `qunit` with no args
 * from the top level of chipper, as is the recommended way to run chipper tests.
 *
 * On May 12, 2021, @samreid ran tests like so:
 * npm install --save-dev qunit
 * node node_modules/qunit/bin/qunit.js test/generalTests.js
 *
 * I didn't use a global qunit, since it seems we will eventually need a way to version qunit with chipper.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */
require("../common/ChipperStringUtilTests.js");
require("../phet-io/phetioCompareAPIsTests.js");
require("../phet-io/isInitialStateCompatibleTests.js");
