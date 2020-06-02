// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

module.exports = {
    env: {
      browser: true,
      jest: true,
      jasmine: true,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', 'json', '.tsx','.jsx','.less'],
        },
      },
    },
    extends: ['react-app', 'airbnb', 'prettier', 'prettier/react'],
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          project: './tsconfig.json',
          tsconfigRootDir: '.',
        },
        plugins: ['@typescript-eslint'],
        rules: {
          'no-unused-vars': 0,
          '@typescript-eslint/interface-name-prefix': ['error', 'always'],
          '@typescript-eslint/no-unused-vars': 1,
        },
      },
    ],
    rules: {
      /* general */
      'arrow-parens': [1, 'as-needed'],
      'comma-dangle': 0,
      'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      'no-continue': 0,
      'no-plusplus': 0,
      'no-self-compare': 0,
      'no-underscore-dangle': 0,
      'prefer-destructuring': 0,
  
      /* jsx */
      'jsx-a11y/anchor-is-valid': 0,
      'jsx-a11y/click-events-have-key-events': 0,
      'jsx-a11y/href-no-hash': 0,
      'jsx-a11y/interactive-supports-focus': 0,
      'jsx-a11y/label-has-associated-control': 0,
      'jsx-a11y/label-has-for': 0,
      'jsx-a11y/mouse-events-have-key-events': 0,
      'jsx-a11y/no-static-element-interactions': 1,
  
      /* react */
      'react/destructuring-assignment': 0,
      'react/jsx-curly-brace-presence': ['error', 'never'],
      'react/jsx-filename-extension': 0,
      'react/forbid-prop-types': 1,
      'react/require-default-props': 1,
      'react/no-array-index-key': 1,
      'react/sort-comp': [
        2,
        {
          order: [
            'type-annotations',
            'statics',
            'state',
            'propTypes',
            'static-methods',
            'instance-variables',
            'constructor',
            'lifecycle',
            'everything-else',
            '/^on.+$/',
            'render',
          ],
        },
      ],
  
      /* import */
      'import/prefer-default-export': 0,
      'import/no-named-default': 0,
      'import/extensions': 0,
    },
  };
  