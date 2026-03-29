// Copyright 2018-2026, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import WilderScreen from './wilder/WilderScreen.js';
import WilderStrings from './WilderStrings.js';

const wilderTitleStringProperty = WilderStrings.wilder.titleStringProperty;

const simOptions: SimOptions = {
  credits: {
    leadDesign: '',
    softwareDevelopment: '',
    team: '',
    qualityAssurance: '',
    graphicArts: '',
    thanks: ''
  }
};

simLauncher.launch( () => {
  const sim = new Sim( wilderTitleStringProperty, [ new WilderScreen( {
    tandem: Tandem.ROOT.createTandem( 'wilderScreen' )
  } ) ], simOptions );
  sim.start();
} );