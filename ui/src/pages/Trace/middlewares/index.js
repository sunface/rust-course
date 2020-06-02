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

import promiseMiddleware from 'redux-promise-middleware';
import { change } from 'redux-form';


import {  fetchServiceOperations } from '../actions/jaeger-api';

export { default as trackMiddleware } from './track';

/**
 * Middleware to load "operations" for a particular service.
 */
export const loadOperationsForServiceMiddleware = store => next => action => {
  if (
    action.type === '@@redux-form/CHANGE' &&
    action.meta.form === 'searchSideBar' &&
    action.meta.field === 'service' &&
    action.payload !== '-'
  ) {
    store.dispatch(fetchServiceOperations(action.payload));
    store.dispatch(change('searchSideBar', 'operation', 'all'));
  }
  return next(action);
};

export const historyUpdateMiddleware = () => next => action => {
  next(action);
};

export const promise = promiseMiddleware();
