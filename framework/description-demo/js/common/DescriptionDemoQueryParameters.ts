// Copyright 2024-2026, University of Colorado Boulder

/**
 * Defines query parameters that are specific to this simulation.
 * Run with ?log to print query parameters and their values to the browser console at startup.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';

const DescriptionDemoQueryParameters = QueryStringMachine.getAll( {
  // This is where you add query parameters for your simulation.
} );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
phet.log && phet.log( `DescriptionDemoQueryParameters: ${JSON.stringify( DescriptionDemoQueryParameters, null, 2 )}` );

export default DescriptionDemoQueryParameters;
