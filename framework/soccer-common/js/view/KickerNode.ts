// Copyright 2023-2026, University of Colorado Boulder

/**
 * Shows a cartoon representation of a soccer player (aka kicker) which will kick a ball.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../phetcommon/js/view/ModelViewTransform2.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node, { NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Kicker from '../model/Kicker.js';
import { KickerPhase } from '../model/KickerPhase.js';
import Pose from '../model/Pose.js';
import { KickerImageSet } from './KickerImageSets.js';

type SelfOptions = EmptySelfOptions;
type KickerNodeOptions = SelfOptions & NodeOptions;

const SCALE = 0.645;

export default class KickerNode extends Node {
  public readonly kicker: Kicker;

  public constructor( kicker: Kicker, kickerImageSet: KickerImageSet, modelViewTransform: ModelViewTransform2, providedOptions?: KickerNodeOptions ) {
    super( {
      isDisposable: false
    } );

    this.kicker = kicker;

    // Load in images for all the kicker poses.
    const standingImageProperty = new Image( kickerImageSet.standingImageProperty );
    const poisedToKickImageProperty = new Image( kickerImageSet.poisedToKickImageProperty );
    const kickingImageProperty = new Image( kickerImageSet.kickingImageProperty );

    this.addChild( standingImageProperty );
    this.addChild( poisedToKickImageProperty );
    this.addChild( kickingImageProperty );

    this.setScaleMagnitude( SCALE );

    // Show index when debugging with ?dev
    if ( phet.chipper.queryParameters.dev ) {
      this.addChild( new Text( kicker.initialPlaceInLine, {
        x: 130,
        y: 380,
        scale: 13
      } ) );
    }

    kicker.kickerPhaseProperty.link( phase => {
      this.visible = phase !== KickerPhase.INACTIVE;
    } );

    kicker.poseProperty.link( pose => {
      standingImageProperty.visible = pose === Pose.STANDING;
      poisedToKickImageProperty.visible = pose === Pose.POISED_TO_KICK;
      kickingImageProperty.visible = pose === Pose.KICKING;

    } );

    this.centerBottom = modelViewTransform.modelToViewPosition( new Vector2( 0, 0 ) ).plusXY( -28, 8.5 );


    const options = optionize<KickerNodeOptions, SelfOptions, NodeOptions>()( {
      excludeInvisibleChildrenFromBounds: false,
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    this.mutate( options );
  }
}
