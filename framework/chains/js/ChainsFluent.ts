// Copyright 2025-2026, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from chains-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import { TReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import FluentLibrary from '../../chipper/js/browser-and-node/FluentLibrary.js';
import FluentConstant from '../../chipper/js/browser/FluentConstant.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
import type {FluentVariable} from '../../chipper/js/browser/FluentPattern.js';
import FluentPattern from '../../chipper/js/browser/FluentPattern.js';
import chains from './chains.js';
import ChainsStrings from './ChainsStrings.js';

// This map is used to create the fluent file and link to all StringProperties.
// Accessing StringProperties is also critical for including them in the built sim.
// However, if strings are unused in Fluent system too, they will be fully excluded from
// the build. So we need to only add actually used strings.
const fluentKeyToStringPropertyMap = new Map();

const addToMapIfDefined = ( key: string, path: string ) => {
  const sp = _.get( ChainsStrings, path );
  if ( sp ) {
    fluentKeyToStringPropertyMap.set( key, sp );
  }
};

addToMapIfDefined( 'chains_title', 'chains.titleStringProperty' );
addToMapIfDefined( 'screen_chains', 'screen.chainsStringProperty' );
addToMapIfDefined( 'screen_directional', 'screen.directionalStringProperty' );
addToMapIfDefined( 'plainString', 'plainStringStringProperty' );
addToMapIfDefined( 'multilineString', 'multilineStringStringProperty' );
addToMapIfDefined( 'htmlString', 'htmlStringStringProperty' );
addToMapIfDefined( 'size', 'sizeStringProperty' );
addToMapIfDefined( 'nestedLevel1_nestedLevel2_message', 'nestedLevel1.nestedLevel2.messageStringProperty' );
addToMapIfDefined( 'directional_units', 'directional.unitsStringProperty' );
addToMapIfDefined( 'directional_celcius', 'directional.celciusStringProperty' );
addToMapIfDefined( 'directional_currency', 'directional.currencyStringProperty' );
addToMapIfDefined( 'directional_word', 'directional.wordStringProperty' );
addToMapIfDefined( 'a11y_nested_constant', 'a11y.nested.constantStringProperty' );
addToMapIfDefined( 'a11y_nested_fluentReference', 'a11y.nested.fluentReferenceStringProperty' );
addToMapIfDefined( 'a11y_nested_fluentVariable', 'a11y.nested.fluentVariableStringProperty' );
addToMapIfDefined( 'a11y_nested_selector', 'a11y.nested.selectorStringProperty' );
addToMapIfDefined( 'a11y_nested_cascade', 'a11y.nested.cascadeStringProperty' );

// A function that creates contents for a new Fluent file, which will be needed if any string changes.
const createFluentFile = (): string => {
  let ftl = '';
  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {
    ftl += `${key} = ${FluentLibrary.formatMultilineForFtl( stringProperty.value )}\n`;
  }
  return ftl;
};

const fluentSupport = new FluentContainer( createFluentFile, Array.from(fluentKeyToStringPropertyMap.values()) );

const ChainsFluent = {
  chains: {
    titleStringProperty: _.get( ChainsStrings, 'chains.titleStringProperty' )
  },
  screen: {
    chainsStringProperty: _.get( ChainsStrings, 'screen.chainsStringProperty' ),
    directionalStringProperty: _.get( ChainsStrings, 'screen.directionalStringProperty' )
  },
  plainStringStringProperty: _.get( ChainsStrings, 'plainStringStringProperty' ),
  multilineStringStringProperty: _.get( ChainsStrings, 'multilineStringStringProperty' ),
  htmlStringStringProperty: _.get( ChainsStrings, 'htmlStringStringProperty' ),
  patternStringStringProperty: _.get( ChainsStrings, 'patternStringStringProperty' ),
  namedPlaceholdersStringStringProperty: _.get( ChainsStrings, 'namedPlaceholdersStringStringProperty' ),
  sizeStringProperty: _.get( ChainsStrings, 'sizeStringProperty' ),
  nestedLevel1: {
    nestedLevel2: {
      messageStringProperty: _.get( ChainsStrings, 'nestedLevel1.nestedLevel2.messageStringProperty' )
    }
  },
  directional: {
    valuePatternStringProperty: _.get( ChainsStrings, 'directional.valuePatternStringProperty' ),
    valueSignPatternStringProperty: _.get( ChainsStrings, 'directional.valueSignPatternStringProperty' ),
    valueUnitsPatternStringProperty: _.get( ChainsStrings, 'directional.valueUnitsPatternStringProperty' ),
    valueSignUnitsPatternStringProperty: _.get( ChainsStrings, 'directional.valueSignUnitsPatternStringProperty' ),
    signValueCurrencyPatternStringProperty: _.get( ChainsStrings, 'directional.signValueCurrencyPatternStringProperty' ),
    signCurrencyValuePatternStringProperty: _.get( ChainsStrings, 'directional.signCurrencyValuePatternStringProperty' ),
    wordParenthesesColonValuePatternStringProperty: _.get( ChainsStrings, 'directional.wordParenthesesColonValuePatternStringProperty' ),
    subscriptsAndSuperscriptsPatternStringProperty: _.get( ChainsStrings, 'directional.subscriptsAndSuperscriptsPatternStringProperty' ),
    wordEqualsSignCurrencyValuePatternStringProperty: _.get( ChainsStrings, 'directional.wordEqualsSignCurrencyValuePatternStringProperty' ),
    unitsStringProperty: _.get( ChainsStrings, 'directional.unitsStringProperty' ),
    celciusStringProperty: _.get( ChainsStrings, 'directional.celciusStringProperty' ),
    currencyStringProperty: _.get( ChainsStrings, 'directional.currencyStringProperty' ),
    wordStringProperty: _.get( ChainsStrings, 'directional.wordStringProperty' )
  },
  a11y: {
    nested: {
      constantStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_nested_constant', _.get( ChainsStrings, 'a11y.nested.constantStringProperty' ) ),
      fluentReferenceStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_nested_fluentReference', _.get( ChainsStrings, 'a11y.nested.fluentReferenceStringProperty' ) ),
      fluentVariable: new FluentPattern<{ variable: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_nested_fluentVariable', _.get( ChainsStrings, 'a11y.nested.fluentVariableStringProperty' ), [{"name":"variable"}] ),
      selector: new FluentPattern<{ activityLevel: 'calm' | 'active' | 'activeAndPaused' | TReadOnlyProperty<'calm' | 'active' | 'activeAndPaused'> }>( fluentSupport.bundleProperty, 'a11y_nested_selector', _.get( ChainsStrings, 'a11y.nested.selectorStringProperty' ), [{"name":"activityLevel","variants":["calm","active","activeAndPaused"]}] ),
      cascade: new FluentPattern<{ activityLevel: 'calm' | 'active' | 'activeAndPaused' | TReadOnlyProperty<'calm' | 'active' | 'activeAndPaused'> }>( fluentSupport.bundleProperty, 'a11y_nested_cascade', _.get( ChainsStrings, 'a11y.nested.cascadeStringProperty' ), [{"name":"activityLevel","variants":["calm","active","activeAndPaused"]}] )
    }
  }
};

export default ChainsFluent;

chains.register('ChainsFluent', ChainsFluent);
