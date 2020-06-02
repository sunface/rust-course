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

import _get from 'lodash/get';

const BASE_MATCH_SIZE = 8;
const SCALABLE_MATCH_SIZE = 4;

// TODO: get state type from @plexus
export function setOnEdgesContainer(state: { zoomTransform?: { k: number } }) {
  const { zoomTransform } = state;
  if (!zoomTransform) {
    return null;
  }
  const { k } = zoomTransform;
  const opacity = 0.1 + k * 0.9;
  return { style: { opacity, zIndex: 1, position: 'absolute', pointerEvents: 'none' } };
}

export function setOnNodesContainer(state: { zoomTransform?: { k: number } }) {
  const { zoomTransform } = state;
  const matchSize = BASE_MATCH_SIZE + SCALABLE_MATCH_SIZE / _get(zoomTransform, 'k', 1);
  return {
    style: {
      outline: `transparent solid ${matchSize}px`,
    },
  };
}

export function setOnNode() {
  return {
    style: {
      outline: 'inherit',
    },
  };
}
