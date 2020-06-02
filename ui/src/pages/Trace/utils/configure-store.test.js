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

import createMemoryHistory from 'history/createMemoryHistory';

import configureStore from './configure-store';

it('configureStore() should return the redux store', () => {
  const store = configureStore(createMemoryHistory());

  expect(typeof store.dispatch === 'function').toBeTruthy();
  expect(typeof store.getState === 'function').toBeTruthy();
  expect(typeof store.subscribe === 'function').toBeTruthy();
  expect(typeof store.replaceReducer === 'function').toBeTruthy();

  expect({}.hasOwnProperty.call(store.getState(), 'router')).toBeTruthy();
  expect({}.hasOwnProperty.call(store.getState(), 'trace')).toBeTruthy();
  expect({}.hasOwnProperty.call(store.getState(), 'form')).toBeTruthy();
});
