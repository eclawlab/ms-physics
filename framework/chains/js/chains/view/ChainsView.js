// Copyright 2015-2026, University of Colorado Boulder

/**
 * View for the 'Chains' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../../axon/js/PatternStringProperty.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SceneryPhetFluent from '../../../../scenery-phet/js/SceneryPhetFluent.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ChainsFluent from '../../ChainsFluent.js';
import ChainsStrings from '../../ChainsStrings.js';

// constants
const FONT = new PhetFont( 26 );

class ChainsView extends ScreenView {

  /**
   * @param {*} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    const sizeStringProperty = new DerivedProperty(
      [ ChainsStrings.patternStringStringProperty, ChainsStrings.sizeStringProperty, SceneryPhetFluent.units_nmStringProperty ],
      ( pattern, sizeString, unitsString ) => StringUtils.format( pattern, sizeString, 8, unitsString )
    );

    console.log( ChainsFluent.a11y.nested.constantStringProperty );
    console.log( ChainsFluent.a11y.nested.fluentReferenceStringProperty );
    console.log( ChainsFluent.a11y.nested.fluentVariable.format( { variable: 'OUTSIDE' } ) );
    console.log( ChainsFluent.a11y.nested.cascade.format( { activityLevel: 'calm' } ) );

    this.addChild( new VBox( {
      align: 'left',
      spacing: 25,
      children: [
        new Text( ChainsStrings.plainStringStringProperty, {
          font: FONT,
          fill: 'green',
          tandem: tandem.createTandem( 'plainStringText' )
        } ),
        new RichText( ChainsStrings.multilineStringStringProperty, {
          font: FONT,
          align: 'left',
          tandem: tandem.createTandem( 'multiLineStringText' )
        } ),
        new RichText( ChainsStrings.htmlStringStringProperty, {
          font: FONT,
          tandem: tandem.createTandem( 'htmlStringText' )
        } ),
        new Text( sizeStringProperty, {
          font: FONT,
          tandem: tandem.createTandem( 'patternStringText' )
        } ),
        new Text(
          new PatternStringProperty(
            ChainsStrings.namedPlaceholdersStringStringProperty,
            {
              name: 'Alice',
              speed: '100'
            }
          ),
          {
            font: FONT,
            fill: '#99FFFF',
            tandem: tandem.createTandem( 'namedPlaceholdersStringText' )
          }
        ),
        new Text( ChainsStrings.nestedLevel1.nestedLevel2.messageStringProperty, {
          font: FONT,
          tandem: tandem.createTandem( 'nestedStringText' )
        } ),
        new Text( ChainsFluent.a11y.nested.constantStringProperty, { font: FONT } ),
        new Text( ChainsFluent.a11y.nested.fluentReferenceStringProperty, { font: FONT } ),
        new Text( ChainsFluent.a11y.nested.fluentVariable.format( { variable: 'OUTSIDE' } ), { font: FONT } ),
        new Text( ChainsFluent.a11y.nested.cascade.format( { activityLevel: 'calm' } ), { font: FONT } )
      ],
      center: this.layoutBounds.center
    } ) );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }
}

export default ChainsView;
