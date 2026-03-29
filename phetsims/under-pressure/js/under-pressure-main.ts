// Copyright 2013-2025, University of Colorado Boulder

/**
 * Main file for the Under Pressure simulation.
 * @author Sam Reid (PhET Interactive Simulations)
 */

import UnderPressureScreen from '../../fluid-pressure-and-flow/js/under-pressure/UnderPressureScreen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import UnderPressureStrings from './UnderPressureStrings.js';

const underPressureTitleStringProperty = UnderPressureStrings[ 'under-pressure' ].titleStringProperty;

simLauncher.launch( () => {
  const sim = new Sim( underPressureTitleStringProperty, [ new UnderPressureScreen() ], {
    credits: {
      leadDesign: 'Sam Reid',
      softwareDevelopment: 'John Blanco, Aadish Gupta, Sam Reid',
      team: 'Bryce Gruneich, Trish Loeblein, Ariel Paul, Kathy Perkins, Rachel Pepper, Noah Podolefsky',
      qualityAssurance: 'Steele Dalton, Amanda Davis, Bryce Griebenow, Elise Morgan, Ben Roberts',
      thanks: 'Thanks to Mobile Learner Labs and Actual Concepts for working with the PhET development team to ' +
              'convert this simulation to HTML5.'
    }
  } );
  sim.start();
} );