// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for binder.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import nodeEslintConfig from '../perennial-alias/js/eslint/config/node.eslint.config.mjs';
import globals from '../perennial-alias/node_modules/globals/index.js';

export default [
  ...nodeEslintConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node
      },
      sourceType: 'module',
      ecmaVersion: 2015,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: '~16.8.6'
      }
    }
  },
  {
    ignores: [
      'docs/**/*',
      'react-binder/**/*'
    ]
  }
];