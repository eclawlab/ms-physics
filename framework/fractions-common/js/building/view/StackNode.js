// Copyright 2018-2026, University of Colorado Boulder

/**
 * Supertype for views for Stacks.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Node from '../../../../scenery/js/nodes/Node.js';

class StackNode extends Node {
  /**
   * @param {Stack} stack
   * @param {Object} [options]
   */
  constructor( stack, options ) {
    super( {
      pickable: false
    } );

    // @public {Stack}
    this.stack = stack;

    // @public {Bounds2} - The ideal layout bounds for this node (that should be used for layout). This should be
    // defined by the concrete subtype.
    this.layoutBounds = Bounds2.NOTHING;
  }
}

export default StackNode;
