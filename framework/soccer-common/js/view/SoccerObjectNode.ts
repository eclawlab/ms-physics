// Copyright 2023-2026, University of Colorado Boulder

/**
 * SoccerObjectNode represents a base class for visual nodes related to soccer objects, specifically `SoccerBallNode` and
 * `DataPointNode`.
 *
 * - Manages and translates the position of a soccer ball object.
 * - Handles the opacity of the soccer object based on its phase and value.
 * - Integrates with InteractiveHighlightingNode for interactive highlights.
 * - Offers debugging tools for the development phase.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import Vector2 from '../../../dot/js/Vector2.js';
import optionize from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import InteractiveHighlightingNode from '../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import { NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import PhetioObject from '../../../tandem/js/PhetioObject.js';
import SoccerBall from '../model/SoccerBall.js';
import { SoccerBallPhase } from '../model/SoccerBallPhase.js';

type SelfOptions = {
  // defines how a soccerObject's model position is translated to the view according to any sim specific requirements.
  translationStrategy?: ( position: Vector2 ) => void;
};

export type SoccerObjectNodeOptions =
  SelfOptions

  // Take all options from NodeOptions, but do not allow passing through inputEnabledProperty since it requires special handling in multilink
  & StrictOmit<NodeOptions, 'inputEnabledProperty'>
  & PickRequired<NodeOptions, 'tandem'>;

export default class SoccerObjectNode extends InteractiveHighlightingNode {
  protected constructor( public readonly soccerBall: SoccerBall,
                         modelViewTransform: ModelViewTransform2,
                         providedOptions?: SoccerObjectNodeOptions ) {

    const options = optionize<SoccerObjectNodeOptions, SelfOptions, NodeOptions>()( {
      cursor: 'pointer',
      translationStrategy: ( position: Vector2 ) => {
        this.translation = modelViewTransform.modelToViewPosition( position );
      },
      isDisposable: false
    }, providedOptions );
    super( options );

    soccerBall.positionProperty.link( position => {
      options.translationStrategy( position );
    } );

    // The initial ready-to-kick ball is full opacity. The rest of the balls waiting to be kicked are lower opacity so
    // they don't look like part of the data set, but still look kickable.
    Multilink.multilink( [ soccerBall.valueProperty, soccerBall.soccerBallPhaseProperty ],
      ( value, soccerBallPhase ) => {
        this.opacity = ( value === null && soccerBallPhase === SoccerBallPhase.READY && !soccerBall.isFirstSoccerBall ) ? 0.4 : 1;
      } );
  }

  public addDebugText( soccerBall: SoccerBall ): void {
    // Show index when debugging with ?dev
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Text( soccerBall.index + '', {
        font: new PhetFont( 14 ),
        fill: 'red',
        x: this.width / 2 + 1
      } ) );
    }
  }

  /**
   * For phet-io.  This enables the correct linkage in PhET-iO Studio between the soccer balls and their corresponding
   * model elements.
   */
  public override getCorrespondingLinkedElement(): PhetioObject | 'noCorrespondingLinkedElement' {
    return this.soccerBall;
  }
}
