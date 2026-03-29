// Copyright 2018-2026, University of Colorado Boulder

/**
 * The different slots in a number group where number pieces can go.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';

const NumberSpotType = EnumerationDeprecated.byKeys( [
  'WHOLE',
  'NUMERATOR',
  'DENOMINATOR'
], {
  beforeFreeze: NumberSpotType => {
    /**
     * @param {boolean} isMixedNumber
     * @returns {Array.<NumberSpotType>} - Shows the number spots available for whether mixed numbers are an option.
     */
    NumberSpotType.getTypes = isMixedNumber => isMixedNumber ? [
      NumberSpotType.WHOLE,
      NumberSpotType.NUMERATOR,
      NumberSpotType.DENOMINATOR
    ] : [
      NumberSpotType.NUMERATOR,
      NumberSpotType.DENOMINATOR
    ];
  }
} );
export default NumberSpotType;
