// Copyright 2023-2026, University of Colorado Boulder

/**
 * SoccerModel is the base class for the soccer simulation. It manages the scene models and keyboard input properties.
 * It also handles the state and behavior of the soccer balls, including their interactions with the soccer field and
 * soccer players (kickers).
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../axon/js/DynamicProperty.js';
import EnabledProperty from '../../../axon/js/EnabledProperty.js';
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import PhetioObject, { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../tandem/js/types/ReferenceIO.js';
import SoccerCommonGroupSortInteractionModel from './SoccerCommonGroupSortInteractionModel.js';
import SoccerSceneModel from './SoccerSceneModel.js';

type SelfOptions<T extends SoccerSceneModel> = {
  createGroupSortInteractionModel?: ( soccerModel: SoccerModel<T>, tandem: Tandem ) => SoccerCommonGroupSortInteractionModel;
};
export type SoccerModelOptions<T extends SoccerSceneModel> = SelfOptions<T> & PhetioObjectOptions;
export default class SoccerModel<T extends SoccerSceneModel> extends PhetioObject {

  // The scene model that is currently active
  public readonly selectedSceneModelProperty: Property<T>;

  // Whether input is enabled for the entire set of soccer balls
  public readonly soccerBallsEnabledProperty: Property<boolean>;

  // The tandem used for the soccer field area
  protected readonly soccerAreaTandem: Tandem;

  // The number of stacked soccer balls in the currently active scene
  public readonly selectedSceneStackedSoccerBallCountProperty: DynamicProperty<number, number, SoccerSceneModel>;

  // The maximum number of kicks in the currently active scene
  public readonly selectedSceneMaxKicksProperty: DynamicProperty<number, number, SoccerSceneModel>;

  // Hold the model information about the state of the group sort interaction. Instantiate just one for the whole screen
  // So that the "learning" state in the interaction can persist across scenes. For example, whether to show cue hints
  // when a successful sort has not yet occurred.
  public readonly groupSortInteractionModel: SoccerCommonGroupSortInteractionModel;

  protected constructor( public readonly sceneModels: T[], providedOptions: SoccerModelOptions<T> ) {
    const options = optionize<SoccerModelOptions<T>, SelfOptions<T>, PhetioObjectOptions>()( {
      isDisposable: false,
      tandem: Tandem.REQUIRED,
      createGroupSortInteractionModel: ( soccerModel, tandem ) => new SoccerCommonGroupSortInteractionModel(
        this.selectedSceneModelProperty,
        this.selectedSceneStackedSoccerBallCountProperty,
        this.selectedSceneMaxKicksProperty,
        this.sceneModels,
        {
          getGroupItemValue: soccerBall => soccerBall.valueProperty.value,
          enabledProperty: soccerModel.soccerBallsEnabledProperty,
          tandem: tandem
        } )
    }, providedOptions );

    super( options );

    this.soccerAreaTandem = options.tandem.createTandem( 'soccerArea' );

    this.selectedSceneModelProperty = new Property( sceneModels[ 0 ], {
      validValues: sceneModels,
      tandem: sceneModels.length === 1 ? Tandem.OPT_OUT : options.tandem.createTandem( 'selectedSceneModelProperty' ),
      phetioValueType: ReferenceIO( IOType.ObjectIO ),
      phetioFeatured: true,
      phetioDocumentation: 'Indicates which kicker is active by jersey number.'
    } );

    this.soccerBallsEnabledProperty = new EnabledProperty( true, {
      tandem: this.soccerAreaTandem.createTandem( 'soccerBallsEnabledProperty' ),
      phetioDocumentation: 'Enable or disable input on the entire set of soccer balls.',
      phetioFeatured: true,
      checkTandemName: false
    } );

    // These DynamicProperties allow us to track all the necessary scenes Properties for dragIndicator update, and not
    // just the first selectedScene
    this.selectedSceneStackedSoccerBallCountProperty = new DynamicProperty<number, number, SoccerSceneModel>( this.selectedSceneModelProperty, {
      derive: 'numberOfDataPointsProperty'
    } );
    this.selectedSceneMaxKicksProperty = new DynamicProperty<number, number, SoccerSceneModel>( this.selectedSceneModelProperty, {
      derive: 'maxKicksProperty'
    } );

    this.groupSortInteractionModel = options.createGroupSortInteractionModel( this, this.soccerAreaTandem.createTandem( 'groupSortInteractionModel' ) );

    sceneModels.forEach( sceneModel => {
      sceneModel.preClearDataEmitter.addListener( () => this.groupSortInteractionModel.resetInteractionState() );
    } );

    this.selectedSceneModelProperty.link( selectedScene => {
      this.sceneModels.forEach( sceneModel => {
        sceneModel.isVisibleProperty.value = sceneModel === selectedScene;
      } );

      this.groupSortInteractionModel.clearSelection();
    } );
  }

  public step( dt: number ): void {
    // Override in subclasses

    this.selectedSceneModelProperty.value.step( dt );
  }

  public reset(): void {

    // We need to reset keyboard focus Properties that are used by the sceneModels, before
    // resetting the sceneModels themselves.
    this.groupSortInteractionModel.reset();

    this.sceneModels.forEach( sceneModel => sceneModel.reset() );
    this.selectedSceneModelProperty.reset();
  }

  public clearData(): void {
    this.groupSortInteractionModel.clearSelection();
    this.selectedSceneModelProperty.value.clearData();
  }
}
