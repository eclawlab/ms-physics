// Copyright 2024-2026, University of Colorado Boulder
/**
 * This is a function that simplifies creation for value readouts in soccer common repos. When there are no data points
 * and the value is calculated as null the readout will display the unknownStringProperty. If the value is not null,
 * the readout will display the value with the patternStringProperty.
 *
 * patternStringProperty must use {{value}} as the placeholder for the value.
 *
 * @author Marla Schulz (PhET Interactive Simulations)
 *
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { toFixed } from '../../../dot/js/util/toFixed.js';


const createValueReadoutStringProperty = (
  valueProperty: TReadOnlyProperty<number | null>,
  patternStringProperty: TReadOnlyProperty<string>,
  unknownStringProperty: TReadOnlyProperty<string>,
  decimalPlaces: number | null,
  additionalDependencies?: TReadOnlyProperty<unknown>[]
): TReadOnlyProperty<string> => {

  const valuePatternStringProperty = new PatternStringProperty( patternStringProperty, {
    value: valueProperty
  }, {
    maps: {
      value: value => value === null ? 'null' : typeof decimalPlaces === 'number' ? toFixed( value, decimalPlaces ) : value
    }
  } );
  return DerivedProperty.deriveAny( [ unknownStringProperty, valueProperty, valuePatternStringProperty,
    ...( additionalDependencies ? additionalDependencies : [] ) ], () => {
    const result = valueProperty.value;
    return result === null ? unknownStringProperty.value : valuePatternStringProperty.value;
  } );
};

export default createValueReadoutStringProperty;
