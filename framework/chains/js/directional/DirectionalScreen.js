// Copyright 2025-2026, University of Colorado Boulder

/**
 * The 'Directional' screen.
 *
 * @author Agustín Vallejo
 */

import Screen from '../../../joist/js/Screen.js';
import ChainsStrings from '../ChainsStrings.js';
import DirectionalView from './view/DirectionalView.js';

class DirectionalScreen extends Screen {
  constructor( tandem ) {
    super(
      () => {return {};},
      model => new DirectionalView( model, tandem.createTandem( 'view' ) ), {
        tandem: tandem,
        name: ChainsStrings.screen.directionalStringProperty
      }
    );
  }
}

export default DirectionalScreen;
