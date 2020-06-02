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

/* eslint-disable import/first */
jest.mock('../../../utils/tracking');

import _set from 'lodash/set';
import _cloneDeep from 'lodash/cloneDeep';

import DetailState from './SpanDetail/DetailState';
import * as track from './duck.track';
import { actionTypes as types } from './duck';
import { fetchedState } from '../../../constants';
import { trackEvent } from '../../../utils/tracking';

describe('middlewareHooks', () => {
  const traceID = 'ABC';
  const spanID = 'abc';
  const spanDepth = 123;
  const columnWidth = { real: 0.15, tracked: 150 };
  const payload = { spanID };
  const state = {
    trace: {
      traces: {
        [traceID]: {
          id: traceID,
          data: { spans: [{ spanID, depth: spanDepth }] },
          state: fetchedState.DONE,
        },
      },
    },
    traceTimeline: {
      traceID,
      childrenHiddenIDs: new Map(),
      detailStates: new Map([[spanID, new DetailState()]]),
    },
  };
  let stateClone;
  const store = {
    getState() {
      return stateClone;
    },
  };

  beforeEach(() => {
    trackEvent.mockClear();
    stateClone = _cloneDeep(state);
  });

  const cases = [
    {
      msg: 'tracks a GA event for resizing the span name column',
      type: types.SET_SPAN_NAME_COLUMN_WIDTH,
      payloadCustom: { width: columnWidth.real },
      category: track.CATEGORY_COLUMN,
      extraTrackArgs: [columnWidth.tracked],
    },
    {
      action: track.ACTION_COLLAPSE_ALL,
      category: track.CATEGORY_EXPAND_COLLAPSE,
      msg: 'tracks a GA event for collapsing all',
      type: types.COLLAPSE_ALL,
    },
    {
      action: track.ACTION_COLLAPSE_ONE,
      category: track.CATEGORY_EXPAND_COLLAPSE,
      msg: 'tracks a GA event for collapsing a level',
      type: types.COLLAPSE_ONE,
    },
    {
      msg: 'tracks a GA event for collapsing a parent',
      type: types.CHILDREN_TOGGLE,
      category: track.CATEGORY_PARENT,
      extraTrackArgs: [123],
    },
    {
      msg: 'handles no payload in trackParent',
      type: types.CHILDREN_TOGGLE,
      payloadCustom: null,
      category: track.CATEGORY_PARENT,
      noOp: true,
    },
    {
      msg: 'handles no traceID in trackParent',
      type: types.CHILDREN_TOGGLE,
      stateOverrides: new Map([['traceTimeline.traceID', null]]),
      category: track.CATEGORY_PARENT,
      noOp: true,
    },
    {
      msg: 'handles no trace data in trackParent',
      type: types.CHILDREN_TOGGLE,
      stateOverrides: new Map([['traceTimeline.traceID', `not-${traceID}`]]),
      category: track.CATEGORY_PARENT,
      noOp: true,
    },
    {
      msg: 'handles missing spanID in trackParent',
      type: types.CHILDREN_TOGGLE,
      payloadCustom: { spanID: 'missing spanID' },
      category: track.CATEGORY_PARENT,
      noOp: true,
    },
    {
      msg: 'handles leading 0s in traceID in trackParent',
      type: types.CHILDREN_TOGGLE,
      stateOverrides: new Map([['traceTimeline.traceID', `00${traceID}`]]),
      category: track.CATEGORY_PARENT,
      extraTrackArgs: [123],
    },
    {
      action: track.ACTION_EXPAND_ALL,
      category: track.CATEGORY_EXPAND_COLLAPSE,
      msg: 'tracks a GA event for expanding all',
      type: types.EXPAND_ALL,
    },
    {
      action: track.ACTION_EXPAND_ONE,
      category: track.CATEGORY_EXPAND_COLLAPSE,
      msg: 'tracks a GA event for expanding a level',
      type: types.EXPAND_ONE,
    },
    {
      msg: 'tracks a GA event for toggling a detail row',
      type: types.DETAIL_TOGGLE,
      category: track.CATEGORY_ROW,
    },
    {
      msg: 'tracks a GA event for toggling the span tags',
      type: types.DETAIL_TAGS_TOGGLE,
      category: track.CATEGORY_TAGS,
    },
    {
      msg: 'tracks a GA event for toggling the span tags',
      type: types.DETAIL_PROCESS_TOGGLE,
      category: track.CATEGORY_PROCESS,
    },
    {
      msg: 'tracks a GA event for toggling the span logs view',
      type: types.DETAIL_LOGS_TOGGLE,
      category: track.CATEGORY_LOGS,
    },
    {
      msg: 'handles no detailState in trackDetailState',
      type: types.DETAIL_TAGS_TOGGLE,
      payloadCustom: { spanID: 'no details here' },
      category: track.CATEGORY_ROW,
      noOp: true,
    },
    {
      msg: 'tracks a GA event for toggling the span logs view',
      type: types.DETAIL_LOG_ITEM_TOGGLE,
      payloadCustom: { ...payload, logItem: {} },
      category: track.CATEGORY_LOGS_ITEM,
    },
    {
      msg: 'handles no payload in trackLogsitem',
      type: types.DETAIL_LOG_ITEM_TOGGLE,
      payloadCustom: null,
      category: track.CATEGORY_LOGS_ITEM,
      noOp: true,
    },
    {
      msg: 'handles no logItem in payload in trackLogsitem',
      type: types.DETAIL_LOG_ITEM_TOGGLE,
      payloadCustom: {},
      category: track.CATEGORY_LOGS_ITEM,
      noOp: true,
    },
    {
      msg: 'handles no logItem in payload in trackLogsitem',
      type: types.DETAIL_LOG_ITEM_TOGGLE,
      payloadCustom: { spanID: 'no details here', logItem: {} },
      category: track.CATEGORY_LOGS_ITEM,
      noOp: true,
    },
  ];

  cases.forEach(
    ({
      action = expect.any(String),
      msg,
      noOp = false,
      stateOverrides = new Map(),
      type,
      category,
      extraTrackArgs = [],
      payloadCustom,
    }) => {
      it(msg, () => {
        const reduxAction = {
          type,
          payload: payloadCustom !== undefined ? payloadCustom : payload,
        };
        stateOverrides.forEach((value, path) => {
          _set(stateClone, path, value);
        });
        track.middlewareHooks[type](store, reduxAction);
        if (noOp) expect(trackEvent).not.toHaveBeenCalled();
        else {
          expect(trackEvent.mock.calls.length).toBe(1);
          expect(trackEvent.mock.calls[0]).toEqual([category, action, ...extraTrackArgs]);
        }
      });
    }
  );

  it('has the correct keys and they refer to functions', () => {
    expect(Object.keys(track.middlewareHooks).sort()).toEqual(
      [
        types.CHILDREN_TOGGLE,
        types.COLLAPSE_ALL,
        types.COLLAPSE_ONE,
        types.DETAIL_TOGGLE,
        types.DETAIL_TAGS_TOGGLE,
        types.DETAIL_PROCESS_TOGGLE,
        types.DETAIL_LOGS_TOGGLE,
        types.DETAIL_LOG_ITEM_TOGGLE,
        types.EXPAND_ALL,
        types.EXPAND_ONE,
        types.SET_SPAN_NAME_COLUMN_WIDTH,
      ].sort()
    );
  });
});
