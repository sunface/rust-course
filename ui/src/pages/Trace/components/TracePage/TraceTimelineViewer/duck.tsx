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

import { Action, ActionFunctionAny, createActions, handleActions } from 'redux-actions';

import DetailState from './SpanDetail/DetailState';
import { TNil } from '../../../types';
import { Log, Span, Trace } from '../../../types/trace';
import TTraceTimeline from '../../../types/TTraceTimeline';
import filterSpans from '../../../utils/filter-spans';
import generateActionTypes from '../../../utils/generate-action-types';
import guardReducer from '../../../utils/guardReducer';
import spanAncestorIds from '../../../utils/span-ancestor-ids';

// payloads
export type TSpanIdLogValue = { logItem: Log; spanID: string };
export type TSpanIdValue = { spanID: string };
type TSpansValue = { spans: Span[] };
type TTraceUiFindValue = { trace: Trace; uiFind: string | TNil; allowHide?: boolean };
export type TWidthValue = { width: number };
export type TActionTypes =
  | TSpanIdLogValue
  | TSpanIdValue
  | TSpansValue
  | TTraceUiFindValue
  | TWidthValue
  | {};

type TTimelineViewerActions = {
  [actionName: string]: ActionFunctionAny<Action<TActionTypes>>;
};

function shouldDisableCollapse(allSpans: Span[], hiddenSpansIds: Set<string>) {
  const allParentSpans = allSpans.filter(s => s.hasChildren);
  return allParentSpans.length === hiddenSpansIds.size;
}

export function newInitialState(): TTraceTimeline {
  return {
    childrenHiddenIDs: new Set(),
    detailStates: new Map(),
    hoverIndentGuideIds: new Set(),
    shouldScrollToFirstUiFindMatch: false,
    spanNameColumnWidth: 0.25,
    traceID: null,
  };
}

export const actionTypes = generateActionTypes('@jaeger-ui/trace-timeline-viewer', [
  'ADD_HOVER_INDENT_GUIDE_ID',
  'CHILDREN_TOGGLE',
  'CLEAR_SHOULD_SCROLL_TO_FIRST_UI_FIND_MATCH',
  'COLLAPSE_ALL',
  'COLLAPSE_ONE',
  'DETAIL_TOGGLE',
  'DETAIL_TAGS_TOGGLE',
  'DETAIL_PROCESS_TOGGLE',
  'DETAIL_LOGS_TOGGLE',
  'DETAIL_LOG_ITEM_TOGGLE',
  'DETAIL_WARNINGS_TOGGLE',
  'DETAIL_REFERENCES_TOGGLE',
  'EXPAND_ALL',
  'EXPAND_ONE',
  'FOCUS_UI_FIND_MATCHES',
  'REMOVE_HOVER_INDENT_GUIDE_ID',
  'SET_SPAN_NAME_COLUMN_WIDTH',
  'SET_TRACE',
]);

const fullActions = createActions<TActionTypes>({
  [actionTypes.ADD_HOVER_INDENT_GUIDE_ID]: (spanID: string) => ({ spanID }),
  [actionTypes.CHILDREN_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.CLEAR_SHOULD_SCROLL_TO_FIRST_UI_FIND_MATCH]: () => ({}),
  [actionTypes.COLLAPSE_ALL]: (spans: Span[]) => ({ spans }),
  [actionTypes.COLLAPSE_ONE]: (spans: Span[]) => ({ spans }),
  [actionTypes.DETAIL_LOG_ITEM_TOGGLE]: (spanID: string, logItem: Log) => ({ logItem, spanID }),
  [actionTypes.DETAIL_LOGS_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.EXPAND_ALL]: () => ({}),
  [actionTypes.EXPAND_ONE]: (spans: Span[]) => ({ spans }),
  [actionTypes.DETAIL_PROCESS_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.DETAIL_WARNINGS_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.DETAIL_REFERENCES_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.DETAIL_TAGS_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.DETAIL_TOGGLE]: (spanID: string) => ({ spanID }),
  [actionTypes.FOCUS_UI_FIND_MATCHES]: (trace: Trace, uiFind: string | TNil, allowHide?: boolean) => ({
    trace,
    uiFind,
    allowHide,
  }),
  [actionTypes.REMOVE_HOVER_INDENT_GUIDE_ID]: (spanID: string) => ({ spanID }),
  [actionTypes.SET_SPAN_NAME_COLUMN_WIDTH]: (width: number) => ({ width }),
  [actionTypes.SET_TRACE]: (trace: Trace, uiFind: string | TNil) => ({ trace, uiFind }),
});

export const actions = (fullActions as any).jaegerUi.traceTimelineViewer as TTimelineViewerActions;

