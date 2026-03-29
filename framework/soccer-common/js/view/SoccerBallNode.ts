// Copyright 2023-2026, University of Colorado Boulder

/**
 * SoccerBallNode renders a soccer ball that can be dragged horizontally. The Node has a "dark" version
 * that is used to represent a soccerBall that is input disabled.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import HighlightFromNode from '../../../scenery/js/accessibility/HighlightFromNode.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node from '../../../scenery/js/nodes/Node.js';
import ball_svg from '../../images/ball_svg.js';
import ballDark_svg from '../../images/ballDark_svg.js';
import SoccerBall from '../model/SoccerBall.js';
import { SoccerBallPhase } from '../model/SoccerBallPhase.js';
import SoccerCommonConstants from '../SoccerCommonConstants.js';
import SoccerObjectNode, { SoccerObjectNodeOptions } from './SoccerObjectNode.js';

type SelfOptions = EmptySelfOptions;
type SoccerBallNodeOptions = SelfOptions & SoccerObjectNodeOptions;

export default class SoccerBallNode extends SoccerObjectNode {

  public constructor( soccerBall: SoccerBall,
                      modelViewTransform: ModelViewTransform2,
                      soccerBallsEnabledProperty: ReadOnlyProperty<boolean>,
                      providedOptions: SoccerBallNodeOptions ) {

    // Use the y dimension, since it determines how the soccer balls stack. But maintain the same aspect ratio as the image
    const viewRadius = Math.abs( modelViewTransform.modelToViewDeltaY( SoccerCommonConstants.SOCCER_BALL_RADIUS ) );

    const options = optionize<SoccerBallNodeOptions, SelfOptions, SoccerObjectNodeOptions>()( {
      cursor: 'pointer',
      isDisposable: false,
      phetioFeatured: true
    }, providedOptions );

    super( soccerBall, modelViewTransform, options );

    // The dark soccer ball is used for when a ball has input disabled.
    const soccerBallNode = new Image( ball_svg );
    const soccerBallDarkNode = new Image( ballDark_svg );
    const soccerBallNodes = new Node( {
      children: [ soccerBallNode, soccerBallDarkNode ],

      // if the child node is non-square, it should still fit within specified dimensions. Note: this does not change the
      // aspect ratio.
      maxWidth: viewRadius * 2,
      maxHeight: viewRadius * 2,

      // Center the nested Node for compatibility with DragListener
      center: Vector2.ZERO
    } );

    const interactiveHighlight = new HighlightFromNode( this );
    this.setInteractiveHighlight( interactiveHighlight );
    soccerBall.isDraggingProperty.link( isDragging => {
      interactiveHighlight.setDashed( isDragging );
    } );

    // only setup input-related things if dragging is enabled
    const dragListener = new DragListener( {
      tandem: options.tandem.createTandem( 'dragListener' ),
      positionProperty: soccerBall.dragPositionProperty,
      transform: modelViewTransform,
      start: () => {
        soccerBall.isDraggingProperty.value = true;

        // if the user presses an object that's animating, allow it to keep animating up in the stack
        soccerBall.dragStartedEmitter.emit();
        this.moveToFront();
      },
      drag: () => {
        soccerBall.animation && soccerBall.animation.stop();
      },

      end: () => {
        soccerBall.isDraggingProperty.value = false;
      }
    } );


    // When the user drags a soccer ball, play audio corresponding to its new position.
    soccerBall.valueProperty.link( value => {
      if ( value !== null && ( soccerBall.isDraggingProperty.value ) ) {
        soccerBall.toneEmitter.emit( value );
      }
    } );

    // pan and zoom - In order to move the SoccerObjectNode to a new position the pointer has to move more than half the
    // unit model length. When the SoccerObjectNode is near the edge of the screen while zoomed in, the pointer doesn't
    // have enough space to move that far. If we make sure that bounds surrounding the SoccerObjectNode have a width
    // of 2 model units the pointer will always have enough space to drag the SoccerObjectNode to a new position.
    // See https://github.com/phetsims/center-and-variability/issues/88
    dragListener.createPanTargetBounds = () => {
      const modelPosition = soccerBall.positionProperty.value;
      const modelBounds = new Bounds2( modelPosition.x - 1, modelPosition.y - 1, modelPosition.x + 1, modelPosition.y + 1 );
      const viewBounds = modelViewTransform.modelToViewBounds( modelBounds );
      return this.parentToGlobalBounds( viewBounds );
    };

    this.addInputListener( dragListener );

    // Prevent dragging or interaction while the object does not have a value (when it is not in the play area yet),
    // when it is animating, if input for this individual node is disabled, or if input for all the object nodes
    // has been disabled
    Multilink.multilink(
      [ soccerBall.soccerBallPhaseProperty, soccerBall.valueProperty, soccerBall.enabledProperty, soccerBallsEnabledProperty ],
      ( mode, value, selfInputEnabled, objectsInputEnabled ) => {
        const inputEnabled = value !== null && mode === SoccerBallPhase.STACKED && selfInputEnabled && objectsInputEnabled;

        // if input is disabled and the ball is in the play area, show the darker version
        const showEnabledSoccerBall = selfInputEnabled && objectsInputEnabled;
        const showDisabledSoccerBall = !showEnabledSoccerBall;
        soccerBallDarkNode.visible = showDisabledSoccerBall;
        soccerBallNode.visible = !showDisabledSoccerBall;

        this.inputEnabled = inputEnabled;
      } );

    this.addChild( soccerBallNodes );

    soccerBall.soccerBallLandedEmitter.addListener( () => {
      this.moveToFront();
    } );

    soccerBall.resetEmitter.addListener( () => {
      this.pickable = false;
      this.mouseArea = Shape.rectangle( 0, 0, 0, 0 );
      this.touchArea = Shape.rectangle( 0, 0, 0, 0 );
    } );

    this.addLinkedElement( soccerBall );
    this.addLinkedElement( soccerBall.enabledProperty );
    this.addLinkedElement( soccerBallsEnabledProperty );
    super.addDebugText( soccerBall );
  }
}
