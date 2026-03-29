// Copyright 2018-2026, University of Colorado Boulder

/**
 * Demonstrates using a class with inheritance
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';

class WilderNode extends Node {
  public constructor( providedOptions?: NodeOptions ) {
    const options = optionize<NodeOptions, EmptySelfOptions, NodeOptions>()( {
      children: [ new Text( 'Hello upside-down world!', { font: new PhetFont( 30 ) } ) ]
    }, providedOptions );
    super( options );
  }

  /**
   * Rotates the node by PI, demonstrates a class method.
   */
  public flipOver(): void {
    this.rotate( Math.PI );
  }
}

export default WilderNode;