function calculateFocusedFindRowStates(uiFind: string, spans: Span[], allowHide: boolean = true) {
  const spansMap = new Map();
  const childrenHiddenIDs: Set<string> = new Set();
  const detailStates: Map<string, DetailState> = new Map();
  let shouldScrollToFirstUiFindMatch: boolean = false;

  spans.forEach(span => {
    spansMap.set(span.spanID, span);
    if (allowHide) {
      childrenHiddenIDs.add(span.spanID);
    }
  });
  const matchedSpanIds = filterSpans(uiFind, spans);
  if (matchedSpanIds && matchedSpanIds.size) {
    matchedSpanIds.forEach(spanID => {
      const span = spansMap.get(spanID);
      detailStates.set(spanID, new DetailState());
      spanAncestorIds(span).forEach(ancestorID => childrenHiddenIDs.delete(ancestorID));
    });
    shouldScrollToFirstUiFindMatch = true;
  }
  return {
    childrenHiddenIDs,
    detailStates,
    shouldScrollToFirstUiFindMatch,
  };
}

function focusUiFindMatches(state: TTraceTimeline, { uiFind, trace, allowHide }: TTraceUiFindValue) {
  if (!uiFind) return state;
  return {
    ...state,
    ...calculateFocusedFindRowStates(uiFind, trace.spans, allowHide),
  };
}

function clearShouldScrollToFirstUiFindMatch(state: TTraceTimeline) {
  if (state.shouldScrollToFirstUiFindMatch) {
    return { ...state, shouldScrollToFirstUiFindMatch: false };
  }
  return state;
}

function setTrace(state: TTraceTimeline, { uiFind, trace }: TTraceUiFindValue) {
  const { traceID, spans } = trace;
  if (traceID === state.traceID) {
    return state;
  }
  const { spanNameColumnWidth } = state;

  return Object.assign(
    { ...newInitialState(), spanNameColumnWidth, traceID },
    uiFind ? calculateFocusedFindRowStates(uiFind, spans) : null
  );
}

function setColumnWidth(state: TTraceTimeline, { width }: TWidthValue): TTraceTimeline {
  return { ...state, spanNameColumnWidth: width };
}

function childrenToggle(state: TTraceTimeline, { spanID }: TSpanIdValue): TTraceTimeline {
  const childrenHiddenIDs = new Set(state.childrenHiddenIDs);
  if (childrenHiddenIDs.has(spanID)) {
    childrenHiddenIDs.delete(spanID);
  } else {
    childrenHiddenIDs.add(spanID);
  }
  return { ...state, childrenHiddenIDs };
}

export function expandAll(state: TTraceTimeline): TTraceTimeline {
  const childrenHiddenIDs = new Set<string>();
  return { ...state, childrenHiddenIDs };
}

export function collapseAll(state: TTraceTimeline, { spans }: TSpansValue) {
  if (shouldDisableCollapse(spans, state.childrenHiddenIDs)) {
    return state;
  }
  const childrenHiddenIDs = spans.reduce((res, s) => {
    if (s.hasChildren) {
      res.add(s.spanID);
    }
    return res;
  }, new Set<string>());
  return { ...state, childrenHiddenIDs };
}

export function collapseOne(state: TTraceTimeline, { spans }: TSpansValue) {
  if (shouldDisableCollapse(spans, state.childrenHiddenIDs)) {
    return state;
  }
  let nearestCollapsedAncestor: Span | undefined;
  const childrenHiddenIDs = spans.reduce((res, curSpan) => {
    if (nearestCollapsedAncestor && curSpan.depth <= nearestCollapsedAncestor.depth) {
      res.add(nearestCollapsedAncestor.spanID);
      if (curSpan.hasChildren) {
        nearestCollapsedAncestor = curSpan;
      }
    } else if (curSpan.hasChildren && !res.has(curSpan.spanID)) {
      nearestCollapsedAncestor = curSpan;
    }
    return res;
  }, new Set(state.childrenHiddenIDs));
  // The last one
  if (nearestCollapsedAncestor) {
    childrenHiddenIDs.add(nearestCollapsedAncestor.spanID);
  }
  return { ...state, childrenHiddenIDs };
}

export function expandOne(state: TTraceTimeline, { spans }: TSpansValue) {
  if (state.childrenHiddenIDs.size === 0) {
    return state;
  }
  let prevExpandedDepth = -1;
  let expandNextHiddenSpan = true;
  const childrenHiddenIDs = spans.reduce((res, s) => {
    if (s.depth <= prevExpandedDepth) {
      expandNextHiddenSpan = true;
    }
    if (expandNextHiddenSpan && res.has(s.spanID)) {
      res.delete(s.spanID);
      expandNextHiddenSpan = false;
      prevExpandedDepth = s.depth;
    }
    return res;
  }, new Set(state.childrenHiddenIDs));
  return { ...state, childrenHiddenIDs };
}

