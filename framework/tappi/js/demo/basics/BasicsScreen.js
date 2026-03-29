// Copyright 2019-2026, University of Colorado Boulder

/**
 * @author Jesse Greenberg
 */

import Property from '../../../../axon/js/Property.js';
import Screen from '../../../../joist/js/Screen.js';
import TappiStrings from '../../TappiStrings.js';
import BasicsModel from '../common/model/BasicsModel.js';
import BasicsScreenView from './view/BasicsScreenView.js';

class BasicsScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      backgroundColorProperty: new Property( 'white' ),
      name: TappiStrings.screen.basicsStringProperty
    };

    super(
      () => new BasicsModel( tandem.createTandem( 'model' ) ),
      model => new BasicsScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

export default BasicsScreen;
