// Copyright 2019-2026, University of Colorado Boulder

/**
 * Mystery screen for Density
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import DensityBuoyancyCommonColors from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonColors.js';
import DensityBuoyancyCommonKeyboardHelpNode from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyCommonKeyboardHelpNode.js';
import DensityBuoyancyScreenView from '../../../density-buoyancy-common/js/common/view/DensityBuoyancyScreenView.js';
import DensityMysteryModel from '../../../density-buoyancy-common/js/density/model/DensityMysteryModel.js';
import DensityMysteryScreenView from '../../../density-buoyancy-common/js/density/view/DensityMysteryScreenView.js';
import getDensityMysteryIcon from '../../../density-buoyancy-common/js/density/view/getDensityMysteryIcon.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Tandem from '../../../tandem/js/Tandem.js';
import mystery_screen_icon_png from '../../mipmaps/mystery_screen_icon_png.js';
import DensityStrings from '../DensityStrings.js';

export default class MysteryScreen extends Screen<DensityMysteryModel, DensityMysteryScreenView> {
  public constructor( tandem: Tandem ) {
    const icon = DensityBuoyancyScreenView.getThreeIcon( mystery_screen_icon_png, () => getDensityMysteryIcon() );

    super(
      () => new DensityMysteryModel( {
        tandem: tandem.createTandem( 'model' )
      } ),
      model => new DensityMysteryScreenView( model, {
        tandem: tandem.createTandem( 'view' )
      } ),
      {
        name: DensityStrings.screen.mysteryStringProperty,
        backgroundColorProperty: DensityBuoyancyCommonColors.skyBottomProperty,
        homeScreenIcon: new ScreenIcon( icon, {
          maxIconWidthProportion: 1,
          maxIconHeightProportion: 1
        } ),
        tandem: tandem,
        createKeyboardHelpNode: () => new DensityBuoyancyCommonKeyboardHelpNode( false, false )
      }
    );
  }
}
