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

import { setOnNodesContainer, setOnEdgesContainer, setOnNode } from './set-on-graph';

describe('Set on graph utils', () => {
  describe('setOnNodesContainer', () => {
    function getComputedWidth(k) {
      const { style } = setOnNodesContainer({ zoomTransform: k != undefined ? { k } : undefined }); // eslint-disable-line eqeqeq
      return Number.parseInt(style.outline.replace(/[^.\d]/g, ''), 10);
    }

    const SIZE_IDENTITY = 12;

    it('defaults style object with outline width off of 2 if zoomTransform.k is not provided', () => {
      expect(getComputedWidth(null)).toBe(SIZE_IDENTITY);
      expect(getComputedWidth(undefined)).toBe(SIZE_IDENTITY);
    });

    it('calculates style object with outline width at default size if zoomTransform.k is 1', () => {
      expect(getComputedWidth(1)).toBe(SIZE_IDENTITY);
    });

    it('calculates style object with outline width one third larger if zoomTransform.k is .5', () => {
      expect(getComputedWidth(0.5)).toBe((4 / 3) * SIZE_IDENTITY);
    });

    it('calculates style object with outline width two thirds larger if zoomTransform.k is .33', () => {
      expect(getComputedWidth(0.33)).toBe((5 / 3) * SIZE_IDENTITY);
    });

    it('calculates style object with outline width twice as large if zoomTransform.k is .25', () => {
      expect(getComputedWidth(0.25)).toBe(2 * SIZE_IDENTITY);
    });
  });

  describe('setOnEdgesContainer', () => {
    it('returns null if zoomTransform kwarg is falsy', () => {
      expect(setOnEdgesContainer({ zoomTransform: null })).toBe(null);
      expect(setOnEdgesContainer({ zoomTransform: undefined })).toBe(null);
    });

    it('calculates style object with opacity off of zoomTransform.k', () => {
      expect(setOnEdgesContainer({ zoomTransform: { k: 0.0 } }).style.opacity).toBe(0.1);
      expect(setOnEdgesContainer({ zoomTransform: { k: 0.3 } }).style.opacity).toBe(0.37);
      expect(setOnEdgesContainer({ zoomTransform: { k: 0.5 } }).style.opacity).toBe(0.55);
      expect(setOnEdgesContainer({ zoomTransform: { k: 0.7 } }).style.opacity).toBe(0.73);
      expect(setOnEdgesContainer({ zoomTransform: { k: 1.0 } }).style.opacity).toBe(1);
    });
  });

  describe('setOnNode', () => {
    it("inherits container's outline", () => {
      expect(setOnNode()).toEqual({
        style: {
          outline: 'inherit',
        },
      });
    });
  });
});
