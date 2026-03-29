// Copyright 2018-2026, University of Colorado Boulder

/**
 * Enumerates strategies for turning ShapePartition + Fraction => FilledPartition
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';

const FillType = EnumerationDeprecated.byKeys( [
  'SEQUENTIAL',
  'MIXED', // when number of shapes > 1, first shape will be completely filled and the 2nd shape will be random
  'RANDOM'
] );
export default FillType;
