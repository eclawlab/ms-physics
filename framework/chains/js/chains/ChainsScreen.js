// Copyright 2015-2026, University of Colorado Boulder

/**
 * The 'Chains' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Screen from '../../../joist/js/Screen.js';
import ChainsStrings from '../ChainsStrings.js';
import ChainsView from './view/ChainsView.js';

class ChainsScreen extends Screen {
  constructor( tandem ) {
    super(
      () => {return {};},
      model => new ChainsView( model, tandem.createTandem( 'view' ) ), {
        tandem: tandem,
        name: ChainsStrings.screen.chainsStringProperty
      }
    );
  }
}

export default ChainsScreen;
