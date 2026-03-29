// Copyright 2024-2026, University of Colorado Boulder

/**
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import DescriptionDemoConstants from '../../common/DescriptionDemoConstants.js';
import DescriptionDemoModel from '../model/DescriptionDemoModel.js';

type SelfOptions = {
 // add options that are specific to DescriptionDemoScreenView here
};

type DescriptionDemoScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class DescriptionDemoScreenView extends ScreenView {

  public constructor( model: DescriptionDemoModel, providedOptions: DescriptionDemoScreenViewOptions ) {

    const options = optionize<DescriptionDemoScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
    }, providedOptions );

    super( options );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - DescriptionDemoConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - DescriptionDemoConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   */
  public reset(): void {
    // add code here
  }

  /**
   * Steps the view.
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    // add code here
  }
}
