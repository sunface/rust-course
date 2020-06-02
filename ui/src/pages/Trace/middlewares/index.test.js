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
jest.mock('node-fetch', () => () =>
  Promise.resolve({
    status: 200,
    data: () => Promise.resolve({ data: null }),
    json: () => Promise.resolve({ data: null }),
  })
);

import { change } from 'redux-form';
import sinon from 'sinon';

import * as jaegerMiddlewares from './index';
import { fetchServiceOperations } from '../actions/jaeger-api';

it('jaegerMiddlewares should contain the promise middleware', () => {
  expect(typeof jaegerMiddlewares.promise).toBe('function');
});

it('loadOperationsForServiceMiddleware fetches operations for services', () => {
  const { loadOperationsForServiceMiddleware } = jaegerMiddlewares;
  const dispatch = sinon.spy();
  const next = sinon.spy();
  const action = change('searchSideBar', 'service', 'yo');
  loadOperationsForServiceMiddleware({ dispatch })(next)(action);
  expect(dispatch.calledWith(fetchServiceOperations('yo'))).toBeTruthy();
  expect(dispatch.calledWith(change('searchSideBar', 'operation', 'all'))).toBeTruthy();
});
