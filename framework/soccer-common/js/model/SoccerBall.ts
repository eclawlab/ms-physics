// Copyright 2023-2026, University of Colorado Boulder

/**
 * The `SoccerBall` class represents a data point within the simulation. Upon instantiation, the `SoccerBall` object has
 * a null value. However, once the `SoccerBall` object lands after a kick, it assumes an integer value.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import EnabledProperty from '../../../axon/js/EnabledProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Property from '../../../axon/js/Property.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import Animation from '../../../twixt/js/Animation.js';
import SoccerCommonConstants from '../SoccerCommonConstants.js';
import Kicker from './Kicker.js';
import { SoccerBallPhase } from './SoccerBallPhase.js';
import SoccerBallValueProperty from './SoccerBallValueProperty.js';
import Range from '../../../dot/js/Range.js';

// Global counter for debugging
let count = 0;

export default class SoccerBall extends PhetioObject {

  /**
   * Continuous value for the drag listener. When dragging, the object snaps to each tick mark. This is an implementation
   * detail for the drag listener that is only used for deltas, and the absolute value does not matter.
   * Therefore, it should not be reset (because resetting it would take the model through an incorrect transient state).
   *
   * In addition, both of these dragging Properties do not need to be instrumented for PhET-iO, because they are only tracking active dragging
   * information as a drag is being performed by the user. This information is not necessary for setting state in the sim.
   */
  public readonly dragPositionProperty: Vector2Property;
  public readonly isDraggingProperty = new BooleanProperty( false );

  // Continuous position during animation. After landing, it's discrete.
  public readonly positionProperty: Vector2Property;
  public readonly velocityProperty: Vector2Property;
  public readonly soccerBallPhaseProperty: Property<SoccerBallPhase>;

  // Where the object is animating to, or null if not yet animating
  public targetXProperty: Property<number | null>;

  // The ball's position on the number line. The value is null until the ball has landed on the field.
  public valueProperty: Property<number | null>;

  public readonly dragStartedEmitter: TEmitter = new Emitter();
  public readonly resetEmitter: TEmitter = new Emitter();

  public animation: Animation | null = null;
  public kickerProperty: Property<Kicker | null>;

  public readonly enabledProperty: Property<boolean>;

  // Global index for debugging
  public readonly index = count++;

  public readonly soccerBallLandedEmitter = new Emitter<[ SoccerBall ]>( {
    parameters: [ { valueType: SoccerBall } ]
  } );

  // When the soccer ball has moved and wants to emit a sound, use this emitter, so that the context can decide whether
  // to play a mean, median or value sound, depending on the context.
  public readonly toneEmitter = new Emitter<[ number ]>( {
    parameters: [ { valueType: 'number' } ]
  } );

  public constructor( public readonly isFirstSoccerBall: boolean, valueRange: Range, tandem: Tandem ) {

    super( {
      phetioState: false,
      phetioFeatured: true,
      isDisposable: false,
      tandem: tandem
    } );

    this.positionProperty = new Vector2Property( new Vector2( 0, SoccerCommonConstants.SOCCER_BALL_RADIUS ), {
      tandem: tandem.createTandem( 'positionProperty' ),
      valueComparisonStrategy: 'equalsFunction',
      phetioReadOnly: true
    } );
    this.velocityProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'velocityProperty' ),
      phetioReadOnly: true
    } );
    this.soccerBallPhaseProperty = new EnumerationProperty( isFirstSoccerBall ? SoccerBallPhase.READY : SoccerBallPhase.INACTIVE, {
      tandem: tandem.createTandem( 'soccerBallPhaseProperty' ),
      phetioReadOnly: true
    } );
    this.dragPositionProperty = new Vector2Property( this.positionProperty.value.copy() );
    this.valueProperty = new SoccerBallValueProperty( null, {
      range: valueRange,
      tandem: tandem.createTandem( 'valueProperty' ),
      phetioDocumentation: 'The value of the soccer ball on the number line, or null if the soccer ball has not yet landed. ' +
                           'This is the value that is used to calculate the statistical measures. ' +
                           'The value cannot be changed from null to non-null (or vice versa) directly. Instead use the ' +
                           'scene model setDataPoints function to change the entire data set. Please see the Examples document.',
      phetioFeatured: true,

      // The listeners must be processed in the order specified or "sort data" with cards while soccer balls are still landing
      // will cause the data to be sorted incorrectly.
      hasListenerOrderDependencies: true
    } );

    // For PhET-iO, allow clients to shut off interactivity via this Property.
    this.enabledProperty = new EnabledProperty( true, {
      tandem: tandem.createTandem( EnabledProperty.TANDEM_NAME ),
      phetioFeatured: true
    } );

    // During normal sim run the value will always be set before the phaseProperty is set. We want to make sure this is
    // respected while setting state as well, because all the listeners are driven by the phase emitters.
    this.soccerBallPhaseProperty.addPhetioStateDependencies( [ this.valueProperty ] );

    this.targetXProperty = new Property<number | null>( null, {
      tandem: tandem.createTandem( 'targetXProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true
    } );

    this.kickerProperty = new Property<Kicker | null>( null, {
      phetioFeatured: false,
      phetioReadOnly: true,
      phetioValueType: NullableIO( ReferenceIO( Kicker.KickerIO ) ),
      tandem: tandem.createTandem( 'kickerProperty' )
    } );

    this.soccerBallPhaseProperty.link( soccerBallPhase => {
      if ( soccerBallPhase === SoccerBallPhase.INACTIVE ) {
        this.valueProperty.value = null;
        this.positionProperty.reset();
      }
    } );
  }

  // this doesn't change the soccerBallPhaseProperty of the soccerBall - that is done by the ball animationEnded callback
  public clearAnimation(): void {
    if ( this.animation ) {
      this.animation.stop();
      this.animation = null;
    }
  }

  public step( dt: number ): void {
    if ( this.soccerBallPhaseProperty.value === SoccerBallPhase.FLYING ) {

      assert && assert( this.targetXProperty.value !== null, 'targetXProperty.value should be non-null when animating' );

      const xCoordinates = rk4( this.positionProperty.value.x, this.velocityProperty.value.x, 0, dt );
      const yCoordinates = rk4( this.positionProperty.value.y, this.velocityProperty.value.y, SoccerCommonConstants.GRAVITY, dt );

      let x = xCoordinates[ 0 ];
      let y = yCoordinates[ 0 ];

      this.velocityProperty.value.x = xCoordinates[ 1 ];
      this.velocityProperty.value.y = yCoordinates[ 1 ];

      let landed = false;

      if ( y <= SoccerCommonConstants.SOCCER_BALL_RADIUS ) {
        x = this.targetXProperty.value!;
        y = SoccerCommonConstants.SOCCER_BALL_RADIUS;
        landed = true;
        this.valueProperty.value = this.targetXProperty.value!;
      }

      this.positionProperty.value = new Vector2( x, y );

      if ( landed ) {
        this.soccerBallLandedEmitter.emit( this );
        this.toneEmitter.emit( x );
      }
    }
  }

  /**
   * Restore the initial conditions.
   *
   * NOTE: Do not reset the dragPositionProperty, since it is an implementation detail for the drag listener. Resetting
   * would take listeners through an incorrect transient state.
   */
  public reset(): void {
    this.clearAnimation();
    this.positionProperty.reset();
    this.velocityProperty.reset();
    this.soccerBallPhaseProperty.reset();
    this.valueProperty.reset();
    this.isDraggingProperty.reset();

    this.targetXProperty.value = null;
    this.kickerProperty.reset();

    this.resetEmitter.emit();
  }
}

/**
 * 4th order Runge Kutte integration under constant acceleration.  We use this more sophisticated algorithm instead of
 * x=x0+v0t+1/2at^2 because that looked too much like the ball ended a little to the left of the target value,
 * and jumped slightly to the side.
 * See https://en.wikipedia.org/wiki/Runge%E2%80%93Kutta_methods
 */
const rk4 = ( x: number, v: number, a: number, dt: number ) => {
  const v2 = v + a * dt / 2;
  const v4 = v + a * dt;

  const xResult = x + dt * ( v + 4 * v2 + v4 ) / 6;
  const vResult = v + a * dt;

  return [ xResult, vResult ];
};
