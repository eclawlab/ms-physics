// Copyright 2018-2026, University of Colorado Boulder

/**
 * Base type for scene nodes.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';

class SceneNode extends Node {
  /**
   * @param {ContainerSetModel} model
   */
  constructor( model ) {
    super();

    // @protected {ContainerSetModel}
    this.model = model;
  }

  /**
   * Steps forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    // Behavior will be added in subtypes
  }
}

export default SceneNode;
