// Copyright 2023-2026, University of Colorado Boulder

/**
 * This Property represents the value of a soccer ball within a soccer scene. The value can either be a number or null.
 * However, it is important to note that the value cannot be changed from null to a non-null value through PhET-IO.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 *
 */

import Property from '../../../axon/js/Property.js';
import ReadOnlyProperty, { PropertyOptions, ReadOnlyPropertyState } from '../../../axon/js/ReadOnlyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import StringIO from '../../../tandem/js/types/StringIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import Range from '../../../dot/js/Range.js';

type SelfOptions = {
  range: Range; // The range of values that the soccer ball can take when it is not null.
};

// client cannot specify superclass options that are controlled by BooleanProperty
export type SoccerBallValuePropertyOptions = SelfOptions & StrictOmit<PropertyOptions<number | null>, 'isValidValue' | 'valueType' | 'phetioValueType'>;

export default class SoccerBallValueProperty extends Property<number | null> {

  private readonly range: Range;

  /**
   * @param value - The soccer ball's location on the number line. If the soccer ball has not yet landed, 'value' is null.
   * @param providedOptions
   */
  public constructor( value: number | null, providedOptions: SoccerBallValuePropertyOptions ) {

    // Fill in superclass options that are controlled by BooleanProperty.
    const options = optionize<SoccerBallValuePropertyOptions, SelfOptions, PropertyOptions<number | null>>()( {
      phetioValueType: NullableIO( NumberIO ),
      phetioOuterType: () => SoccerBallValueProperty.SoccerBallValuePropertyIO,
      isDisposable: false
    }, providedOptions );

    super( value, options );
    this.range = options.range;
  }

  // See SoccerBallValuePropertyIO.documentation
  public validateSoccerBallValue( oldValue: number | null, newValue: number | null ): string | null {
    if ( oldValue === null && newValue !== null ) {
      return 'Cannot change a null value to a non-null value.';
    }
    else if ( oldValue !== null && newValue === null ) {
      return 'Cannot change a non-null value to a null value.';
    }
    else if ( oldValue !== null && newValue !== null ) {
      if ( newValue < this.range.min || newValue > this.range.max ) {
        return `The value must satisfy the range [${this.range.min}, ${this.range.max}].`;
      }
      else if ( !Number.isInteger( newValue ) ) {
        return 'The value must be an integer.';
      }
      else {
        return null; // The value is valid, so we return null.
      }
    }
    else {
      return null; // Both values are null, which is valid.
    }
  }

  public static SoccerBallValuePropertyIO = new IOType<ReadOnlyProperty<number | null>, ReadOnlyPropertyState<number | null>>( 'SoccerBallValuePropertyIO', {
    documentation: 'Soccer ball values cannot be changed from null to non-null or vice versa by PhET-iO clients. This ' +
                   'IOType adds validation and assertions for those cases.',
    supertype: ReadOnlyProperty.PropertyIO( NullableIO( NumberIO ) ),
    parameterTypes: [ NullableIO( NumberIO ) ],
    methods: {
      getValidationError: {
        returnType: NullableIO( StringIO ),
        parameterTypes: [ NullableIO( NumberIO ) ],
        implementation: function( this: SoccerBallValueProperty, value: number | null ) {

          return this.validateSoccerBallValue( this.value, value ) ||

                 // Check with the supertype to see if it is valid, this will check if it is range, etc.
                 ReadOnlyProperty.PropertyIO( NullableIO( NumberIO ) ).methods!.getValidationError.implementation.call( this, value );
        },
        documentation: 'Checks to see if a proposed value is valid. Returns the first validation error, or null if the value is valid.'
      },

      setValue: {
        returnType: VoidIO,
        parameterTypes: [ NullableIO( NumberIO ) ],
        implementation: function( this: SoccerBallValueProperty, value: number | null ) {

          const validationError = this.validateSoccerBallValue( this.value, value );
          if ( validationError ) {
            throw new Error( validationError );
          }

          this.set( value );
        },
        documentation: 'Sets the value of the Property. If the value differs from the previous value, listeners are ' +
                       'notified with the new value.',
        invocableForReadOnlyElements: false
      }
    }
  } );
}
