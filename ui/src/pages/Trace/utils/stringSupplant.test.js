// Copyright (c) 2020 The Jaeger Authors.
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

import stringSupplant, { encodedStringSupplant, getParamNames } from './stringSupplant';

describe('stringSupplant', () => {
  const value0 = 'val0';
  const value1 = 'val1';

  it('replaces values', () => {
    expect(stringSupplant('key0: #{value0}; key1: #{value1}', { value0, value1 })).toBe(
      `key0: ${value0}; key1: ${value1}`
    );
  });

  it('omits missing values', () => {
    expect(stringSupplant('key0: #{value0}; key1: #{value1}', { value0 })).toBe(`key0: ${value0}; key1: `);
  });

  describe('encodedStringSupplant', () => {
    it('encodes present values', () => {
      const reverse = str =>
        str
          .split('')
          .reverse()
          .join('');
      const encodeFn = jest.fn(reverse);
      expect(encodedStringSupplant('key0: #{value0}; key1: #{value1}', encodeFn, { value0, value1 })).toBe(
        `key0: ${reverse(value0)}; key1: ${reverse(value1)}`
      );

      const callCount = encodeFn.mock.calls.length;
      encodedStringSupplant('key0: #{value0}; key1: #{value1}', encodeFn, { value0 });
      expect(encodeFn.mock.calls.length).toBe(callCount + 1);
    });
  });
});

describe('getParamNames', () => {
  it('gets unique names', () => {
    const name0 = 'name 0';
    const name1 = 'name 1';
    expect(getParamNames(`foo #{${name0}} bar #{${name1}} baz #{${name0}}`)).toEqual([name0, name1]);
  });
});
