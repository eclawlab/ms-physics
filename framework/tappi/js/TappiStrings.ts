// Copyright 2020-2026, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import tappi from './tappi.js';

type StringsType = {
  'tappi': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'basicsStringProperty': LocalizedStringProperty;
    'patternsStringProperty': LocalizedStringProperty;
  }
};

const TappiStrings = getStringModule( 'TAPPI' ) as StringsType;

tappi.register( 'TappiStrings', TappiStrings );

export default TappiStrings;
