// Copyright 2024-2026, University of Colorado Boulder

/**
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize from '../../../phet-core/js/optionize.js';
import DescriptionDemoColors from '../common/DescriptionDemoColors.js';
import DescriptionDemoStrings from '../DescriptionDemoStrings.js';
import DescriptionDemoModel from './model/DescriptionDemoModel.js';
import DescriptionDemoScreenView from './view/DescriptionDemoScreenView.js';

type SelfOptions = {
  // Add properties here
};

type DescriptionDemoScreenOptions = SelfOptions & ScreenOptions;

export default class DescriptionDemoScreen extends Screen<DescriptionDemoModel, DescriptionDemoScreenView> {

  public constructor( providedOptions: DescriptionDemoScreenOptions ) {

    const options = optionize<DescriptionDemoScreenOptions, SelfOptions, ScreenOptions>()( {
      name: DescriptionDemoStrings.screen.nameStringProperty,

      backgroundColorProperty: DescriptionDemoColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new DescriptionDemoModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new DescriptionDemoScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