function detailToggle(state: TTraceTimeline, { spanID }: TSpanIdValue) {
  const detailStates = new Map(state.detailStates);
  if (detailStates.has(spanID)) {
    detailStates.delete(spanID);
  } else {
    detailStates.set(spanID, new DetailState());
  }
  return { ...state, detailStates };
}

function detailSubsectionToggle(
  subSection: 'tags' | 'process' | 'logs' | 'warnings' | 'references',
  state: TTraceTimeline,
  { spanID }: TSpanIdValue
) {
  const old = state.detailStates.get(spanID);
  if (!old) {
    return state;
  }
  let detailState;
  if (subSection === 'tags') {
    detailState = old.toggleTags();
  } else if (subSection === 'process') {
    detailState = old.toggleProcess();
  } else if (subSection === 'warnings') {
    detailState = old.toggleWarnings();
  } else if (subSection === 'references') {
    detailState = old.toggleReferences();
  } else {
    detailState = old.toggleLogs();
  }
  const detailStates = new Map(state.detailStates);
  detailStates.set(spanID, detailState);
  return { ...state, detailStates };
}

const detailTagsToggle = detailSubsectionToggle.bind(null, 'tags');
const detailProcessToggle = detailSubsectionToggle.bind(null, 'process');
const detailLogsToggle = detailSubsectionToggle.bind(null, 'logs');
const detailWarningsToggle = detailSubsectionToggle.bind(null, 'warnings');
const detailReferencesToggle = detailSubsectionToggle.bind(null, 'references');

function detailLogItemToggle(state: TTraceTimeline, { spanID, logItem }: TSpanIdLogValue) {
  const old = state.detailStates.get(spanID);
  if (!old) {
    return state;
  }
  const detailState = old.toggleLogItem(logItem);
  const detailStates = new Map(state.detailStates);
  detailStates.set(spanID, detailState);
  return { ...state, detailStates };
}

function addHoverIndentGuideId(state: TTraceTimeline, { spanID }: TSpanIdValue) {
  const newHoverIndentGuideIds = new Set(state.hoverIndentGuideIds);
  newHoverIndentGuideIds.add(spanID);

  return { ...state, hoverIndentGuideIds: newHoverIndentGuideIds };
}

function removeHoverIndentGuideId(state: TTraceTimeline, { spanID }: TSpanIdValue) {
  const newHoverIndentGuideIds = new Set(state.hoverIndentGuideIds);
  newHoverIndentGuideIds.delete(spanID);

  return { ...state, hoverIndentGuideIds: newHoverIndentGuideIds };
}

export default handleActions(
  {
    [actionTypes.ADD_HOVER_INDENT_GUIDE_ID]: guardReducer(addHoverIndentGuideId),
    [actionTypes.CHILDREN_TOGGLE]: guardReducer(childrenToggle),
    [actionTypes.CLEAR_SHOULD_SCROLL_TO_FIRST_UI_FIND_MATCH]: guardReducer(
      clearShouldScrollToFirstUiFindMatch
    ),
    [actionTypes.COLLAPSE_ALL]: guardReducer(collapseAll),
    [actionTypes.COLLAPSE_ONE]: guardReducer(collapseOne),
    [actionTypes.DETAIL_LOGS_TOGGLE]: guardReducer(detailLogsToggle),
    [actionTypes.DETAIL_LOG_ITEM_TOGGLE]: guardReducer(detailLogItemToggle),
    [actionTypes.DETAIL_PROCESS_TOGGLE]: guardReducer(detailProcessToggle),
    [actionTypes.DETAIL_WARNINGS_TOGGLE]: guardReducer(detailWarningsToggle),
    [actionTypes.DETAIL_REFERENCES_TOGGLE]: guardReducer(detailReferencesToggle),
    [actionTypes.DETAIL_TAGS_TOGGLE]: guardReducer(detailTagsToggle),
    [actionTypes.DETAIL_TOGGLE]: guardReducer(detailToggle),
    [actionTypes.EXPAND_ALL]: guardReducer(expandAll),
    [actionTypes.EXPAND_ONE]: guardReducer(expandOne),
    [actionTypes.FOCUS_UI_FIND_MATCHES]: guardReducer(focusUiFindMatches),
    [actionTypes.REMOVE_HOVER_INDENT_GUIDE_ID]: guardReducer(removeHoverIndentGuideId),
    [actionTypes.SET_SPAN_NAME_COLUMN_WIDTH]: guardReducer(setColumnWidth),
    [actionTypes.SET_TRACE]: guardReducer(setTrace),
  },
  newInitialState()
);
