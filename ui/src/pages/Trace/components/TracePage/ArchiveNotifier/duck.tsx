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

import { createActions, handleActions, ActionFunctionAny } from 'redux-actions';

import { archiveTrace } from '../../../actions/jaeger-api';
import { ApiError } from '../../../types/api-error';
import { TracesArchive } from '../../../types/archive';
import generateActionTypes from '../../../utils/generate-action-types';

type ArchiveAction = {
  meta: {
    id: string;
  };
  payload?: ApiError | string;
};

const initialState: TracesArchive = {};

const actionTypes = generateActionTypes('@jaeger-ui/archive-trace', ['ACKNOWLEDGE']);

const fullActions = createActions({
  [actionTypes.ACKNOWLEDGE]: traceID => traceID,
});

export const actions: { [actionType: string]: ActionFunctionAny<any> } = {
  ...(fullActions as any).jaegerUi.archiveTrace,
  archiveTrace,
};

function acknowledge(state: TracesArchive, { payload }: ArchiveAction) {
  const traceID = typeof payload === 'string' ? payload : null;
  if (!traceID) {
    // make flow happy
    throw new Error('Invalid state, missing traceID for archive acknowledge');
  }
  const traceArchive = state[traceID];
  if (traceArchive && traceArchive.isLoading) {
    // acknowledgement during loading is invalid (should not happen)
    return state;
  }
  const next = { ...traceArchive, isAcknowledged: true };
  return { ...state, [traceID]: next };
}

function archiveStarted(state: TracesArchive, { meta }: ArchiveAction) {
  return { ...state, [meta.id]: { isLoading: true } };
}

function archiveDone(state: TracesArchive, { meta }: ArchiveAction) {
  return { ...state, [meta.id]: { isArchived: true, isAcknowledged: false } };
}

function archiveErred(state: TracesArchive, { meta, payload }: ArchiveAction) {
  if (!payload) {
    // make flow happy
    throw new Error('Invalid state, missing API error details');
  }
  const traceArchive = { error: payload, isArchived: false, isError: true, isAcknowledged: false };
  return { ...state, [meta.id]: traceArchive };
}

export default handleActions(
  {
    [actionTypes.ACKNOWLEDGE]: acknowledge,
    [`${archiveTrace}_PENDING`]: archiveStarted,
    [`${archiveTrace}_FULFILLED`]: archiveDone,
    [`${archiveTrace}_REJECTED`]: archiveErred,
  },
  initialState
);
