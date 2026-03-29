// Copyright 2023-2026, University of Colorado Boulder

/**
 * KickerPhase is used to identify what part of the kicking phase a Kicker is currently in.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';

export class KickerPhase extends EnumerationValue {
  public static readonly INACTIVE = new KickerPhase();
  public static readonly READY = new KickerPhase();
  public static readonly POISED = new KickerPhase();
  public static readonly KICKING = new KickerPhase();

  public static readonly enumeration = new Enumeration( KickerPhase );
}
