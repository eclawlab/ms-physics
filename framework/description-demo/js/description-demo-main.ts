// Copyright 2024, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import DescriptionDemoScreen from './description-demo/DescriptionDemoScreen.js';
import DescriptionDemoStrings from './DescriptionDemoStrings.js';
import './common/DescriptionDemoQueryParameters.js';

// Launch the sim. Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded. See https://github.com/phetsims/coulombs-law/issues/70#issuecomment-429037461
simLauncher.launch( () => {

  const titleStringProperty = DescriptionDemoStrings[ 'description-demo' ].titleStringProperty;

  const screens = [
    new DescriptionDemoScreen( { tandem: Tandem.ROOT.createTandem( 'descriptionDemoScreen' ) } )
  ];

  const options: SimOptions = {
    credits: {
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      contributors: '',
      qualityAssurance: '',
      graphicArts: '',
      soundDesign: '',
      thanks: ''
    }
  };

  const sim = new Sim( titleStringProperty, screens, options );
  sim.start();
} );