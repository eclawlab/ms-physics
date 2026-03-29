// Copyright 2018-2026, University of Colorado Boulder

/**
 * What type of representation is being shown for building-type screens.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';

const BuildingRepresentation = EnumerationDeprecated.byKeys( [
  'PIE',
  'BAR'
], {
  beforeFreeze: BuildingRepresentation => {
    /**
     * Returns the offset for a stack given the index.
     * @public
     *
     * @param {BuildingRepresentation} representation
     * @param {number} index
     * @returns {Vector2}
     */
    BuildingRepresentation.getOffset = ( representation, index ) => {
      return new Vector2( ( representation === BuildingRepresentation.PIE ? 1 : -1 ) * 4 * index, -4 * index );
    };
  }
} );

export default BuildingRepresentation;
