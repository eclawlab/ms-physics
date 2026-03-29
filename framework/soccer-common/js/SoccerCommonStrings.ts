// Copyright 2024-2026, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import soccerCommon from './soccerCommon.js';

type StringsType = {
  'needAtLeastOneKickStringProperty': LocalizedStringProperty;
  'kickStringProperty': LocalizedStringProperty;
  'keyboardHelpDialog': {
    'grabOrReleaseItemHeadingStringProperty': LocalizedStringProperty;
    'grabOrReleaseItemStringProperty': LocalizedStringProperty;
    'moveHeadingStringProperty': LocalizedStringProperty;
    'moveDescriptionStringProperty': LocalizedStringProperty;
  };
  'a11y': {
    'grabSoccerBallStringProperty': LocalizedStringProperty;
    'noSoccerBallsToGrabStringProperty': LocalizedStringProperty;
    'sortingSoccerBallPatternStringProperty': LocalizedStringProperty;
    'selectingSoccerBallPatternStringProperty': LocalizedStringProperty;
    'soccerBallHelpTextStringProperty': LocalizedStringProperty;
    'movableStringProperty': LocalizedStringProperty;
  }
};

const SoccerCommonStrings = getStringModule( 'SOCCER_COMMON' ) as StringsType;

soccerCommon.register( 'SoccerCommonStrings', SoccerCommonStrings );

export default SoccerCommonStrings;
