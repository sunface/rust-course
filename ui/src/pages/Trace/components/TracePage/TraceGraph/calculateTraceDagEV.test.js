// Copyright (c) 2019 The Jaeger Authors.
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

import transformTraceData from '../../../model/transform-trace-data';
import calculateTraceDagEV from './calculateTraceDagEV';

const testTrace = require('./testTrace.json');

const transformedTrace = transformTraceData(testTrace);

function assertData(nodes, service, operation, count, errors, time, percent, selfTime) {
  const d = nodes.find(({ data: n }) => n.service === service && n.operation === operation).data;
  expect(d).toBeDefined();
  expect(d.count).toBe(count);
  expect(d.errors).toBe(errors);
  expect(d.time).toBe(time * 1000);
  expect(d.percent).toBeCloseTo(percent, 2);
  expect(d.selfTime).toBe(selfTime * 1000);
}

describe('calculateTraceDagEV', () => {
  it('calculates TraceGraph', () => {
    const traceDag = calculateTraceDagEV(transformedTrace);
    const { vertices: nodes } = traceDag;
    expect(nodes.length).toBe(9);
    assertData(nodes, 'service1', 'op1', 1, 0, 390, 39, 224);
    // accumulate data (count,times)
    assertData(nodes, 'service1', 'op2', 2, 1, 70, 7, 70);
    // self-time is substracted from child
    assertData(nodes, 'service1', 'op3', 1, 0, 66, 6.6, 46);
    assertData(nodes, 'service2', 'op1', 1, 0, 20, 2, 2);
    assertData(nodes, 'service2', 'op2', 1, 0, 18, 1.8, 18);
    // follows_from relation will not influence self-time
    assertData(nodes, 'service1', 'op4', 1, 0, 20, 2, 20);
    assertData(nodes, 'service2', 'op3', 1, 0, 200, 20, 200);
    // fork-join self-times are calculated correctly (self-time drange)
    assertData(nodes, 'service1', 'op6', 1, 0, 10, 1, 1);
    assertData(nodes, 'service1', 'op7', 2, 0, 17, 1.7, 17);
  });
});
