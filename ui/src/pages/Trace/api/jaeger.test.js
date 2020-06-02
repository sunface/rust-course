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
jest.mock('isomorphic-fetch', () =>
  jest.fn(() =>
    Promise.resolve({
      status: 200,
      data: () => Promise.resolve({ data: null }),
      json: () => Promise.resolve({ data: null }),
    })
  )
);

import fetchMock from 'isomorphic-fetch';
import queryString from 'query-string';

import traceGenerator from '../demo/trace-generators';
import JaegerAPI, {
  getMessageFromError,
  DEFAULT_API_ROOT,
  DEFAULT_DEPENDENCY_LOOKBACK,
  ANALYTICS_ROOT,
} from './jaeger';

const defaultOptions = {
  credentials: 'same-origin',
};

describe('archiveTrace', () => {
  it('POSTs the specified id', () => {
    JaegerAPI.archiveTrace('trace-id');
    expect(fetchMock).toHaveBeenLastCalledWith(`${DEFAULT_API_ROOT}archive/trace-id`, {
      ...defaultOptions,
      method: 'POST',
    });
  });
});

describe('fetchDeepDependencyGraph', () => {
  it('GETs the specified query', () => {
    const query = { service: 'serviceName', start: 400, end: 800 };
    JaegerAPI.fetchDeepDependencyGraph(query);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${ANALYTICS_ROOT}v1/dependencies?${queryString.stringify(query)}`,
      defaultOptions
    );
  });
});

describe('fetchDependencies', () => {
  it('GETs the specified query', () => {
    const endTs = 'end time stamp';
    const lookback = 'test lookback';
    JaegerAPI.fetchDependencies(endTs, lookback);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${DEFAULT_API_ROOT}dependencies?${queryString.stringify({ endTs, lookback })}`,
      defaultOptions
    );
  });

  it('has default query values', () => {
    JaegerAPI.fetchDependencies();
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringMatching(
        new RegExp(`${DEFAULT_API_ROOT}dependencies\\?endTs=\\d+&lookback=${DEFAULT_DEPENDENCY_LOOKBACK}`)
      ),
      defaultOptions
    );
  });
});

describe('fetchServiceServerOps', () => {
  it('GETs the specified query', () => {
    const service = 'serviceName';
    const query = { service, spanKind: 'server' };
    JaegerAPI.fetchServiceServerOps(service);
    expect(fetchMock).toHaveBeenLastCalledWith(
      `${DEFAULT_API_ROOT}operations?${queryString.stringify(query)}`,
      defaultOptions
    );
  });
});

describe('fetchTrace', () => {
  const generatedTraces = traceGenerator.traces({ numberOfTraces: 5 });

  it('fetchTrace() should fetch with the id', () => {
    JaegerAPI.fetchTrace('trace-id');
    expect(fetchMock).toHaveBeenLastCalledWith(`${DEFAULT_API_ROOT}traces/trace-id`, defaultOptions);
  });

  it('fetchTrace() should resolve the whole response', async () => {
    fetchMock.mockReturnValue(
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ data: generatedTraces }),
      })
    );

    const resp = await JaegerAPI.fetchTrace('trace-id');
    expect(resp.data).toBe(generatedTraces);
  });

  it('fetchTrace() throws an error on a >= 400 status code', done => {
    const status = 400;
    const statusText = 'some-status';
    const msg = 'some-message';
    const errorData = { errors: [{ msg, code: status }] };

    fetchMock.mockReturnValue(
      Promise.resolve({
        status,
        statusText,
        text: () => Promise.resolve(JSON.stringify(errorData)),
      })
    );
    JaegerAPI.fetchTrace('trace-id').catch(err => {
      expect(err.message).toMatch(msg);
      expect(err.httpStatus).toBe(status);
      expect(err.httpStatusText).toBe(statusText);
      done();
    });
  });

  it('fetchTrace() throws an useful error derived from a text payload', done => {
    const status = 400;
    const statusText = 'some-status';
    const errorData = 'this is some error message';

    fetchMock.mockReturnValue(
      Promise.resolve({
        status,
        statusText,
        text: () => Promise.resolve(errorData),
      })
    );
    JaegerAPI.fetchTrace('trace-id').catch(err => {
      expect(err.message).toMatch(errorData);
      expect(err.httpStatus).toBe(status);
      expect(err.httpStatusText).toBe(statusText);
      done();
    });
  });
});

describe('getMessageFromError()', () => {
  describe('{ code, msg } error data', () => {
    const data = { code: 1, msg: 'some-message' };

    it('ignores code if it is the same as `status` arg', () => {
      expect(getMessageFromError(data, 1)).toBe(data.msg);
    });

    it('returns`$code - $msg` when code is novel', () => {
      const rv = getMessageFromError(data, -1);
      expect(rv).toBe(`${data.code} - ${data.msg}`);
    });
  });
  describe('other data formats', () => {
    it('stringifies the value, when possible', () => {
      const data = ['abc'];
      expect(getMessageFromError(data)).toBe(JSON.stringify(data));
    });

    it('returns the string, otherwise', () => {
      const data = {};
      data.data = data;
      expect(getMessageFromError(data)).toBe(String(data));
    });
  });
});
