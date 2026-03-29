// Copyright 2018-2026, University of Colorado Boulder

/**
 * Runs all sims to get runtime information. Return the data object based on the sims run in main.
 *
 * Currently the data structure returned is an object where keys are the sims, and the value is an object where the
 * key is the component name i.e. `{{repoName}}/{{componentName}}, and the value is a list of dataURL images.
 *
 * It also collects registered Hotkeys in every repository described by scenery/HotkeyData.
 *
 * This file relies heavily on phet-core's `InstanceRegistry.js` to communicate with sims during runtime. To get data
 * and pictures about a component in the sim, that component will need to be registered, see ComboBox.js as an example. . .
 * Something like: `
 * // support for binder documentation, stripped out in builds and only runs when ?binder is specified
 * assert && phet.chipper.queryParameters.binder && InstanceRegistry.registerDataURL( 'sun', 'ComboBox', this );
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

/* global window phet */

// modules
const _ = require( 'lodash' );
const assert = require( 'assert' );
const fs = require( 'fs' );
const puppeteer = require( 'puppeteer' );
const withServer = require( '../../perennial/js/common/withServer' ).default;

const DEBUG = false;

// Helper function to get the sim list from perennial
const getSims = function() {
  return fs.readFileSync( `${__dirname}/../../perennial/data/active-sims` ).toString().trim().split( '\n' ).map( sim => sim.trim() );
};

module.exports = async commandLineSims => {

  return withServer( async port => {

    const baseURL = `http://localhost:${port}/`;
    const browser = await puppeteer.launch();

    const dataByComponent = {};
    const dataBySim = {};
    const hotkeysBySim = {};

    // override to generate based on only sims provided
    const sims = commandLineSims ? commandLineSims.split( ',' ) : getSims();
    console.log( 'sims to load:', sims.join( ', ' ) );

    for ( const sim of sims ) {

      const page = await browser.newPage();

      // await forever here for debugging
      console.log( port );

      await page.exposeFunction( 'updateComponentData', ( simName, dataMap, hotkeys ) => {
        assert( !dataBySim[ sim ], 'sim already exists?' );

        dataBySim[ sim ] = {};
        const simObject = dataBySim[ sim ];
        simObject.name = sim;
        simObject.components = [];

        assert( !hotkeysBySim[ sim ], 'sim already exists?' );
        hotkeysBySim[ sim ] = hotkeys;

        for ( const component in dataMap ) {
          if ( dataMap.hasOwnProperty( component ) ) {


            if ( !dataByComponent[ component ] ) {
              dataByComponent[ component ] = {};
            }

            dataByComponent[ component ][ simName ] = dataMap[ component ];


            // fill in simulation based data
            simObject.components.push( component );
            simObject.components = _.uniq( simObject.components );
          }
        }
      } );

      // log to our server from the browser
      page.on( 'console', msg => {
        if ( msg.type() === 'error' ) {
          console.error( `${sim} PAGE ERROR:`, msg.text() );
        }
        else {
          DEBUG && console.log( `${sim} PAGE LOG:`, msg.text() );
        }
      } );

      page.on( 'error', error => {
        console.error( 'PUPPETEER ERROR:', error );
      } );
      page.on( 'pageerror', error => {
        console.error( 'PAGE ERROR:', error );
      } );

      // navigate to the sim page
      const url = `${baseURL}${sim}/${sim}_en.html?brand=phet&ea&postMessageOnLoad&binder`;
      console.log( `\nloading: ${sim}` );
      console.log( url );
      await page.goto( url );

      // Add a listener such that when the sim posts a message saying that it has loaded,
      // get the InstanceRegistry's mapping of components for this sim
      await page.evaluate( sim => {
        return new Promise( ( resolve, reject ) => {

          window.addEventListener( 'message', event => {
            if ( event.data ) {
              try {
                const messageData = JSON.parse( event.data );
                if ( messageData.type === 'load' ) {
                  console.log( 'loaded', sim );

                  if ( phet.phetCore.InstanceRegistry ) {
                    window.updateComponentData( sim, phet.phetCore.InstanceRegistry.componentMap, phet.phetCore.InstanceRegistry.hotkeys );
                    resolve();
                  }
                  else {
                    console.error( 'InstanceRegistry not defined. This normally means no components are in this sim.' );
                    resolve( undefined );
                  }
                }
              }
              catch( e ) {

                // message isn't what we wanted it to be, so ignore it
                console.log( 'CAUGHT ERROR:', e.message );
              }
            }
            else {
              console.log( 'no data on message event' );
            }
          } );

          setTimeout( () => {
            console.error( `load timeout for ${sim}, moving on` );
            resolve( undefined );
          }, 20000 );
        } );
      }, sim );
      await page.close();
    }

    await browser.close();

    const outputObject = {
      components: dataByComponent,
      sims: dataBySim,
      hotkeys: hotkeysBySim
    };

    // TODO: is this the best place for this? see https://github.com/phetsims/binder/issues/28
    // write data to a file so that we don't have to run this so often for quick iteration.
    fs.writeFileSync( `${__dirname}/../binderjson.json`, JSON.stringify( outputObject, null, 2 ) );

    // TODO: is it weird to return an object that is by sim THEN by component. createHTML should probably take a data struture based on component at the top level. see https://github.com/phetsims/binder/issues/28
    return outputObject;
  } );
};