// Copyright 2018-2026, University of Colorado Boulder

/**
 * Displays a rectangular slice of area.
 *
 * @author Jonathan Olson (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../../dot/js/Dimension2.js';
import merge from '../../../../../phet-core/js/merge.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../../scenery/js/nodes/Rectangle.js';
import ColorDef from '../../../../../scenery/js/util/ColorDef.js';
import FractionsCommonConstants from '../../../common/FractionsCommonConstants.js';
import FractionsCommonColors from '../../../common/view/FractionsCommonColors.js';
import RectangularOrientation from '../RectangularOrientation.js';

// constants
const HORIZONTAL_SIZE = new Dimension2( 200, 40 );
const VERTICAL_SIZE = new Dimension2( 90, 160 );

class RectangularNode extends Node {
  /**
   * @param {number} denominator
   * @param {Object} [options]
   */
  constructor( denominator, options ) {
    assert && assert( typeof denominator === 'number' );

    options = merge( {
      // {boolean} - If true, this node will have a permanent drop shadow added
      dropShadow: false,

      // {RectangularOrientation}
      rectangularOrientation: RectangularOrientation.VERTICAL_SIZE,

      // {ColorDef} - If non-null, it will override the given color
      colorOverride: null
    }, options );

    assert && assert( typeof options.dropShadow === 'boolean' );
    assert && assert( RectangularOrientation.includes( options.rectangularOrientation ) );
    assert && assert( ColorDef.isColorDef( options.colorOverride ) );

    super();

    const size = RectangularNode.getSize( options.rectangularOrientation );
    let rectWidth = size.width;
    let rectHeight = size.height;
    if ( options.rectangularOrientation === RectangularOrientation.VERTICAL ) {
      rectHeight /= denominator;
    }
    else {
      rectWidth /= denominator;
    }

    const defaultColor = options.rectangularOrientation === RectangularOrientation.HORIZONTAL
                         ? FractionsCommonColors.introHorizontalBarProperty
                         : FractionsCommonColors.introVerticalBarProperty;

    const mainRectangle = new Rectangle( {
      rectX: -rectWidth / 2,
      rectY: -rectHeight / 2,
      rectWidth: rectWidth,
      rectHeight: rectHeight,
      fill: options.colorOverride ? options.colorOverride : defaultColor,
      stroke: 'black'
    } );

    const shadowRectangle = new Rectangle( {
      center: mainRectangle.center.plusScalar( FractionsCommonConstants.INTRO_DROP_SHADOW_OFFSET ),
      rectWidth: rectWidth,
      rectHeight: rectHeight,
      fill: FractionsCommonColors.introShapeShadowProperty
    } );

    this.children = [
      ...( options.dropShadow ? [
        shadowRectangle
      ] : [] ),
      mainRectangle
    ];

    this.mutate( options );
  }

  /**
   * Returns the size of the rectangle for a given orientation.
   * @public
   *
   * @param {RectangularOrientation}
   * @returns {Dimension2}
   */
  static getSize( orientation ) {
    assert && assert( RectangularOrientation.includes( orientation ) );

    if ( orientation === RectangularOrientation.VERTICAL ) {
      return VERTICAL_SIZE;
    }
    else {
      return HORIZONTAL_SIZE;
    }
  }
}

export default RectangularNode;
