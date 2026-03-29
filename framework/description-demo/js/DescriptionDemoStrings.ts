// Copyright 2024-2026, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import descriptionDemo from './descriptionDemo.js';

type StringsType = {
  'description-demo': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'nameStringProperty': LocalizedStringProperty;
  }
};

const DescriptionDemoStrings = getStringModule( 'DESCRIPTION_DEMO' ) as StringsType;

descriptionDemo.register( 'DescriptionDemoStrings', DescriptionDemoStrings );

export default DescriptionDemoStrings;
