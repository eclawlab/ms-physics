// Copyright 2018-2026, University of Colorado Boulder

/**
 * Unit tests. Please run once in phet brand.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import qunitStart from '../../chipper/js/browser/sim-tests/qunitStart.js';
import './common/model/PrimeFactorizationTests.js';
import './common/model/PrimesTests.js';
import './game/model/CollectionFinderTests.js';

// Since our tests are loaded asynchronously, we must direct QUnit to begin the tests
qunitStart();