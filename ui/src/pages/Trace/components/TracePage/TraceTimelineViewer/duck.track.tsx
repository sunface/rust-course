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

import { Store } from 'redux';
import { Action } from 'redux-actions';

import { actionTypes as types, TSpanIdValue, TSpanIdLogValue, TWidthValue } from './duck';
import DetailState from './SpanDetail/DetailState';
import { ReduxState } from '../../../types';
import { trackEvent } from '../../../utils/tracking';
import { getToggleValue } from '../../../utils/tracking/common';

type TSpanIdHooks = {
  [actionType: string]: (store: Store<ReduxState>, action: Action<TSpanIdValue>) => void;
};

const ACTION_RESIZE = 'resize';
const ACTION_COLLAPSE_ALL = 'collapse-all';
const ACTION_COLLAPSE_ONE = 'collapse-one';
const ACTION_EXPAND_ALL = 'expand-all';
const ACTION_EXPAND_ONE = 'expand-one';

const CATEGORY_BASE = 'jaeger/ux/trace/timeline';
// export for tests
export const CATEGORY_COLUMN = `${CATEGORY_BASE}/column`;
export const CATEGORY_EXPAND_COLLAPSE = `${CATEGORY_BASE}/expand-collapse`;
export const CATEGORY_LOGS = `${CATEGORY_BASE}/logs`;
export const CATEGORY_LOGS_ITEM = `${CATEGORY_BASE}/logs/item`;
export const CATEGORY_PARENT = `${CATEGORY_BASE}/parent`;
export const CATEGORY_PROCESS = `${CATEGORY_BASE}/process`;
export const CATEGORY_ROW = `${CATEGORY_BASE}/row`;
export const CATEGORY_TAGS = `${CATEGORY_BASE}/tags`;

function getDetail(store: Store<ReduxState>, { payload }: Action<TSpanIdValue | TSpanIdLogValue>) {
  return payload ? store.getState().traceTimeline.detailStates.get(payload.spanID) : undefined;
}

function trackDetailState(
  store: Store<ReduxState>,
  action: Action<TSpanIdValue | TSpanIdLogValue>,
  trackFn: (detailState: DetailState) => void
) {
  const detailState = getDetail(store, action);
  if (detailState) {
    trackFn(detailState);
  }
}

function trackParent(store: Store<ReduxState>, { payload }: Action<TSpanIdValue>) {
  if (!payload) {
    return;
  }
  const st = store.getState();
  const traceID = st.traceTimeline.traceID;
  if (!traceID) {
    return;
  }
  const { spanID } = payload;
  const isHidden = st.traceTimeline.childrenHiddenIDs.has(spanID);
  const trace = st.trace.traces[traceID] || st.trace.traces[traceID.replace(/^0*/, '')];
  if (!trace || !trace.data) {
    return;
  }
  const span = trace.data.spans.find(sp => sp.spanID === spanID);
  if (span) {
    trackEvent(CATEGORY_PARENT, getToggleValue(!isHidden), span.depth);
  }
}

function trackLogsItem(store: Store<ReduxState>, action: Action<TSpanIdLogValue>) {
  const detail = getDetail(store, action);
  const { payload } = action;
  if (!detail || !payload || !('logItem' in payload)) {
    return;
  }
  const { logItem } = payload;
  const isOpen = Boolean(detail.logs.openedItems.has(logItem));
  trackEvent(CATEGORY_LOGS_ITEM, getToggleValue(isOpen));
}

const trackColumnWidth = (_: any, { payload }: Action<TWidthValue>) =>
  payload && trackEvent(CATEGORY_COLUMN, ACTION_RESIZE, Math.round(payload.width * 1000));
const trackDetailRow = (isOpen: boolean) => trackEvent(CATEGORY_ROW, getToggleValue(isOpen));
const trackLogs = (detail: DetailState) => trackEvent(CATEGORY_LOGS, getToggleValue(detail.logs.isOpen));
const trackProcess = (detail: DetailState) =>
  trackEvent(CATEGORY_PROCESS, getToggleValue(detail.isProcessOpen));
const trackTags = (detail: DetailState) => trackEvent(CATEGORY_TAGS, getToggleValue(detail.isTagsOpen));

const hooks: TSpanIdHooks = {
  [types.CHILDREN_TOGGLE]: trackParent,
  [types.DETAIL_TOGGLE]: (store, action) => trackDetailRow(Boolean(getDetail(store, action))),
  [types.DETAIL_TAGS_TOGGLE]: (store, action) => trackDetailState(store, action, trackTags),
  [types.DETAIL_PROCESS_TOGGLE]: (store, action) => trackDetailState(store, action, trackProcess),
  [types.DETAIL_LOGS_TOGGLE]: (store, action) => trackDetailState(store, action, trackLogs),
};

export const middlewareHooks = {
  ...hooks,
  [types.COLLAPSE_ALL]: () => trackEvent(CATEGORY_EXPAND_COLLAPSE, ACTION_COLLAPSE_ALL),
  [types.COLLAPSE_ONE]: () => trackEvent(CATEGORY_EXPAND_COLLAPSE, ACTION_COLLAPSE_ONE),
  [types.DETAIL_LOG_ITEM_TOGGLE]: trackLogsItem,
  [types.EXPAND_ALL]: () => trackEvent(CATEGORY_EXPAND_COLLAPSE, ACTION_EXPAND_ALL),
  [types.EXPAND_ONE]: () => trackEvent(CATEGORY_EXPAND_COLLAPSE, ACTION_EXPAND_ONE),
  [types.SET_SPAN_NAME_COLUMN_WIDTH]: trackColumnWidth,
};
