// Copyright 2023-2026, University of Colorado Boulder

/**
 * SoccerBallPhase is used to identify what part of the lifecycle a SoccerBall is in.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';

// Represents the phases of a soccer ball's life cycle, from being first initialized to reaching its resting position on the field
export class SoccerBallPhase extends EnumerationValue {

  // The phase in which a soccer ball has not yet been displayed on the field
  public static readonly INACTIVE = new SoccerBallPhase();

  // The phase in which a soccer ball is displayed in front of the kicker, but has not yet been kicked
  public static readonly READY = new SoccerBallPhase();

  // The phase after a soccer ball has been kicked, but before it has landed
  public static readonly FLYING = new SoccerBallPhase();

  // The phase after a soccer ball has landed, but before it has finished animating to the top of the stack
  public static readonly STACKING = new SoccerBallPhase();

  // The phase after a soccer ball has finished animating to the top of the stack
  public static readonly STACKED = new SoccerBallPhase();

  public static readonly enumeration = new Enumeration( SoccerBallPhase );
}
