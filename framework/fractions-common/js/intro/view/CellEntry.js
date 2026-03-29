// Copyright 2018-2026, University of Colorado Boulder

/**
 * Tracks a cell and it's corresponding view node, and handles visibility.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

class CellEntry {
  /**
   * @param {Cell} cell
   * @param {Node} node
   */
  constructor( cell, node ) {
    // @public {Cell}
    this.cell = cell;

    // @public {Node}
    this.node = node;

    // @private {function}

    this.visibilityListener = visible => {node.visible = visible;};
    this.cell.appearsFilledProperty.link( this.visibilityListener );
  }

  /**
   * Releases references.
   * @public
   */
  dispose() {
    this.cell.appearsFilledProperty.unlink( this.visibilityListener );
  }
}

export default CellEntry;
