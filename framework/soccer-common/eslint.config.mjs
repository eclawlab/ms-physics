// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for soccer-common.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import banTSCommentConfig from '../perennial-alias/js/eslint/config/util/banTSCommentConfig.mjs';
import strictBooleanExpressionsConfig from '../perennial-alias/js/eslint/config/util/strictBooleanExpressionsConfig.mjs';
import simEslintConfig from '../perennial-alias/js/eslint/config/sim.eslint.config.mjs';

export default [
  ...simEslintConfig,
  ...strictBooleanExpressionsConfig,
  ...banTSCommentConfig,
  {
    files: [ '**/*.ts' ],
    rules: {
      'phet/additional-bad-text': [
        'error',
        {
          forbiddenTextObjects: [
            'dispose',
            '../center-and-variability/js'
          ]
        }
      ]
    }
  }
];
