// Copyright (c) 2017 Uber Technologies, Inc.
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

import { trackEvent } from '../../utils/tracking';
import getTrackFilter from '../../utils/tracking/getTrackFilter';

// export for tests
export const CATEGORY_FILTER = 'jaeger/ux/trace/filter';
export const CATEGORY_MATCH_INTERACTIONS = 'jaeger/ux/trace/match-interactions';
export const CATEGORY_RANGE = 'jaeger/ux/trace/range';

// export for tests
export const ACTION_FOCUS = 'focus';
export const ACTION_NEXT = 'next';
export const ACTION_PREV = 'previous';
export const ACTION_RANGE_REFRAME = 'reframe';
export const ACTION_RANGE_SHIFT = 'shift';

export const trackFilter = getTrackFilter(CATEGORY_FILTER);

export function trackFocusMatches() {
  trackEvent(CATEGORY_MATCH_INTERACTIONS, ACTION_FOCUS);
}

export function trackNextMatch() {
  trackEvent(CATEGORY_MATCH_INTERACTIONS, ACTION_NEXT);
}

export function trackPrevMatch() {
  trackEvent(CATEGORY_MATCH_INTERACTIONS, ACTION_PREV);
}

function getRangeAction(current: [number, number], next: [number, number]) {
  const [curStart, curEnd] = current;
  const [nxStart, nxEnd] = next;
  if (curStart === nxStart || curEnd === nxEnd) {
    return ACTION_RANGE_SHIFT;
  }
  const dStart = (curStart - nxStart).toPrecision(7);
  const dEnd = (curEnd - nxEnd).toPrecision(7);
  if (dStart === dEnd) {
    return ACTION_RANGE_SHIFT;
  }
  return ACTION_RANGE_REFRAME;
}

export function trackRange(source: string, current: [number, number], next: [number, number]) {
  const action = getRangeAction(current, next);
  trackEvent(CATEGORY_RANGE, action, source);
}
