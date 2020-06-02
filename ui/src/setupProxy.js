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

// eslint-disable-next-line import/no-extraneous-dependencies
const proxy = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  app.use(
    proxy('/api', {
      target: 'http://localhost:16686',
      logLevel: 'silent',
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    })
  );
  app.use(
    proxy('/analytics', {
      target: 'http://localhost:16686',
      logLevel: 'silent',
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    })
  );
  app.use(
    proxy('/serviceedges', {
      target: 'http://localhost:16686',
      logLevel: 'silent',
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    })
  );
  app.use(
    proxy('/qualitymetrics-v2', {
      target: 'http://localhost:16686',
      logLevel: 'silent',
      secure: false,
      changeOrigin: true,
      ws: true,
      xfwd: true,
    })
  );
};
