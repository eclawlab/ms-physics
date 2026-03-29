// Copyright 2018-2026, University of Colorado Boulder

/**
 * Holds common settings to RadioButtonGroups for the intro-style screens.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import RectangularRadioButtonGroup from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';

class IntroRadioButtonGroup extends RectangularRadioButtonGroup {
  /**
   * @param {Property.<*>} property
   * @param {Array.<*>} array
   * @param {Object} [options]
   */
  constructor( property, array, options ) {
    super( property, array, merge( {
      orientation: 'horizontal',
      spacing: 12,
      touchAreaXDilation: 6,
      touchAreaYDilation: 6,
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 5,
        yMargin: 10
      }
    }, options ) );
  }
}

export default IntroRadioButtonGroup;
