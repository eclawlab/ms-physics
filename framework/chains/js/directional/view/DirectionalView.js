// Copyright 2025-2026, University of Colorado Boulder

/**
 * View for the 'Chains' screen.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import MathSymbols from '../../../../scenery-phet/js/MathSymbols.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ChainsStrings from '../../ChainsStrings.js';

// constants
const FONT = new PhetFont( 26 );

class DirectionalView extends ScreenView {

  /**
   * @param {*} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {

    super( {
      tandem: tandem
    } );

    const textOptions = {
      font: FONT,
      maxWidth: 600
    };

    const numberProperty = new NumberProperty( -1 );

    const sign = number => number < 0 ? MathSymbols.MINUS : MathSymbols.PLUS;

    const valuesAndSignPatterns = [
      new Property( 'Numerical values:' ),

      // Simple value pattern (-2 or 2)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.valuePatternStringProperty ], ( number, pattern ) =>
        '\u2067' + StringUtils.fillIn( pattern, { value: number } ) + '\u2069' ),

      // Sign value pattern (-2 or +2)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.valueSignPatternStringProperty ], ( number, pattern ) =>
        StringUtils.fillIn( pattern, { value: Math.abs( number ), sign: sign( number ) } ) )
    ];

    const unitsPatterns = [
      new Property( 'Units:' ),

      // Value with units pattern (-2 m or 2 m)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.valueUnitsPatternStringProperty, ChainsStrings.directional.unitsStringProperty ], ( number, pattern, units ) =>
        StringUtils.fillIn( pattern, { value: number, units: units } ) ),

      // Value with degrees pattern (-2 °C or 2 °C)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.valueUnitsPatternStringProperty, ChainsStrings.directional.celciusStringProperty ], ( number, pattern, celcius ) =>
        StringUtils.fillIn( pattern, { value: number, units: celcius } ) ),

      // Sign value with units pattern (-2 m or +2 m)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.valueSignUnitsPatternStringProperty, ChainsStrings.directional.unitsStringProperty ], ( number, pattern, units ) =>
        StringUtils.fillIn( pattern, { value: Math.abs( number ), sign: sign( number ), units: units } ) )
    ];

    const currencyPatterns = [
      new Property( 'Currency:' ),

      // Currency patterns (-2$ or +2$)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.signValueCurrencyPatternStringProperty, ChainsStrings.directional.currencyStringProperty ], ( number, pattern, currency ) =>
        StringUtils.fillIn( pattern, { value: Math.abs( number ), sign: sign( number ), currency: currency } ) ),

      // Currency patterns (-$2 or +$2)
      new DerivedProperty( [ numberProperty, ChainsStrings.directional.signCurrencyValuePatternStringProperty, ChainsStrings.directional.currencyStringProperty ], ( number, pattern, currency ) =>
        StringUtils.fillIn( pattern, { value: Math.abs( number ), sign: sign( number ), currency: currency } ) )
    ];

    const complexPatterns = [
      new Property( 'Complex:' ),

      // Equation pattern ( word = -$2 )
      new DerivedProperty( [
        numberProperty,
        ChainsStrings.directional.wordEqualsSignCurrencyValuePatternStringProperty,
        ChainsStrings.directional.wordStringProperty,
        ChainsStrings.directional.currencyStringProperty
      ], ( number, pattern, word, currency ) =>
        StringUtils.fillIn( pattern, { value: Math.abs( number ), sign: sign( number ), word: word, currency: currency } )
      ),

      // Parentheses and colon structure ( word (units): value )
      new DerivedProperty( [
          numberProperty,
          ChainsStrings.directional.wordParenthesesColonValuePatternStringProperty,
          ChainsStrings.directional.wordStringProperty,
          ChainsStrings.directional.unitsStringProperty
        ], ( number, pattern, word, units ) =>
          StringUtils.fillIn( pattern, { value: number, word: word, units: units } )
      ),

      // Sub and superscripts patterns
      new DerivedProperty( [
          numberProperty,
          ChainsStrings.directional.subscriptsAndSuperscriptsPatternStringProperty,
          ChainsStrings.directional.unitsStringProperty
        ], ( number, pattern, units ) =>
          StringUtils.fillIn( pattern, { value: number, units: units } )
      )
    ];

    // The following are the possible patterns considered for testing LTR translations
    const filledPatternStringProperties = [
      valuesAndSignPatterns,
      unitsPatterns,
      currencyPatterns,
      complexPatterns
    ];

    this.addChild( new VBox( {
      align: 'left',
      spacing: 25,
      children: [
        new NumberControl( 'value', numberProperty, new Range( -5, 5 ), { tandem: Tandem.OPT_OUT } ),
        ..._.map( filledPatternStringProperties, patternCollection => new HBox( {
          spacing: 30,
          children: _.map( patternCollection, patternProperty => new RichText( patternProperty, textOptions ) )
        } ) )
      ],
      center: this.layoutBounds.center
    } ) );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        numberProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }
}

export default DirectionalView;
