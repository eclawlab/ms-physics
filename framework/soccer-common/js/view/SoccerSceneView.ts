// Copyright 2023-2026, University of Colorado Boulder

/**
 * Depicts a single scene in which soccer balls can be kicked. This includes the soccer balls, soccer players (kickers),
 * and drag indicator arrow. The scene is rendered in two layers to ensure the correct z-ordering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import TinyProperty from '../../../axon/js/TinyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Range from '../../../dot/js/Range.js';
import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import InteractiveHighlightingNode from '../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import Node from '../../../scenery/js/nodes/Node.js';
import { PhetioObjectOptions } from '../../../tandem/js/PhetioObject.js';
import SoccerBall from '../model/SoccerBall.js';
import { SoccerBallPhase } from '../model/SoccerBallPhase.js';
import SoccerModel from '../model/SoccerModel.js';
import SoccerSceneModel from '../model/SoccerSceneModel.js';
import SoccerCommonStrings from '../SoccerCommonStrings.js';
import { KickerImageSet } from './KickerImageSets.js';
import KickerNode from './KickerNode.js';
import SoccerBallNode from './SoccerBallNode.js';
import SoccerCommonGroupSortInteractionView from './SoccerCommonGroupSortInteractionView.js';

type SelfOptions = {
  soccerBallDerivedVisibilityCallback?: ( phase: SoccerBallPhase ) => boolean;
};
export type SoccerSceneViewOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

/**
 * Renders view elements for a SoccerSceneModel. Note that to satisfy the correct z-ordering, elements
 * populate the middleScreenViewLayer and frontScreenViewLayer in the parent.
 */
export default class SoccerSceneView<SceneModel extends SoccerSceneModel = SoccerSceneModel, Model extends SoccerModel<SceneModel> = SoccerModel<SceneModel>> {

  public readonly backSceneViewLayer: Node;
  public readonly frontSceneViewLayer: Node;
  public readonly groupSortInteractionView: SoccerCommonGroupSortInteractionView<SceneModel>;

