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

import React from 'react';
import { shallow } from 'enzyme';

import highlightMatches from './highlightMatches';

describe('highlightMatches(query, text)', () => {
  const tests = [
    {
      message: 'matches the start of the text: [eg]g ego',
      query: 'eg',
      text: 'egg ego',
    },
    {
      message: 'matches the start of a word: kebabcase-[ca]se',
      query: 'ca',
      text: 'kebabcase-case',
    },
    {
      message: 'matches the start of a word: camelcase[Cas]e',
      query: 'cas',
      text: 'camelcaseCase',
    },
    {
      message: 'matches the acronym: [e]xactly [e]xact sleek bespoke',
      query: 'ee',
      text: 'exactly exact sleek bespoke',
    },
    {
      message: 'matches the acronym: [e]xactly[E]xactSleekBespoke',
      query: 'ee',
      text: 'exactlyExactSleekBespoke',
    },
    {
      message: 'matches contains: been-kat-br[eak]able',
      query: 'eak',
      text: 'been-kat-breakable',
    },
    {
      message: 'matches letters, in sequence: h[i]ghl[i]ght[i]ng-the-th[i]ngs',
      query: 'iiii',
      text: 'highlighting-the-things',
    },
  ];

  tests.forEach(info => {
    const { message, query, text } = info;
    it(message, () => {
      const wrapper = shallow(<span>{highlightMatches(query, text)}</span>);
      expect(wrapper).toMatchSnapshot();
    });
  });

  it('does nothing with an empty query', () => {
    expect(highlightMatches('', 'easy-going')).toBe('easy-going');
  });

  it('does nothing with empty text', () => {
    expect(highlightMatches('query', '')).toBe('');
  });

  it('does returns the text when there nothing matches', () => {
    expect(highlightMatches('query', '123')).toBe('123');
  });
});
