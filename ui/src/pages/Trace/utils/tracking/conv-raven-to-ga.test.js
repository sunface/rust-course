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

import convRavenToGa from './conv-raven-to-ga';
import { RAVEN_PAYLOAD, RAVEN_TO_GA } from './fixtures';

describe('convRavenToGa()', () => {
  it('converts the raven-js payload to { category, action, label, value }', () => {
    const data = convRavenToGa(RAVEN_PAYLOAD);
    expect(data).toEqual(RAVEN_TO_GA);
  });
});