  public constructor(
    soccerModel: Pick<Model,
      'soccerBallsEnabledProperty' | 'groupSortInteractionModel' | 'selectedSceneModelProperty'>,
    public readonly sceneModel: SceneModel,
    keyboardSortCueNode: Node,
    public readonly modelViewTransform: ModelViewTransform2,
    physicalRange: Range,
    kickerImageSets: KickerImageSet[],
    providedOptions: SoccerSceneViewOptions ) {

    const options = optionize<SoccerSceneViewOptions, SelfOptions, PickRequired<PhetioObjectOptions, 'tandem'>>()( {
      soccerBallDerivedVisibilityCallback: phase => phase !== SoccerBallPhase.INACTIVE
    }, providedOptions );

    const soccerBallsEnabledProperty = soccerModel.soccerBallsEnabledProperty;
    const soccerBallMap = new Map<SoccerBall, SoccerBallNode>();

    // Keep soccer balls in one layer, so we can control the focus order.
    const backLayerSoccerBallLayer = new InteractiveHighlightingNode( {
      focusable: true,
      tagName: 'button',
      accessibleName: SoccerCommonStrings.a11y.grabSoccerBallStringProperty,
      accessibleHelpText: SoccerCommonStrings.a11y.soccerBallHelpTextStringProperty
    } );

    const stackValueDependencies = sceneModel.soccerBalls.map( soccerBall => soccerBall.valueProperty );
    const currentStackValueProperty = DerivedProperty.deriveAny( [ soccerModel.groupSortInteractionModel.selectedGroupItemProperty, ...stackValueDependencies ], () => {
      const selectedBall = soccerModel.groupSortInteractionModel.selectedGroupItemProperty.value;
      return selectedBall === null || soccerModel.groupSortInteractionModel.getGroupItemValue( selectedBall ) === null ? 0 :
             soccerModel.groupSortInteractionModel.getGroupItemValue( selectedBall )!;
    } );

    const stackHeightProperty = new DerivedProperty( [ currentStackValueProperty, soccerModel.groupSortInteractionModel.selectedGroupItemProperty ], stackNumber => {
      return sceneModel.getStackAtValue( stackNumber ).length;
    } );
    const patternValues = {
      currentMeter: currentStackValueProperty,
      totalMeters: sceneModel.physicalRange.max,
      stackHeight: stackHeightProperty
    };
    const selectingSoccerBallPatternStringProperty = new PatternStringProperty( SoccerCommonStrings.a11y.selectingSoccerBallPatternStringProperty, patternValues );
    const sortingSoccerBallPatternStringProperty = new PatternStringProperty( SoccerCommonStrings.a11y.sortingSoccerBallPatternStringProperty, patternValues );

    Multilink.multilink( [
        soccerModel.groupSortInteractionModel.isGroupItemKeyboardGrabbedProperty,
        sceneModel.numberOfDataPointsProperty,
        soccerModel.groupSortInteractionModel.selectedGroupItemProperty
      ],
      ( isGrabbed, numberOfDataPoints ) => {

        if ( numberOfDataPoints === 0 ) {
          backLayerSoccerBallLayer.accessibleName = SoccerCommonStrings.a11y.noSoccerBallsToGrabStringProperty;
        }
        else {
          backLayerSoccerBallLayer.accessibleName = isGrabbed ? sortingSoccerBallPatternStringProperty :
                                                    selectingSoccerBallPatternStringProperty;
        }
      } );

    this.groupSortInteractionView = new SoccerCommonGroupSortInteractionView<SceneModel>(
      soccerModel.groupSortInteractionModel,
      backLayerSoccerBallLayer,
      sceneModel,
      soccerModel.selectedSceneModelProperty,
      soccerBallMap,
      keyboardSortCueNode,
      modelViewTransform, {
        sortingRangeProperty: new TinyProperty( physicalRange )
      }
    );

    const backLayer = new Node( {
      children: [ backLayerSoccerBallLayer ]
    } );

    // A front layer for balls in the air so that they are in front of other UI components
    const frontLayer = new Node();

    sceneModel.soccerBalls.map( ( soccerBall, index ) => {

      const soccerBallParentTandem = options.tandem.createTandem( 'soccerBallNodes' );

      const soccerBallNode = new SoccerBallNode(
        soccerBall,
        modelViewTransform,
        soccerBallsEnabledProperty, {
          visibleProperty: new DerivedProperty( [ soccerBall.soccerBallPhaseProperty ], options.soccerBallDerivedVisibilityCallback ),
          tandem: soccerBallParentTandem.createTandem1Indexed( 'soccerBallNode', index ),
          pickable: false
        } );

      backLayerSoccerBallLayer.addChild( soccerBallNode );

      // While flying, it should be at the front in z-order, to be in front of the accordion box
      soccerBall.soccerBallPhaseProperty.lazyLink( ( soccerBallPhase, oldSoccerBallPhase ) => {

        //when the ball is kicked
        if ( soccerBallPhase === SoccerBallPhase.FLYING ) {
          backLayerSoccerBallLayer.removeChild( soccerBallNode );
          frontLayer.addChild( soccerBallNode );
        }
        else if ( oldSoccerBallPhase === SoccerBallPhase.FLYING ) {
          frontLayer.removeChild( soccerBallNode );
          backLayerSoccerBallLayer.addChild( soccerBallNode );
        }
      } );

      soccerBallMap.set( soccerBall, soccerBallNode );

      return soccerBallNode;
    } );

    // Update pointer areas and pickability when topmost ball changes
    const updateSoccerBallPointerAreas = ( stack: SoccerBall[] ) => {
      let bounds: Bounds2 | null = null;

      for ( let i = 0; i < stack.length; i++ ) {
        const soccerBallNode = soccerBallMap.get( stack[ i ] )!;

        if ( i === 0 ) {
          bounds = soccerBallNode.globalBounds;
        }
        else {
          bounds!.includeBounds( soccerBallNode.globalBounds );
        }

        if ( i === stack.length - 1 ) {
          const pointerArea = Shape.bounds( soccerBallNode.globalToLocalBounds( bounds!.dilated( 5 ) ) );
          soccerBallNode.mouseArea = pointerArea;
          soccerBallNode.touchArea = pointerArea;
          soccerBallNode.pickable = true;
        }
        else {
          soccerBallNode.pickable = false;

          // To make it easier to see when using ?showPointerAreas
          soccerBallNode.mouseArea = Shape.rectangle( 0, 0, 0, 0 );
          soccerBallNode.touchArea = Shape.rectangle( 0, 0, 0, 0 );
        }
      }
    };
    sceneModel.stackChangedEmitter.addListener( stack => updateSoccerBallPointerAreas( stack ) );
    sceneModel.objectChangedEmitter.addListener( () => {
      sceneModel.getStackedObjects().forEach( soccerBall => {
        assert && assert( soccerBall.valueProperty.value !== null, 'value should be set' );
        const stack = sceneModel.getStackAtValue( soccerBall.valueProperty.value! );
        updateSoccerBallPointerAreas( stack );
      } );
    } );


    const kickerNodes = sceneModel.kickers.map( ( kicker, i ) =>
      new KickerNode(
        kicker,
        kickerImageSets[ i % sceneModel.kickers.length % kickerImageSets.length ],
        modelViewTransform ) );

    kickerNodes.forEach( kickerNode => frontLayer.addChild( kickerNode ) );

    this.backSceneViewLayer = backLayer;
    this.frontSceneViewLayer = frontLayer;
  }
}
