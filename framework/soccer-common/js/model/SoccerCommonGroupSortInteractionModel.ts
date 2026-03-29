// Copyright 2024-2026, University of Colorado Boulder

/**
 * CAVGroupSortInteractionModel is a subclass that adds logic to place the drag indicator in a
 * spot that is not the median. Its role is to minimize the occurrence of drag indicator and median indicator overlap.
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import GroupSelectModel, { GroupSelectModelOptions } from '../../../scenery-phet/js/accessibility/group-sort/model/GroupSelectModel.js';
import SoccerBall from './SoccerBall.js';
import SoccerSceneModel from './SoccerSceneModel.js';

export default class SoccerCommonGroupSortInteractionModel<SceneModel extends SoccerSceneModel = SoccerSceneModel>
  extends GroupSelectModel<SoccerBall> {

  public constructor( protected readonly selectedSceneModelProperty: TReadOnlyProperty<SceneModel>,
                      private readonly selectedSceneStackedSoccerBallCountProperty: TReadOnlyProperty<number>,
                      private readonly selectedSceneMaxKicksProperty: TReadOnlyProperty<number>,
                      sceneModels: SceneModel[], providedOptions?: GroupSelectModelOptions<SoccerBall> ) {
    super( providedOptions );

    const allValueProperties = sceneModels.flatMap( sceneModel => sceneModel.soccerBalls.map( soccerBall => soccerBall.valueProperty ) );

    const soccerCommonDependencies: TReadOnlyProperty<unknown>[] = [
      this.selectedSceneModelProperty,
      ...allValueProperties,
      this.selectedSceneStackedSoccerBallCountProperty,
      this.selectedSceneMaxKicksProperty
    ];

    const updateSortIndicatorNode = () => {
      const sceneModel = this.selectedSceneModelProperty.value;
      const soccerBallCount = this.selectedSceneStackedSoccerBallCountProperty.value;

      //  If an object was sorted, objects are not input enabled, or the max number of balls haven't been kicked out yet
      //  don't show the sortIndicatorCue.
      this.mouseSortCueVisibleProperty.value = this.mouseSortCueShouldBeVisible() &&
                                               soccerBallCount > 0 &&
                                               sceneModel.soccerBallCountReachedMaxProperty.value;

    };
    this.registerUpdateSortCueNode( updateSortIndicatorNode );
    Multilink.multilinkAny( soccerCommonDependencies, updateSortIndicatorNode );

    // It is important to link to the values of all the soccer balls in the screen, so that the dragIndicator can be
    // updated after all the balls have landed, and not just after they have been kicked.
    Multilink.multilinkAny( [
      ...soccerCommonDependencies,

      // Super members
      this.hasGroupItemBeenSortedProperty,
      this.isKeyboardFocusedProperty
    ], () => this.updateSelectedGroupItem( this.selectedSceneModelProperty.value ) );
  }

  // This is an algorithm that can be used to get the best guess about where the sort indicator should be set to based
  // on the current state of the soccer balls. This selection will apply both to the mouse cue location and the initial
  // group sort selection.
  public updateSelectedGroupItem( sceneModel: SceneModel ): void {

    if ( !this.isKeyboardFocusedProperty.value && !this.hasKeyboardSelectedGroupItemProperty.value && !this.hasKeyboardGrabbedGroupItemProperty.value ) {
      const reversedBalls = sceneModel.getActiveSoccerBalls().filter( soccerBall =>
        soccerBall.valueProperty.value !== null ).reverse();
      const enabledTopBalls = sceneModel.getTopSoccerBalls().filter( soccerBall => soccerBall.enabledProperty.value );
      const enabledTopBallsInReversedKickOrder = reversedBalls.filter( ball => enabledTopBalls.includes( ball ) );

      // Show the sort indicator over the most recently landed ball that is at the top of a stack.
      this.selectedGroupItemProperty.value = enabledTopBallsInReversedKickOrder.length > 0 ? enabledTopBallsInReversedKickOrder[ 0 ] : null;
    }
  }
}
