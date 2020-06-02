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

import _isEqual from 'lodash/isEqual';
import { handleActions } from 'redux-actions';

import { fetchTrace, fetchMultipleTraces, searchTraces } from '../actions/jaeger-api';
import { loadJsonTraces } from '../actions/file-reader-api';
import { fetchedState } from '../constants';
import transformTraceData from '../model/transform-trace-data';

const initialState = {
  traces: {},
  search: {
    query: null,
    results: [],
  },
};

function fetchTraceStarted(state, { meta }) {
  const { id } = meta;
  const traces = { ...state.traces, [id]: { id, state: fetchedState.LOADING } };
  return { ...state, traces };
}

function fetchTraceDone(state, { meta, payload }) {
  const { id } = meta;
  const data = transformTraceData(payload.data[0]);
  let trace;
  if (!data) {
    trace = { id, state: fetchedState.ERROR, error: new Error('Invalid trace data recieved.') };
  } else {
    trace = { data, id, state: fetchedState.DONE };
  }
  const traces = { ...state.traces, [id]: trace };
  return { ...state, traces };
}

function fetchTraceErred(state, { meta, payload }) {
  const { id } = meta;
  const trace = { id, error: payload, state: fetchedState.ERROR };
  const traces = { ...state.traces, [id]: trace };
  return { ...state, traces };
}

function fetchMultipleTracesStarted(state, { meta }) {
  const { ids } = meta;
  const traces = { ...state.traces };
  ids.forEach(id => {
    traces[id] = { id, state: fetchedState.LOADING };
  });
  return { ...state, traces };
}

function fetchMultipleTracesDone(state, { payload }) {
  const traces = { ...state.traces };
  payload.data.forEach(raw => {
    const data = transformTraceData(raw);
    traces[data.traceID] = { data, id: data.traceID, state: fetchedState.DONE };
  });
  if (payload.errors) {
    payload.errors.forEach(err => {
      const { msg, traceID } = err;
      const error = new Error(`Error: ${msg} - ${traceID}`);
      traces[traceID] = { error, id: traceID, state: fetchedState.ERROR };
    });
  }
  return { ...state, traces };
}

function fetchMultipleTracesErred(state, { meta, payload }) {
  const { ids } = meta;
  const traces = { ...state.traces };
  const error = payload;
  ids.forEach(id => {
    traces[id] = { error, id, state: fetchedState.ERROR };
  });
  return { ...state, traces };
}

function fetchSearchStarted(state, { meta }) {
  const { query } = meta;
  const search = {
    query,
    results: [],
    state: fetchedState.LOADING,
  };
  return { ...state, search };
}

function searchDone(state, { meta, payload }) {
  if (!_isEqual(state.search.query, meta.query)) {
    return state;
  }
  const processed = payload.data.map(transformTraceData);
  const resultTraces = {};
  const results = [];
  for (let i = 0; i < processed.length; i++) {
    const data = processed[i];
    const id = data.traceID;
    resultTraces[id] = { data, id, state: fetchedState.DONE };
    results.push(id);
  }
  const traces = { ...state.traces, ...resultTraces };
  const search = { ...state.search, results, state: fetchedState.DONE };
  return { ...state, search, traces };
}

function searchErred(state, { meta, payload }) {
  if (!_isEqual(state.search.query, meta.query)) {
    return state;
  }
  const search = { ...state.search, error: payload, results: [], state: fetchedState.ERROR };
  return { ...state, search };
}

function loadJsonStarted(state) {
  const { search } = state;
  return { ...state, search: { ...search, state: fetchedState.LOADING } };
}

function loadJsonDone(state, { payload }) {
  const processed = payload.data.map(transformTraceData);
  const resultTraces = {};
  const results = new Set(state.search.results);
  for (let i = 0; i < processed.length; i++) {
    const data = processed[i];
    const id = data.traceID;
    resultTraces[id] = { data, id, state: fetchedState.DONE };
    results.add(id);
  }
  const traces = { ...state.traces, ...resultTraces };
  const search = { ...state.search, results: Array.from(results), state: fetchedState.DONE };
  return { ...state, search, traces };
}

function loadJsonErred(state, { payload }) {
  const search = { error: payload, results: [], state: fetchedState.ERROR };
  return { ...state, search };
}

export default handleActions(
  {
    [`${fetchTrace}_PENDING`]: fetchTraceStarted,
    [`${fetchTrace}_FULFILLED`]: fetchTraceDone,
    [`${fetchTrace}_REJECTED`]: fetchTraceErred,

    [`${fetchMultipleTraces}_PENDING`]: fetchMultipleTracesStarted,
    [`${fetchMultipleTraces}_FULFILLED`]: fetchMultipleTracesDone,
    [`${fetchMultipleTraces}_REJECTED`]: fetchMultipleTracesErred,

    [`${searchTraces}_PENDING`]: fetchSearchStarted,
    [`${searchTraces}_FULFILLED`]: searchDone,
    [`${searchTraces}_REJECTED`]: searchErred,

    [`${loadJsonTraces}_PENDING`]: loadJsonStarted,
    [`${loadJsonTraces}_FULFILLED`]: loadJsonDone,
    [`${loadJsonTraces}_REJECTED`]: loadJsonErred,
  },
  initialState
);
