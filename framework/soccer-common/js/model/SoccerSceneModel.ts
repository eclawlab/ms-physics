// Copyright 2023-2026, University of Colorado Boulder

/**
 *
 * SoccerSceneModel represents a dynamic scene in which soccer balls are kicked to various locations on a number line.
 * The model is capable of:
 *
 * - Tracking positions of soccer balls.
 * - Handling one or more kickers to kick soccer balls onto the number line.
 * - Managing properties related to kickable soccer balls and the state of kickers.
 * - Emitting events for significant state changes.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Multilink from '../../../axon/js/Multilink.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import regionAndCultureProperty from '../../../joist/js/i18n/regionAndCultureProperty.js';
import TModel from '../../../joist/js/TModel.js';
import optionize from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import WithRequired from '../../../phet-core/js/types/WithRequired.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import isSettingPhetioStateProperty from '../../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ArrayIO from '../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import NullableIO from '../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import VoidIO from '../../../tandem/js/types/VoidIO.js';
import Animation from '../../../twixt/js/Animation.js';
import Easing from '../../../twixt/js/Easing.js';
import kick_mp3 from '../../sounds/kick_mp3.js';
import KickDistributionStrategy from '../model/KickDistributionStrategy.js';
import SoccerCommonConstants from '../SoccerCommonConstants.js';
import SoccerCommonQueryParameters from '../SoccerCommonQueryParameters.js';
import Kicker from './Kicker.js';
import { KickerPhase } from './KickerPhase.js';
import SoccerBall from './SoccerBall.js';
import { SoccerBallPhase } from './SoccerBallPhase.js';
import isResettingAllProperty from '../../../scenery-phet/js/isResettingAllProperty.js';
import phetioStateSetEmitter from '../../../tandem/js/phetioStateSetEmitter.js';

type SelfOptions = {
  isSingleKickerScene?: boolean;
};

export type SoccerSceneModelOptions = SelfOptions & WithRequired<PhetioObjectOptions, 'tandem'>;

const kickSound = new SoundClip( kick_mp3, { initialOutputLevel: 0.3 } );
soundManager.addSoundGenerator( kickSound );

// constants
const TIME_BETWEEN_RAPID_KICKS = 0.5; // in seconds

export default class SoccerSceneModel<T extends SoccerBall = SoccerBall> extends PhetioObject implements TModel {
  public readonly soccerBalls: T[];

  // The max kickable (highest value in the combo box, if there is one)
  private readonly maxKicksLimit: number;

  // Keep track of the numeric mean value of the non-null soccer balls in the scene
  public readonly meanValueProperty: Property<number | null>;

  // Whether the scene model is currently being displayed on the screen
  public readonly isVisibleProperty: Property<boolean> = new BooleanProperty( true );

  // Signify whenever any object's value changes
  public readonly objectChangedEmitter = new Emitter();

  // Keeps track of simulation time, starting when a sequence of kicks begins. Used to schedule queued kicks.
  public readonly timeProperty: NumberProperty;

  // Emitter that fires when a SoccerBall's value goes from null to non-null
  public readonly objectValueBecameNonNullEmitter: TEmitter;

  // Emitter that fires when a scene is reset
  public readonly resetEmitter: TEmitter = new Emitter();

  // Emitter that fires when a scene's soccer ball data is cleared
  public readonly preClearDataEmitter: TEmitter = new Emitter();

  // The total number of data points (landed soccer balls) that a scene is currently showing
  public readonly numberOfDataPointsProperty: Property<number>;

  // A flag to help determine if a cueing arrow should be shown once all balls have been kicked.
  public readonly soccerBallCountReachedMaxProperty: Property<boolean>;

  // The array of kickers that can kick soccer balls in a scene
  public readonly kickers: Kicker[];

  // Whether the current scene only has a single kicker
  private readonly isSingleKickerScene: boolean;

  // The number of kicks that are currently scheduled to be kicked
  public readonly numberOfQueuedKicksProperty: NumberProperty;

  // The number of idle balls that are not on the field and have not been scheduled to be kicked.
  public readonly numberOfIdleBallsProperty: TReadOnlyProperty<number>;

  // numberOfIdleBallsProperty is dependent on the values of many different Properties including
  // numberOfQueuedKicksProperty and the phaseProperty of every soccer ball. Because of this numberOfIdleBallsProperty
  // can go through inaccurate values if not manually controlled. The `isKickingBall` flag allows us to bypass
  // inaccurate values and rely on numberOfQueuedKicksProperty's value to be updated at the appropriate time.
  private isKickingBall = false;

  // Whether the scene has any kickable soccer balls remaining
  public readonly hasKickableSoccerBallsProperty: TReadOnlyProperty<boolean>;

  // Takes the same values as hasKickableSoccerBallsProperty, but updated synchronously during step() so it never
  // goes through incorrect intermediate values. See https://github.com/phetsims/center-and-variability/issues/77
  public readonly hasKickableSoccerBallsStableProperty: BooleanProperty;

  // The timestamp for when the last soccer ball was kicked
  private readonly timeWhenLastBallWasKickedProperty: NumberProperty;

  // Starting at 0, iterate through the index of the kickers. This updates the Kicker.kickerPhaseProperty to show the current kicker
  protected readonly activeKickIndexProperty: NumberProperty;

  // Called when the value of a ball changed within a stack, so the pointer areas can be updated
  public readonly stackChangedEmitter = new Emitter<[ SoccerBall[] ]>( {

    // We don't really need a runtime type check because TypeScript checks at type checking time
    // But we need a way to describe this parameter
    parameters: [ { isValidValue: element => Array.isArray( element ) } ]
  } );

  // During a reset, do not update data measures for every soccer ball.
  // This is to avoid performance issues when the data is cleared.
  public isClearingData = false;

  // The logical strategy for determining kick distances
  private readonly kickDistributionStrategy: KickDistributionStrategy;

  protected constructor(
    public readonly maxKicksProperty: TReadOnlyProperty<number>,
    maxKicksChoices: number[],
    kickDistributionStrategy: KickDistributionStrategy,
    public readonly physicalRange: Range,
    createSoccerBall: ( isFirstSoccerBall: boolean, tandem: Tandem ) => T,
    providedOptions: SoccerSceneModelOptions
  ) {

    const options = optionize<SoccerSceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isSingleKickerScene: false
    }, providedOptions );

    super( {
      phetioState: false,
      phetioType: SoccerSceneModelIO,
      phetioDocumentation: 'The model for the soccer scene, which includes the soccer balls and the soccer players.',
      isDisposable: false,
      tandem: options.tandem
    } );

    this.kickDistributionStrategy = kickDistributionStrategy;

    const updateDataMeasures = () => this.updateDataMeasures();

    this.maxKicksLimit = Math.max( ...maxKicksChoices );

    this.soccerBallCountReachedMaxProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'soccerBallCountReachedMaxProperty' ),
      phetioReadOnly: true
    } );

    this.isSingleKickerScene = options.isSingleKickerScene;

    this.soccerBalls = _.range( 0, this.maxKicksLimit ).map( index => {

      const soccerBall = createSoccerBall(
        index === 0,
        options.tandem.createTandem( 'soccerBalls' ).createTandem1Indexed( 'soccerBall', index )
      );

      soccerBall.enabledProperty.link( enabled => {
        if ( !enabled && soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED ) {
          assert && assert( soccerBall.valueProperty.value !== null, 'value should not be null if ball is stacked.' );
          this.stackChangedEmitter.emit( this.getStackAtValue( soccerBall.valueProperty.value! ) );
        }
      } );

      // When the soccer ball drag position changes, constrain it to the physical range and move it to the top, if necessary
      soccerBall.dragPositionProperty.lazyLink( ( dragPosition: Vector2 ) => {
        soccerBall.valueProperty.value = Utils.roundSymmetric( this.physicalRange.constrainValue( dragPosition.x ) );
      } );

      soccerBall.soccerBallLandedEmitter.addListener( soccerBall => {

        // This changes the soccer ball phase.
        this.animateSoccerBallToTopOfStack( soccerBall, soccerBall.valueProperty.value! );

        if ( this.isSingleKickerScene ) {

          // In a single kicker scene, the kicker can put their foot down once all flying soccer balls have landed.
          // Count the number of soccer balls still in the air
          const flyingSoccerBalls = this.getActiveSoccerBalls().filter( soccerBall => soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.FLYING );
          if ( flyingSoccerBalls.length === 0 ) {
            this.advanceLine();
          }
        }
        else {

          // If the kicker that kicked that ball was still in line when the ball lands, they can leave the line now.
          if ( soccerBall.kickerProperty.value === this.getFrontKicker() ) {
            this.advanceLine();
          }
        }

        this.objectValueBecameNonNullEmitter.emit();
      } );

      soccerBall.soccerBallPhaseProperty.link( phase => {
        if ( phase === SoccerBallPhase.STACKED ) {

          assert && assert( soccerBall.valueProperty.value !== null, 'if a ball is STACKED it cannot have a value of null' );
          this.stackChangedEmitter.emit( this.getStackAtValue( soccerBall.valueProperty.value! ) );
        }
      } );

      // We only want this to fire if the valueProperty of a ball is changed after it has landed.
      // If oldValue is null, it means that the ball is going from FLYING to STACKING,
      // in which case we want it to animate to the top of the stack.
      soccerBall.valueProperty.lazyLink( ( value, oldValue ) => {
        if ( oldValue !== null && soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED ) {
          const oldStack = this.getStackAtValue( oldValue );
          if ( oldStack.length > 0 ) {
            this.reorganizeStack( oldStack );
            this.clearAnimationsInStack( oldStack );
          }

          const objectsAtTarget = this.soccerBalls.filter( otherSoccerBall => {
            return otherSoccerBall.valueProperty.value === soccerBall.valueProperty.value && soccerBall !== otherSoccerBall;
          } );

          // Sort from bottom to top, so they can be re-stacked. The specified object will appear at the top.
          const sortedOthers = _.sortBy( objectsAtTarget, object => object.positionProperty.value.y );
          const newStack = [ ...sortedOthers, soccerBall ];
          this.reorganizeStack( newStack );
          this.clearAnimationsInStack( newStack );
        }

        // If a ball was removed through the state wrapper we want to fire listeners based on the stack changing.
        // The above calls to reorganizeStack also call stackChangedEmitter.emit, but they only trigger when the phase
        // is STACKED. We do not control the order of setting phase vs valueProperty in the state wrapper, so we need
        // to make sure the stackChangedEmitter triggers independently of the ordering.
        if ( isSettingPhetioStateProperty.value && oldValue !== null ) {
          this.stackChangedEmitter.emit( this.getStackAtValue( oldValue ) );
        }
      } );

      soccerBall.dragStartedEmitter.addListener( () => {
        const stack = this.getStackAtValue( soccerBall.valueProperty.value! );
        this.reorganizeStack( stack );
        this.clearAnimationsInStack( stack );
      } );

      // Signal to listeners that a value changed, but batch notifications during reset
      const guardedEmit = () => {
        if ( !this.isClearingData && !isResettingAllProperty.value && !isSettingPhetioStateProperty.value ) {
          this.objectChangedEmitter.emit();
        }
      };
      soccerBall.valueProperty.link( guardedEmit );
      soccerBall.positionProperty.link( guardedEmit );

      return soccerBall;
    } );

    isResettingAllProperty.link( isResetting => {
      if ( !isResetting ) {
        this.objectChangedEmitter.emit();
      }
    } );

    // TODO: Most likely you should run this on stateSetEmitter() instead, https://github.com/phetsims/soccer-common/issues/20
    isSettingPhetioStateProperty.link( isSettingPhetioState => {
      if ( !isSettingPhetioState ) {
        this.objectChangedEmitter.emit();
      }
    } );

    this.meanValueProperty = new Property<number | null>( null, {
      tandem: options.tandem.createTandem( 'meanValueProperty' ),
      phetioValueType: NullableIO( NumberIO ),
      phetioReadOnly: true,
      phetioFeatured: true,
      hasListenerOrderDependencies: true
    } );

    this.numberOfDataPointsProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'numberOfDataPointsProperty' ),
      range: new Range( 0, this.maxKicksLimit ),
      phetioReadOnly: true,
      phetioFeatured: true,
      phetioDocumentation: 'Indicates the number of soccer balls on the field.'
    } );

    this.timeProperty = new NumberProperty( 0 );

    this.objectValueBecameNonNullEmitter = new Emitter();

    this.numberOfQueuedKicksProperty = new NumberProperty( 0, {
      phetioDocumentation: 'The number of balls that are currently scheduled to be kicked.',
      tandem: options.tandem.createTandem( 'numberOfQueuedKicksProperty' ),
      phetioReadOnly: true
    } );
    this.timeWhenLastBallWasKickedProperty = new NumberProperty( 0 );

    const numKickers = options.isSingleKickerScene ? 1 : this.maxKicksLimit;

    this.kickers = _.range( 0, numKickers ).map( placeInLine => new Kicker( placeInLine,
      options.tandem.createTandem( 'kickers' ).createTandem1Indexed( 'kicker', placeInLine )
    ) );

    this.numberOfIdleBallsProperty = DerivedProperty.deriveAny( [
      this.maxKicksProperty,
      this.numberOfQueuedKicksProperty,
      ...this.soccerBalls.map( soccerBall => soccerBall.soccerBallPhaseProperty ) ], () => {

      const kickedSoccerBalls = this.getActiveSoccerBalls().filter(
        soccerBall => soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.FLYING ||
                      soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKING ||
                      soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED
      );
      return this.isKickingBall ? this.numberOfIdleBallsProperty.value :
             this.maxKicksProperty.value - kickedSoccerBalls.length - this.numberOfQueuedKicksProperty.value;
    } );

    this.hasKickableSoccerBallsProperty = new DerivedProperty( [ this.numberOfIdleBallsProperty ],
      numberOfUnkickedBalls => numberOfUnkickedBalls > 0 );

    this.hasKickableSoccerBallsStableProperty = new BooleanProperty( this.hasKickableSoccerBallsProperty.value );

    this.activeKickIndexProperty = new NumberProperty( 0, {
      phetioDocumentation: 'The index of the kicker that is currently kicking the ball, starting at 0. This may be different than the targetNumberOfBallsProperty or the numberOfDataPointsProperty.',
      tandem: options.tandem.createTandem( 'activeKickIndexProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    Multilink.multilink( [ this.activeKickIndexProperty, this.maxKicksProperty ], ( activeKickIndex, maxKicks ) => {
      this.kickers.forEach( ( kicker, index ) => {
        kicker.kickerPhaseProperty.value = ( ( options.isSingleKickerScene || index === activeKickIndex ) && index < maxKicks ) ? KickerPhase.READY : KickerPhase.INACTIVE;
      } );
    } );

    this.soccerBalls.forEach( soccerBall => {
      soccerBall.valueProperty.lazyLink( () => {

        // update data measures if the ball is being dragged/moved to a new position after landing/stacking
        if ( soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED ) {
          updateDataMeasures();
        }
      } );
      soccerBall.soccerBallPhaseProperty.link( ( newPhase, oldPhase ) => {

        // update data measures when the ball finished its stacking animation or if a ball has been removed from
        // the data set through state setting.
        if ( newPhase === SoccerBallPhase.STACKED || oldPhase === SoccerBallPhase.STACKED ) {
          updateDataMeasures();
        }
      } );
    } );

    // When the soccer ball count reaches the max, set the soccerBallCountReachedMaxProperty flag to true.
    this.numberOfDataPointsProperty.link( stackedSoccerBallCount => {
      if ( stackedSoccerBallCount === this.maxKicksProperty.value ) {
        this.soccerBallCountReachedMaxProperty.value = true;
      }
    } );

    maxKicksProperty.lazyLink( () => this.clearData() );
    regionAndCultureProperty.lazyLink( () => this.clearData() );

    // After state is set, we want to set the timestampWhenPoisedBeganProperty to the current time to avoid a large
    // lag if a kicker is caught in KickerPhase.POISED
    phetioStateSetEmitter.addListener( () => {
      this.getFrontKicker()?.timestampWhenPoisedBeganProperty.set( this.timeProperty.value );
    } );
  }

  // Cancel out all animations in the soccer ball stack.
  private clearAnimationsInStack( stack: SoccerBall[] ): void {
    stack.forEach( soccerBall => soccerBall.clearAnimation() );
  }

  public getDataValues(): number[] {
    const sortedObjects = this.getSortedStackedObjects();

    assert && assert( sortedObjects.length > 0, 'There are no data points to return values for.' );
    return sortedObjects.map( soccerBall => soccerBall.valueProperty.value! );
  }

  protected updateDataMeasures(): void {

    // It is expensive to update data measures, therefore we do not want to do this
    // unnecessarily while setting phetio state.
    if ( this.isClearingData || isSettingPhetioStateProperty.value ) {
      return;
    }

    const sortedObjects = this.getSortedStackedObjects();
    if ( sortedObjects.length > 0 ) {
      this.meanValueProperty.value = _.mean( this.getDataValues() );
    }
    else {
      this.meanValueProperty.value = null;
    }

    this.numberOfDataPointsProperty.value = sortedObjects.length;
  }

  /**
   * Returns all objects at the target value, matching the filter if provided. Note that some logic such as
   * determining where a ball will animate to within a stack depends on the number of balls in the stack (whether STACKING or STACKED)
   * but other logic such as where to draw the median arrow depends on the number of balls in the stack (whether STACKED only).
   */
  public getStackAtValue( value: number, filter?: ( soccerBall: SoccerBall ) => boolean ): SoccerBall[] {
    const activeSoccerBallsAtValue = this.getActiveSoccerBalls().filter( soccerBall => {
      return soccerBall.valueProperty.value === value && ( filter ? filter( soccerBall ) : true );
    } );
    return _.sortBy( activeSoccerBallsAtValue, soccerBall => soccerBall.positionProperty.value.y );
  }

  public getTallestStack( filter?: ( soccerBall: SoccerBall ) => boolean ): SoccerBall[] {
    return _.maxBy( this.getStacks( filter ), stack => stack.length )!;
  }

  /**
   * Returns all the stacks in the scene that have at least one object in them, sorted from low value to high value.
   */
  public getStacks( filter?: ( soccerBall: SoccerBall ) => boolean ): SoccerBall[][] {
    return _.range( this.physicalRange.min, this.physicalRange.max + 1 )
      .filter( value => this.getStackAtValue( value, filter ).length > 0 )
      .map( value => this.getStackAtValue( value, filter ) );
  }

  /**
   * Returns the top soccer ball in each stack.
   */
  public getTopSoccerBalls(): SoccerBall[] {
    const stacks = this.getStacks();
    return stacks.map( stack => stack[ stack.length - 1 ] );
  }

  /**
   * Set the position of the parameter object to be on top of the other objects at that target position.
   * Cease all animations in the stack and reorganize the stack.
   */
  protected reorganizeStack( soccerBallStack: SoccerBall[] ): void {

    // collapse the rest of the stack. NOTE: This assumes the radii are the same.
    let position = SoccerCommonConstants.SOCCER_BALL_RADIUS;
    soccerBallStack.forEach( soccerBall => {
      soccerBall.positionProperty.value = new Vector2( soccerBall.valueProperty.value!, position );
      position += SoccerCommonConstants.SOCCER_BALL_RADIUS * 2 * ( 1 - SoccerCommonConstants.SOCCER_BALL_OVERLAP );
    } );

    this.stackChangedEmitter.emit( soccerBallStack );
  }

  /**
   * Clears out the data
   */
  public clearData(): void {
    this.isClearingData = true;

    // This emitter handles interactive and focus highlight properties that need to reset before data values are reset.
    this.preClearDataEmitter.emit();

    this.soccerBallCountReachedMaxProperty.reset();
    this.numberOfQueuedKicksProperty.reset();
    this.timeProperty.reset();
    this.timeWhenLastBallWasKickedProperty.reset();

    this.kickers.forEach( kicker => kicker.reset() );
    this.soccerBalls.forEach( soccerBall => soccerBall.reset() );

    this.activeKickIndexProperty.reset();

    this.isClearingData = false;
    this.updateDataMeasures();

    // This emitter was suppressed during isClearingData, so we must synchronize listeners now
    this.objectChangedEmitter.emit();
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    this.kickDistributionStrategy.reset();
    this.clearData();
    this.resetEmitter.emit();
  }

  public getSortedLandedObjects(): SoccerBall[] {
    return _.sortBy( this.getActiveSoccerBalls().filter( soccerBall => soccerBall.valueProperty.value !== null ),
      object => object.valueProperty.value );
  }

  public getStackedObjects(): T[] {
    const stackedSoccerBalls = this.getActiveSoccerBalls().filter( soccerBall => soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED );

    if ( assert ) {
      stackedSoccerBalls.forEach( soccerBall => {
        assert && assert( soccerBall.valueProperty.value !== null, 'valueProperty.value should not be null' );
        assert && assert( soccerBall.valueProperty.value !== undefined, 'valueProperty.value should not be undefined' );
        assert && assert( typeof soccerBall.valueProperty.value === 'number', 'valueProperty.value should be a number' );
      } );
    }

    return stackedSoccerBalls;
  }

  public getSortedStackedObjects(): T[] {
    const stackedSoccerBalls = this.getStackedObjects();
    return _.sortBy( stackedSoccerBalls,

      // The numerical value takes precedence for sorting
      soccerBall => soccerBall.valueProperty.value,

      // Then consider the height within the stack
      soccerBall => soccerBall.positionProperty.value.y
    );
  }

  public getFrontKicker(): Kicker | null {
    const kickerIndex = this.isSingleKickerScene ? 0 : this.activeKickIndexProperty.value;
    return this.kickers[ kickerIndex ];
  }

  /**
   * Steps the model.
   *
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {
    this.timeProperty.value += dt;
    this.getActiveSoccerBalls().forEach( soccerBall => soccerBall.step( dt ) );

    const frontKicker = this.getFrontKicker();

    if ( frontKicker ) {

      if ( this.numberOfQueuedKicksProperty.value > 0 &&
           this.timeProperty.value >= this.timeWhenLastBallWasKickedProperty.value + TIME_BETWEEN_RAPID_KICKS ) {

        this.advanceLine();

        if ( frontKicker.kickerPhaseProperty.value === KickerPhase.READY ) {
          frontKicker.kickerPhaseProperty.value = KickerPhase.POISED;
          frontKicker.timestampWhenPoisedBeganProperty.value = this.timeProperty.value;
        }
      }

      // How long has the front kicker been poised?
      if ( frontKicker.kickerPhaseProperty.value === KickerPhase.POISED ) {
        assert && assert( typeof frontKicker.timestampWhenPoisedBeganProperty.value === 'number', 'timestampWhenPoisedBegan should be a number' );
        const elapsedTime = this.timeProperty.value - frontKicker.timestampWhenPoisedBeganProperty.value!;
        if ( elapsedTime > 0.075 ) {

          const soccerBall = this.soccerBalls.find( soccerBall =>
            soccerBall.valueProperty.value === null &&
            soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.READY
          );

          // In fuzzing, sometimes there are no soccer balls available
          if ( soccerBall ) {

            // The number of queued kicks must be decremented after the ball is kicked due to the nature of the
            // derivation for numberOfIdleBallsProperty. We use the isKickingBall flag to limit calls mid-Property
            // changes to only update the numberOfIdleBallsProperty when all values are accurate.
            this.isKickingBall = true;
            this.kickBall( frontKicker, soccerBall, true );
            this.isKickingBall = false;
            this.numberOfQueuedKicksProperty.value--;
          }
        }
      }
    }

    this.hasKickableSoccerBallsStableProperty.value = this.hasKickableSoccerBallsProperty.value;
  }

  // Returns a list of the median objects within a sorted array, based on the objects' 'value' property
  protected static getMedianObjectsFromSortedArray<T extends SoccerBall>( sortedObjects: T[] ): T[] {

    // Odd number of values, take the central value
    if ( sortedObjects.length % 2 === 1 ) {
      const midIndex = ( sortedObjects.length - 1 ) / 2;
      return [ sortedObjects[ midIndex ] ];
    }
    else if ( sortedObjects.length % 2 === 0 && sortedObjects.length >= 2 ) {

      // Even number of values, average the two middle-most values
      const mid1Index = ( sortedObjects.length - 2 ) / 2;
      const mid2Index = ( sortedObjects.length ) / 2;
      return [ sortedObjects[ mid1Index ], sortedObjects[ mid2Index ] ];
    }
    else {
      return [];
    }
  }

  // When a ball lands, or when the next kicker is supposed to kick (before the ball lands), move the line forward
  // and queue up the next ball as well
  private advanceLine(): void {

    // Allow kicking another ball while one is already in the air.
    // If the previous ball was still in the air, we need to move the line forward so the next kicker can kick.
    const kickers = this.kickers.filter( kicker => kicker.kickerPhaseProperty.value === KickerPhase.KICKING );
    if ( kickers.length > 0 ) {
      let nextIndex = this.activeKickIndexProperty.value + 1;
      if ( nextIndex > this.maxKicksProperty.value ) {
        nextIndex = 0;
      }
      this.activeKickIndexProperty.value = nextIndex;
      const nextBallFromPool = this.soccerBalls.find( ball => ball.soccerBallPhaseProperty.value === SoccerBallPhase.INACTIVE ) || null;
      if ( nextBallFromPool && this.soccerBalls.indexOf( nextBallFromPool ) < this.maxKicksProperty.value ) {
        nextBallFromPool.soccerBallPhaseProperty.value = SoccerBallPhase.READY;
      }
    }
  }

  public getActiveSoccerBalls(): T[] {
    return this.soccerBalls.filter( soccerBall => soccerBall.soccerBallPhaseProperty.value !== SoccerBallPhase.INACTIVE );
  }

  /**
   * When a ball lands on the ground, animate the ball to the top of the stack.
   */
  private animateSoccerBallToTopOfStack( soccerBall: SoccerBall, value: number ): void {
    const otherObjectsInStack = this.getActiveSoccerBalls().filter( x =>
      x.valueProperty.value === value && x !== soccerBall
    );

    const targetIndex = otherObjectsInStack.length;

    const diameter = SoccerCommonConstants.SOCCER_BALL_RADIUS * 2;
    const targetPositionY = targetIndex * diameter * ( 1 - SoccerCommonConstants.SOCCER_BALL_OVERLAP ) + SoccerCommonConstants.SOCCER_BALL_RADIUS;

    const stackingAnimationSlowdownFactor = SoccerCommonQueryParameters.slowStackingAnimation ? 20 : 1;
    const stackingAnimationTime = stackingAnimationSlowdownFactor * 0.06 * ( this.getStackAtValue( value ).length - 1 );

    soccerBall.clearAnimation();

    if ( otherObjectsInStack.length === 0 ) {
      soccerBall.soccerBallPhaseProperty.value = SoccerBallPhase.STACKED;
      this.objectChangedEmitter.emit();
    }
    else {
      soccerBall.soccerBallPhaseProperty.value = SoccerBallPhase.STACKING;
      soccerBall.animation = new Animation( {
        duration: stackingAnimationTime,
        targets: [ {
          property: soccerBall.positionProperty,
          to: new Vector2( Utils.roundSymmetric( soccerBall.positionProperty.value.x ), targetPositionY ),
          easing: Easing.QUADRATIC_IN_OUT
        } ]
      } );

      soccerBall.animation.endedEmitter.addListener( () => {
        soccerBall.animation = null;

        // If the sim is cleared while the animation is in progress, do not signify the ball as being at the top of a stack
        if ( soccerBall.valueProperty.value !== null ) {
          soccerBall.soccerBallPhaseProperty.value = SoccerBallPhase.STACKED;
        }

        this.objectChangedEmitter.emit();
      } );
      soccerBall.animation.start();

      // If the sim is cleared while the animation is in progress, clear it.
      soccerBall.valueProperty.lazyLink( value => {
        if ( value === null ) {
          soccerBall.clearAnimation();
        }
      } );
    }
  }

  /**
   * Adds the provided number of balls to the scheduled balls to kick
   */
  public scheduleKicks( numberOfBallsToKick: number ): void {
    this.numberOfQueuedKicksProperty.value += Math.min( numberOfBallsToKick, this.numberOfIdleBallsProperty.value );
  }

  /**
   * Select a target value for the nextBallToKick, set its velocity and mark it for animation.
   */
  private kickBall( kicker: Kicker, soccerBall: T, playAudio: boolean ): void {
    kicker.kickerPhaseProperty.value = KickerPhase.KICKING;

    const x1 = SoccerCommonQueryParameters.sameSpot ? 7 :
               this.kickDistributionStrategy.getKickDistance( this.soccerBalls.indexOf( soccerBall ) );

    // Range equation is R=v0^2 sin(2 theta0) / g, see https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion
    // Equation 4.26
    // There is special handling if the ball gets kicked 0 meters in distance.
    const degreesToRadians = ( degrees: number ) => degrees * Math.PI * 2 / 360;
    const angle = x1 !== 0 ? dotRandom.nextDoubleBetween( degreesToRadians( 25 ), degreesToRadians( 70 ) ) : Math.PI / 2;
    const v0 = x1 !== 0 ? Math.sqrt( Math.abs( x1 * Math.abs( SoccerCommonConstants.GRAVITY ) / Math.sin( 2 * angle ) ) ) : 5;

    soccerBall.velocityProperty.value = Vector2.createPolar( v0, angle );

    soccerBall.targetXProperty.value = x1;

    soccerBall.soccerBallPhaseProperty.value = SoccerBallPhase.FLYING;
    this.timeWhenLastBallWasKickedProperty.value = this.timeProperty.value;

    soccerBall.kickerProperty.value = kicker;

    playAudio && kickSound.play();
  }

  /**
   * For PhET-iO, support setting a static set of data points.
   */
  public setDataPoints( dataPoints: number[] ): void {

    // Ignore any data points beyond the max supported by MAX_KICKS_PROPERTY. Note this means a PhET-iO client needs
    // to specify the MAX_KICKS_PROPERTY value before calling this method.
    if ( dataPoints.length > this.maxKicksProperty.value ) {
      dataPoints.length = this.maxKicksProperty.value;
    }

    // Clear pre-existing data
    this.clearData();

    // Iterate through data points and create the soccer balls
    for ( let i = 0; i < dataPoints.length; i++ ) {
      const kickerIndex = this.isSingleKickerScene ? 0 : i;
      this.kickBall( this.kickers[ kickerIndex ], this.soccerBalls[ i ], false );
      this.soccerBalls[ i ].valueProperty.value = dataPoints[ i ];
      this.soccerBalls[ i ].soccerBallPhaseProperty.value = SoccerBallPhase.STACKED;

      // Leave the sim in a usable state for the next kicks (even after the data has been set)
      this.advanceLine();
    }

    // Reorganize the stacks
    _.uniq( dataPoints ).forEach( value => this.reorganizeStack( this.getStackAtValue( value ) ) );

    this.updateDataMeasures();

    // This emitter was suppressed during isClearingData, so we must synchronize listeners now
    this.objectChangedEmitter.emit();
  }
}

const SoccerSceneModelIO = new IOType<IntentionalAny, IntentionalAny>( 'SoccerSceneModelIO', {
  valueType: SoccerSceneModel,
  methods: {
    setDataPoints: {
      returnType: VoidIO,
      parameterTypes: [ ArrayIO( NumberIO ) ],
      implementation: function( this: SoccerSceneModel, dataPoints: number[] ) {
        this.setDataPoints( dataPoints );
      },
      documentation: 'Sets the data points for the scene model. Array lengths that exceed maxKicks will ignore excess values.'
    },

    getDataPoints: {
      returnType: ArrayIO( NumberIO ),
      parameterTypes: [],
      implementation: function( this: SoccerSceneModel ) {
        return this.getSortedStackedObjects().map( soccerBall => soccerBall.valueProperty.value );
      },
      documentation: 'Gets the data points for the scene model.'
    }
  }
} );
