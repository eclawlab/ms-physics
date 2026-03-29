// Copyright 2023-2026, University of Colorado Boulder

/**
 * This class defines the various poses a Kicker can assume during the animation lifecycle. The poses include standing,
 * poised to kick, and kicking.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';

export default class Pose extends EnumerationValue {
  public static readonly STANDING = new Pose();
  public static readonly POISED_TO_KICK = new Pose();
  public static readonly KICKING = new Pose();

  public static readonly enumeration = new Enumeration( Pose );
}
