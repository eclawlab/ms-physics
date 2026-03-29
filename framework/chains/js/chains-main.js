// Copyright 2015-2025, University of Colorado Boulder

/**
 * Main entry point for the 'Chains' application.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ChainsScreen from './chains/ChainsScreen.js';
import ChainsStrings from './ChainsStrings.js';
import DirectionalScreen from './directional/DirectionalScreen.js';

const chainsTitleStringProperty = ChainsStrings.chains.titleStringProperty;

const simOptions = {
  credits: {
    softwareDevelopment: 'PhET Interactive Simulations'
  }
};

simLauncher.launch( () => {
  const sim = new Sim( chainsTitleStringProperty, [
    new ChainsScreen( Tandem.ROOT.createTandem( 'chainsScreen' ) ),
    new DirectionalScreen( Tandem.ROOT.createTandem( 'directionalScreen' ) )
  ], simOptions );
    sim.start();
} );