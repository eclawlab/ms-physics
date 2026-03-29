// Copyright 2023-2026, University of Colorado Boulder
/**
 * Parent screenView for sims that use a soccer context. Includes a ModelViewTransform2 and the NumberLineNode
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../axon/js/DynamicProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView, { ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import WithRequired from '../../../phet-core/js/types/WithRequired.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import dragIndicatorHand_png from '../../../scenery-phet/images/dragIndicatorHand_png.js';
import GroupSortInteractionView from '../../../scenery-phet/js/accessibility/group-sort/view/GroupSortInteractionView.js';
import ManualConstraint from '../../../scenery/js/layout/constraints/ManualConstraint.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { SoccerBallPhase } from '../model/SoccerBallPhase.js';
import SoccerModel from '../model/SoccerModel.js';
import SoccerSceneModel from '../model/SoccerSceneModel.js';
import SoccerCommonConstants from '../SoccerCommonConstants.js';
import NumberLineNode from './NumberLineNode.js';

type SelfOptions = {

  // The range of values on the field that soccer balls can be kicked to
  physicalRange: Range;

  // The width of the chart view for the model view transform
  chartViewWidth: number;

  // The margin on the left side of the number line
  numberLineXMargin: number;

  // The y position of the ground in view coordinates
  groundPositionY?: number;

  // Whether the number line node should be instrumented for PhET-iO
  instrumentNumberLineNode?: boolean;
};

export const DRAG_CUE_SCALE = 0.8;

export type SoccerScreenViewOptions = SelfOptions & WithRequired<ScreenViewOptions, 'tandem'>;

export default class SoccerScreenView<T extends SoccerSceneModel, Q extends SoccerModel<T>> extends ScreenView {

  // The model-view transform for the screen view
  protected readonly modelViewTransform: ModelViewTransform2;

  // The number of soccer balls that have been kicked in the active scene
  protected readonly numberOfKicksProperty: DynamicProperty<number, number, SoccerSceneModel>;

  // The number line in the soccer area at the bottom of the screen
  protected readonly playAreaNumberLineNode: NumberLineNode;

  // The keyboard drag indicator arrow
  protected readonly keyboardSortCueNode: Node;
  protected readonly sortIndicatorArrowNode: Node;
  protected readonly mouseSortHandCueNode: Node;

  protected constructor( protected readonly model: Q, providedOptions: SoccerScreenViewOptions ) {

    const options = optionize<SoccerScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      groundPositionY: SoccerCommonConstants.GROUND_POSITION_Y,
      instrumentNumberLineNode: false
    }, providedOptions );

    super( options );

    this.numberOfKicksProperty = new DynamicProperty<number, number, SoccerSceneModel>( model.selectedSceneModelProperty, { derive: 'numberOfDataPointsProperty' } );

    const groundPositionY = options.groundPositionY;

    // The ground is at y=0
    this.modelViewTransform = ModelViewTransform2.createRectangleInvertedYMapping(
      new Bounds2( options.physicalRange.min, 0, options.physicalRange.max, 1 ),
      new Bounds2( options.numberLineXMargin, groundPositionY - SoccerCommonConstants.SOCCER_BALL_VIEW_SIZE,
        options.numberLineXMargin + options.chartViewWidth, groundPositionY )
    );

    this.playAreaNumberLineNode = new NumberLineNode(
      options.chartViewWidth,
      options.physicalRange, {
        includeXAxis: false,
        x: options.numberLineXMargin,
        y: groundPositionY,
        tandem: options.instrumentNumberLineNode ? options.tandem?.createTandem( 'playAreaNumberLineNode' ) : Tandem.OPT_OUT
      } );

    /**
     * Create and handle cue nodes.
     */
    this.keyboardSortCueNode = GroupSortInteractionView.createSortCueNode(
      model.groupSortInteractionModel.keyboardSortCueVisibleProperty, DRAG_CUE_SCALE );

    this.sortIndicatorArrowNode = GroupSortInteractionView.createSortCueNode(
      model.groupSortInteractionModel.mouseSortCueVisibleProperty, DRAG_CUE_SCALE );

    this.mouseSortHandCueNode = new Image( dragIndicatorHand_png, {
      scale: 0.07,
      visibleProperty: model.groupSortInteractionModel.mouseSortCueVisibleProperty,
      rotation: Math.PI / 4
    } );

    ManualConstraint.create( this, [ this.sortIndicatorArrowNode ], sortIndicatorArrowNodeProxy => {

      // Pixel adjustments needed with rotation option on mouseSortHandCueNode and empirically determined to match design
      this.mouseSortHandCueNode.right = sortIndicatorArrowNodeProxy.left + 22;
      this.mouseSortHandCueNode.top = sortIndicatorArrowNodeProxy.bottom + Math.abs( this.modelViewTransform.modelToViewDeltaY( SoccerCommonConstants.SOCCER_BALL_RADIUS ) ) - 5;
    } );

    this.visibleBoundsProperty.link( this.updateMouseSortCueNode.bind( this ) );
    this.model.selectedSceneModelProperty.link( this.updateMouseSortCueNode.bind( this ) );
    this.model.sceneModels.forEach( sceneModel => {
      sceneModel.objectChangedEmitter.addListener( this.updateMouseSortCueNode.bind( this ) );
    } );
    model.groupSortInteractionModel.registerUpdateSortCueNode( this.updateMouseSortCueNode.bind( this ) );

    this.addChild( this.keyboardSortCueNode );
  }

  // calculate where the top object is at a given value
  protected getTopObjectPositionY( value: number ): number {
    const sceneModel = this.model.selectedSceneModelProperty.value;
    const ballsAtValue = sceneModel.soccerBalls.filter( soccerBall =>
      soccerBall.valueProperty.value === value && soccerBall.soccerBallPhaseProperty.value === SoccerBallPhase.STACKED );
    const modelHeight = ballsAtValue.length * SoccerCommonConstants.SOCCER_BALL_RADIUS * 2 * ( 1 - SoccerCommonConstants.SOCCER_BALL_OVERLAP );
    const viewHeight = this.modelViewTransform.modelToViewDeltaY( modelHeight );
    return this.modelViewTransform.modelToViewY( 0 ) + viewHeight;
  }

  protected updateMouseSortCueNode(): void {
    const mouseSortCueVisible = this.model.groupSortInteractionModel.mouseSortCueVisibleProperty.value;
    const selectedValue = this.model.groupSortInteractionModel.selectedGroupItemProperty.value?.valueProperty.value ?? null;

    if ( mouseSortCueVisible ) {

      let stackValue = selectedValue;

      // We want to handle the situation where the selectedGroupItemProperty may be null due to balls being disabled,
      // but there are still balls on the field. In this case, we want to show the sort indicator over the top ball.
      // This may create buggy states for PhET-iO clients but that is up to them to handle. We want to at least make
      // sure the cue is appearing in a reasonable location. https://github.com/phetsims/mean-share-and-balance/issues/337
      if ( selectedValue === null ) {
        const selectedSceneModel = this.model.selectedSceneModelProperty.value;
        const topBallsInReversedOrder = selectedSceneModel.getActiveSoccerBalls().filter( soccerBall =>
          soccerBall.valueProperty.value !== null ).reverse().filter( soccerBall =>
          selectedSceneModel.getTopSoccerBalls().includes( soccerBall ) );
        stackValue = topBallsInReversedOrder.length > 0 ? topBallsInReversedOrder[ 0 ].valueProperty.value! : null;
      }
      if ( stackValue !== null ) {
        const topObjectPositionY = this.getTopObjectPositionY( stackValue );
        this.sortIndicatorArrowNode.center = new Vector2(
          this.modelViewTransform.modelToViewX( stackValue ),

          // This value must be kept in sync with the other occurrences of GroupSortInteractionView.createSortCueNode()
          // that are shown for the keyboard.
          topObjectPositionY - 11.5
        );
      }
    }
  }
}
