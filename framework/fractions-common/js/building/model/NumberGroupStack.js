// Copyright 2018-2026, University of Colorado Boulder

/**
 * A stack of number groups (either mixed or non-mixed)
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import BuildingType from './BuildingType.js';
import Stack from './Stack.js';

class NumberGroupStack extends Stack {
  /**
   * @param {number} layoutQuantity
   * @param {boolean} isMixedNumber
   * @param {boolean} [isMutable]
   */
  constructor( layoutQuantity, isMixedNumber, isMutable = true ) {
    super( BuildingType.NUMBER, layoutQuantity, isMutable );

    // @public {boolean}
    this.isMixedNumber = isMixedNumber;

    // @public {ObservableArrayDef.<NumberGroup>} - NOTE: These should only ever be popped/pushed.
    this.numberGroups = this.array;
  }
}

export default NumberGroupStack;
