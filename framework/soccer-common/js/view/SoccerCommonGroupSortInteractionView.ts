// Copyright 2024-2026, University of Colorado Boulder

/**
 * Apply the sim-specific logic to wire up a GroupSortInteractionView for the particular Soccer scene the interaction
 * is associated with.
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickOptional from '../../../phet-core/js/types/PickOptional.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import GroupSelectModel from '../../../scenery-phet/js/accessibility/group-sort/model/GroupSelectModel.js';
import GroupSortInteractionView, { GroupSortInteractionViewOptions } from '../../../scenery-phet/js/accessibility/group-sort/view/GroupSortInteractionView.js';
import Node from '../../../scenery/js/nodes/Node.js';
import SoccerBall from '../model/SoccerBall.js';
import { SoccerBallPhase } from '../model/SoccerBallPhase.js';
import SoccerSceneModel from '../model/SoccerSceneModel.js';
import SoccerBallNode from './SoccerBallNode.js';
import SoccerCommonStrings from '../SoccerCommonStrings.js';

// A list of options that are required by the supertype, but optional here because
// we provide a default.
type RequiredButProvidedBySubtype = 'getNextSelectedGroupItem' | 'getGroupItemToSelect' | 'getNodeFromModelItem' | 'sortGroupItem';

type SelfOptions = PickOptional<GroupSortInteractionViewOptions<SoccerBall, SoccerBallNode>, RequiredButProvidedBySubtype>;

type ParentOptions = StrictOmit<GroupSortInteractionViewOptions<SoccerBall, SoccerBallNode>, RequiredButProvidedBySubtype>;
type SoccerCommonGroupSortInteractionViewOptions = SelfOptions & ParentOptions;

export default class SoccerCommonGroupSortInteractionView<SceneModel extends SoccerSceneModel> extends GroupSortInteractionView<SoccerBall, SoccerBallNode> {

  public constructor(
    groupSortInteractionModel: GroupSelectModel<SoccerBall>,
    primaryFocusedNode: Node,
    sceneModel: SceneModel,
    selectedSceneModelProperty: TReadOnlyProperty<SceneModel>,
    soccerBallMap: Map<SoccerBall, SoccerBallNode>,
    keyboardSortArrowCueNode: Node,
    public readonly modelViewTransform: ModelViewTransform2, providedOptions: SoccerCommonGroupSortInteractionViewOptions ) {

    const options = optionize<SoccerCommonGroupSortInteractionViewOptions, SelfOptions, ParentOptions>()( {
      getNodeFromModelItem: groupItemModel => {
        const soccerBallNode = soccerBallMap.get( groupItemModel );
        return soccerBallNode || null; // If not part of this map, then the groupItemModel is not part of this scene.
      },
      getNextSelectedGroupItem: ( delta, selectedSoccerBall ) => {
        const topBallNodes = sceneModel.getTopSoccerBalls().map( soccerBall => soccerBallMap.get( soccerBall )! );
        const numberOfTopSoccerBalls = topBallNodes.length;

        // We are deciding not to wrap the value around the ends of the range because the grabbed soccer ball
        // also does not wrap.
        const currentIndex = topBallNodes.indexOf( soccerBallMap.get( selectedSoccerBall )! );
        const nextIndex = Utils.clamp( currentIndex + delta, 0, numberOfTopSoccerBalls - 1 );
        return topBallNodes[ nextIndex ].soccerBall;
      },
      isGroupItemEnabled: soccerBall => soccerBall.enabledProperty.value,
      getGroupItemToSelect: () => {

        assert && assert( groupSortInteractionModel.selectedGroupItemProperty.value === null,
          'expected to only be called when there is no focus' );

        const topSoccerBalls = sceneModel.getTopSoccerBalls();
        if ( topSoccerBalls.length > 0 ) {
          const selectedValue = groupSortInteractionModel.selectedGroupItemProperty.value?.valueProperty.value ?? null;
          if ( selectedValue !== null ) {
            const sortIndicatorStack = sceneModel.getStackAtValue( selectedValue,
              soccerBall => soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED );
            assert && assert( sortIndicatorStack.length > 0, `must have a stack length at the sortIndicator value: ${selectedValue}` );
            return sortIndicatorStack[ sortIndicatorStack.length - 1 ];
          }
          else {
            return topSoccerBalls[ 0 ];
          }
        }
        return null;
      },
      sortGroupItem: ( soccerBall, newValue ) => soccerBall.valueProperty.set( newValue ),
      onSort: soccerBall => {
        assert && assert( soccerBall.valueProperty.value !== null );
        soccerBall.toneEmitter.emit( soccerBall.valueProperty.value! );
      },
      numberKeyMapper: keysPressed => {

        // Note here how "0" maps to 10 based on the location of it next to 9.
        return keysPressed === '1' ? 1 :
               keysPressed === '2' ? 2 :
               keysPressed === '3' ? 3 :
               keysPressed === '4' ? 4 :
               keysPressed === '5' ? 5 :
               keysPressed === '6' ? 6 :
               keysPressed === '7' ? 7 :
               keysPressed === '8' ? 8 :
               keysPressed === '9' ? 9 :
               keysPressed === '0' ? 10 :
               null; // Guard against having an unexpected key (don't change the value).
      },
      grabReleaseCueOptions: {
        centerTop: modelViewTransform.modelToViewXY( sceneModel.physicalRange.getCenter(), 4 )
      },
      grabbedRoleDescription: SoccerCommonStrings.a11y.movableStringProperty
    }, providedOptions );

    super( groupSortInteractionModel, primaryFocusedNode, options );

    // Position the keyboard cue given the MVT. The selection arrow is shown over the same ball as the mouse sort
    // indicator item
    this.positionSortCueNodeEmitter.addListener( () => {
      if ( selectedSceneModelProperty.value === sceneModel ) {

        const selectedSoccerBall = this.model.selectedGroupItemProperty.value!;
        assert && assert( selectedSoccerBall !== null, 'Must have a selection to position the sorting cue node' );
        assert && assert( selectedSoccerBall.valueProperty.value !== null, 'Cannot select a soccer ball with no value' );

        // If a soccer ball has focus, that takes precedence for displaying the indicators
        const valueToShow = selectedSoccerBall.valueProperty.value!;
        const stack = sceneModel.getStackAtValue( valueToShow );

        if ( stack.length > 0 ) {

          const arrowOffset = -18;

          const topBall = stack[ stack.length - 1 ];
          const position = topBall.positionProperty.value;
          keyboardSortArrowCueNode.centerBottom = modelViewTransform.modelToViewPosition( position ).plusXY( 0, arrowOffset );
          keyboardSortArrowCueNode.moveToFront();
        }
      }
    } );

    sceneModel.soccerBalls.forEach( soccerBall => {
      soccerBall.valueProperty.link( ( value, oldValue ) => {

        // If the value changed from numeric to numeric, while the soccer ball is being dragged, we want to set the
        // mouseSortedGroupItem to true so that visibility can be handled accordingly.
        // It's simpler to have the listener here because in the model or drag listener, there is rounding/snapping
        // And we only want to hide the indicator if the user dragged the ball a full tick mark
        if ( soccerBall.isDraggingProperty.value && value !== null && oldValue !== null ) {
          this.model.setMouseSortedGroupItem( true );
        }
      } );
    } );

    const selectedGroupItemProperty = this.model.selectedGroupItemProperty;

    // Update soccer ball selection when topmost ball in the stack changes.
    sceneModel.stackChangedEmitter.addListener( stack => {
      if ( selectedSceneModelProperty.value === sceneModel ) {

        // When a user is focused on the backLayerSoccerBallLayer, but no balls have landed yet, we want to ensure that
        // a selectedGroupItem gets assigned once the ball lands.
        const topEnabledSoccerBalls = sceneModel.getTopSoccerBalls().filter( soccerBall => soccerBall.enabledProperty.value );
        const selectedGroupItem = selectedGroupItemProperty.value;

        // If the selectedGroupItem is null or not input enabled, we want to assign it to the first enabled top ball.
        if ( ( selectedGroupItem === null || !selectedGroupItem.enabledProperty.value )
             && topEnabledSoccerBalls.length > 0 && this.model.isKeyboardFocusedProperty.value ) {
          assert && assert( topEnabledSoccerBalls[ 0 ].valueProperty.value !== null, 'The valueProperty of the selectedGroupItem should not be null.' );
          selectedGroupItemProperty.value = topEnabledSoccerBalls[ 0 ];
        }

        // Anytime a stack changes and the selectedGroupItem is assigned, we want to make sure the selectedGroupItem
        // stays on top.
        else if ( selectedGroupItem !== null ) {

          // If the value is null, it means the ball was removed from the field, so we need to select a new ball.
          if ( selectedGroupItem.valueProperty.value === null || !selectedGroupItem.enabledProperty.value ) {
            selectedGroupItemProperty.value = topEnabledSoccerBalls.length > 0 ? topEnabledSoccerBalls[ 0 ] : null;
          }

          // If the selectedGroupItem is in the stack that was changed, we want to make sure it stays on top.
          else if ( stack.includes( selectedGroupItem ) ) {
            const selectedStack = sceneModel.getStackAtValue( selectedGroupItem.valueProperty.value );
            selectedGroupItemProperty.value = selectedStack[ selectedStack.length - 1 ];
          }
        }
      }
    } );
  }

  /**
   * The group focus region for the soccer ball area is supposed to be just below the accordion box, and adjust when the
   * accordion box expands and collapses. Translate lower so it also includes the number line and labels
   */
  public setGroupFocusHighlightTop( top: number, ballRange: Range ): void {
    const yMargin = 4; // Distance below top bounds
    const xPadding = this.modelViewTransform.modelToViewDeltaX( 0.5 ); // Padding on left and right
    const shapeForLeftRightBottom = this.modelViewTransform.modelToViewShape(
      Shape.rect( ballRange.min, 0, ballRange.getLength(), 6 )
    ).transformed( Matrix3.translation( 0, 37 ) );

    this.groupSortGroupFocusHighlightPath.shape = Shape.rect(
      shapeForLeftRightBottom.bounds.x - xPadding,
      top + yMargin,
      shapeForLeftRightBottom.bounds.width + xPadding * 2,
      shapeForLeftRightBottom.bounds.bottom - top - yMargin
    );
  }

}
