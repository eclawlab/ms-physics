// Copyright 2023-2026, University of Colorado Boulder

/**
 * NumberLineNode represents a visual representation of a number line, tailored to display data objects with optional
 * features.
 *
 * Features:
 * - Can include tick marks and their respective labels.
 * - Has the flexibility to show or hide the X axis.
 * - Provides customization options such as color and layout.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ChartTransform from '../../../bamboo/js/ChartTransform.js';
import TickLabelSet from '../../../bamboo/js/TickLabelSet.js';
import TickMarkSet from '../../../bamboo/js/TickMarkSet.js';
import Range from '../../../dot/js/Range.js';
import Shape from '../../../kite/js/Shape.js';
import optionize from '../../../phet-core/js/optionize.js';
import Orientation from '../../../phet-core/js/Orientation.js';
import Node, { NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Text from '../../../scenery/js/nodes/Text.js';
import TPaint from '../../../scenery/js/util/TPaint.js';
import { toFixed } from '../../../dot/js/util/toFixed.js';

type SelfOptions = {
  color?: TPaint;
  includeXAxis: boolean;
  showTickMarks?: boolean;
};
export type NumberLineNodeOptions = SelfOptions & NodeOptions;

export default class NumberLineNode extends Node {

  // For layout
  public readonly tickMarkSet: TickMarkSet;

  public constructor(
    chartViewWidth: number,
    physicalRange: Range,
    providedOptions: NumberLineNodeOptions
  ) {


    const options = optionize<NumberLineNodeOptions, SelfOptions, NodeOptions>()( {
      color: 'white',
      isDisposable: false,
      showTickMarks: true,

      // When the Node is instrumented we want clients to be able to toggle visibility.
      // https://github.com/phetsims/mean-share-and-balance/issues/253
      phetioVisiblePropertyInstrumented: !!providedOptions.tandem,
      visiblePropertyOptions: {
        phetioFeatured: !!providedOptions.tandem
      }
    }, providedOptions );

    super();

    // Tick marks on the dot plot are a little shorter than in the play area
    const tickMarkExtent = options.includeXAxis ? 7 : 10;

    const chartTransform = new ChartTransform( {
      viewWidth: chartViewWidth,
      modelXRange: physicalRange,
      viewHeight: tickMarkExtent / 2,
      modelYRange: new Range( 0, 1 )
    } );
    const tickMarkSet = new TickMarkSet( chartTransform, Orientation.HORIZONTAL, 1, {
      stroke: options.color,
      extent: tickMarkExtent,
      visible: options.showTickMarks
    } );
    this.addChild( tickMarkSet );

    this.tickMarkSet = tickMarkSet;

    const tickLabelSet = new TickLabelSet( chartTransform, Orientation.HORIZONTAL, 1, {
      extent: tickMarkExtent + 12,
      createLabel: ( value: number ) => new Text( toFixed( value, 0 ), {
        fontSize: 16,
        fill: options.color
      } )
    } );
    this.addChild( tickLabelSet );

    if ( options.includeXAxis ) {
      const xAxisNode = new Path( new Shape()
        .moveTo( tickMarkSet.left, 0 )
        .lineTo( tickMarkSet.right, 0 ), {
        stroke: options.color
      } );
      this.addChild( xAxisNode );
    }

    this.mutate( options );
  }

}
