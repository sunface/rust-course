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

import { handleActions } from 'redux-actions';

import {
  fetchServices,
  fetchServiceOperations as fetchOps,
  fetchServiceServerOps as fetchServerOps,
} from '../actions/jaeger-api';
import { localeStringComparator } from '../utils/sort';

const initialState = {
  error: null,
  loading: false,
  operationsForService: {},
  serverOpsForService: {},
  // `services` initial value of `null` indicates they haven't yet been loaded
  services: null,
};

function fetchStarted(state) {
  return { ...state, loading: true };
}

function fetchServicesDone(state, { payload }) {
  const services = payload.data || [];
  services.sort(localeStringComparator);
  return { ...state, services, error: null, loading: false };
}

function fetchServicesErred(state, { payload: error }) {
  return { ...state, error, loading: false, services: [] };
}

function fetchServerOpsStarted(state, { meta: { serviceName } }) {
  const serverOpsForService = {
    ...state.operationsForService,
    [serviceName]: [],
  };
  return { ...state, serverOpsForService };
}

function fetchServerOpsDone(state, { meta: { serviceName }, payload: { data: serverOpStructs } }) {
  if (!Array.isArray(serverOpStructs)) return state;

  const serverOpsForService = {
    ...state.operationsForService,
    [serviceName]: serverOpStructs.map(({ name }) => name).sort(localeStringComparator),
  };
  return { ...state, serverOpsForService };
}

function fetchOpsStarted(state, { meta: { serviceName } }) {
  const operationsForService = {
    ...state.operationsForService,
    [serviceName]: [],
  };
  return { ...state, operationsForService };
}

function fetchOpsDone(state, { meta, payload }) {
  const { data: operations } = payload;
  if (Array.isArray(operations)) {
    operations.sort(localeStringComparator);
  }
  const operationsForService = {
    ...state.operationsForService,
    [meta.serviceName]: operations || [],
  };
  return { ...state, operationsForService };
}

// TODO(joe): fetchOpsErred

export default handleActions(
  {
    [`${fetchServices}_PENDING`]: fetchStarted,
    [`${fetchServices}_FULFILLED`]: fetchServicesDone,
    [`${fetchServices}_REJECTED`]: fetchServicesErred,

    [`${fetchServerOps}_PENDING`]: fetchServerOpsStarted,
    [`${fetchServerOps}_FULFILLED`]: fetchServerOpsDone,

    [`${fetchOps}_PENDING`]: fetchOpsStarted,
    [`${fetchOps}_FULFILLED`]: fetchOpsDone,
  },
  initialState
);
