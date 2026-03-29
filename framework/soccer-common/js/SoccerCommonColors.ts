// Copyright 2023-2026, University of Colorado Boulder

/**
 * Defines the colors for this repo.
 *
 * All simulations should have a Colors.js file, see https://github.com/phetsims/scenery-phet/issues/642.
 *
 * For static colors that are used in more than one place, add them here.
 *
 * For dynamic colors that can be controlled via colorProfileProperty.js, add instances of ProfileColorProperty here,
 * each of which is required to have a default color. Note that dynamic colors can be edited by running the sim from
 * phetmarks using the "Color Edit" mode.
 *
 * @author Marla Schulz
 */

import ProfileColorProperty from '../../scenery/js/util/ProfileColorProperty.js';
import soccerCommon from './soccerCommon.js';

const SoccerCommonColors = {

  dragIndicatorColorProperty: new ProfileColorProperty( soccerCommon, 'dragIndicatorColor', {
    default: '#6bc6ff'
  } ),

  arrowStrokeProperty: new ProfileColorProperty( soccerCommon, 'arrowStroke', {
    default: 'black'
  } ),

  // sky gradient, sampled from a screenshot
  skyGradientTopColorProperty: new ProfileColorProperty( soccerCommon, 'skyGradientTopColor', { default: '#365b9b' } ),
  skyGradientMiddleColorProperty: new ProfileColorProperty( soccerCommon, 'skyGradientMiddleColor', { default: '#81b5ea' } ),
  skyGradientBottomColorProperty: new ProfileColorProperty( soccerCommon, 'skyGradientBottomColor', { default: '#c9d9ef' } ),

  // the ground
  groundColorProperty: new ProfileColorProperty( soccerCommon, 'groundColor', { default: '#00893E' } ),

  kickButtonFillColorProperty: new ProfileColorProperty( soccerCommon, 'kickButtonFillColor', {
    default: '#dae6f7'
  } )
};

export default SoccerCommonColors;
