// Copyright (c) 2019 Uber Technologies, Inc.
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

import { Action } from 'redux-actions';

export default function guardReducer<TState, TPayload>(fn: (state: TState, value: TPayload) => TState) {
  return function reducer(state: TState, { payload }: Action<TPayload>) {
    if (!payload) {
      return state;
    }
    return fn(state, payload);
  };
}

export function guardReducerWithMeta<TState, TPayload, TMeta>(
  fn: (state: TState, action: { meta: TMeta; payload: TPayload }) => TState
) {
  return function reducer(state: TState, action: Action<TPayload> & { meta: TMeta }) {
    if (!action.payload || !action.meta) {
      return state;
    }
    return fn(state, action as { meta: TMeta; payload: TPayload });
  };
}
