// Copyright 2023-2026, University of Colorado Boulder

/**
 * Kicker represents the model of a person with images showing different phases of them kicking a ball.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Property from '../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import { KickerPhase } from './KickerPhase.js';
import Pose from './Pose.js';

export default class Kicker extends PhetioObject {

  // Which portion of the kicking animation the person is currently in. Determines which pose to set.
  public readonly kickerPhaseProperty: Property<KickerPhase>;

  // Which pose the kicker is currently showing. Determines which image to display.
  public readonly poseProperty: TReadOnlyProperty<Pose>;

  // The timestamp for when the kicker's poseProperty was last set to POISED_TO_KICK
  public readonly timestampWhenPoisedBeganProperty: Property<number | null>;

  // Used to determine the artwork for rendering the KickerNode
  public readonly initialPlaceInLine: number;

  public constructor( placeInLine: number, tandem: Tandem ) {

    super( {
      phetioState: false,
      isDisposable: false,
      phetioType: Kicker.KickerIO,
      tandem: tandem
    } );

    this.kickerPhaseProperty = new EnumerationProperty( placeInLine === 0 ? KickerPhase.READY : KickerPhase.INACTIVE, {
      tandem: tandem.createTandem( 'kickerPhaseProperty' ),
      phetioReadOnly: true
    } );

    this.poseProperty = new DerivedProperty( [ this.kickerPhaseProperty ], kickerPhase => {
      if ( kickerPhase === KickerPhase.POISED ) {
        return Pose.POISED_TO_KICK;
      }
      else if ( kickerPhase === KickerPhase.KICKING ) {
        return Pose.KICKING;
      }
      else {
        return Pose.STANDING;
      }
    } );

    this.timestampWhenPoisedBeganProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'timestampWhenPoisedBeganProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true
    } );
    this.initialPlaceInLine = placeInLine;
  }

  public readyToKick(): void {
    this.timestampWhenPoisedBeganProperty.reset();
    this.kickerPhaseProperty.value = KickerPhase.READY;
  }

  public reset(): void {
    this.kickerPhaseProperty.reset();
    this.timestampWhenPoisedBeganProperty.reset();
  }

  public static KickerIO = new IOType<IntentionalAny, IntentionalAny>( 'KickerIO', {
    valueType: Kicker
  } );
}
