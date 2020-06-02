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

import deepFreeze from 'deep-freeze';

const poeExcerpt = `
Excerpt of Alone, by Edgar Allen Poe:
"Then—in my childhood—in the dawn
Of a most stormy life—was drawn
From the red cliff of the mountain—
From the sun that ’round me roll’d
In its autumn tint of gold—
From the lightning in the sky
As it pass’d me flying by—
From the thunder, and the storm
And the cloud that took the form
(When the rest of Heaven was blue)
Of a demon in my view—"
3/17/1829`;

export const RAVEN_PAYLOAD = deepFreeze({
  data: {
    request: {
      url: 'http://localhost/trace/565c1f00385ebd0b',
    },
    exception: {
      values: [
        {
          type: 'Error',
          value: 'test-sentry',
          stacktrace: {
            frames: [
              {
                filename: 'http://localhost/static/js/ultra-long-func.js',
                function: poeExcerpt,
              },
              {
                filename: 'http://localhost/static/js/b.js',
                function: 'fnBb',
              },
              {
                filename: 'http://localhost/static/js/b.js',
                function: 'fnBa',
              },
              {
                filename: 'http://localhost/static/js/a.js',
                function: 'fnAb',
              },
              {
                filename: 'http://localhost/static/js/a.js',
                function: 'fnAa',
              },
              {
                filename: 'http://localhost/static/js/a.js',
                function: 'HTMLBodyElement.wrapped',
              },
            ],
          },
        },
      ],
    },
    tags: {
      git: 'SHA shortstat',
    },
    extra: {
      'session:duration': 10952,
    },
    breadcrumbs: {
      values: [
        {
          category: 'sentry',
          message: '6 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          category: 'sentry',
          message: '5 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          category: 'sentry',
          message: '4 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          category: 'sentry',
          message: '3 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          category: 'sentry',
          message: '2 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          category: 'sentry',
          message: '1 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          category: 'sentry',
          message: '0 Breadcrumbs should be truncated from the top (oldest)',
        },
        {
          type: 'http',
          category: 'fetch',
          data: {
            url: '/api/traces/565c1f00385ebd0b',
            status_code: 200,
          },
        },
        {
          type: 'http',
          category: 'fetch',
          data: {
            url: '/api/traces/565c1f00385ebd0b',
            status_code: 404,
          },
        },
        {
          type: 'http',
          category: 'fetch',
          data: {
            url: '/unknown/url/1',
            status_code: 200,
          },
        },
        {
          category: 'navigation',
          data: {
            to: '/trace/cde2457775afa8d2',
          },
        },
        {
          category: 'navigation',
          data: {
            to: '/unknown/url',
          },
        },
        {
          category: 'sentry',
          message: 'Error: test-sentry',
        },
        {
          category: 'sentry',
          message:
            "TypeError: A very long message that will be truncated and reduced to a faint flicker of it's former glory",
        },
        {
          category: 'ui.click',
        },
        {
          category: 'ui.input',
        },
        {
          category: 'ui.click',
        },
        {
          category: 'ui.click',
        },
        {
          category: 'ui.input',
        },
        {
          category: 'ui.input',
        },
        {
          category: 'ui.input',
          message: 'header > ul.LabeledList.TracePageHeader--overviewItems',
        },
      ],
    },
  },
});

const action = `! test-sentry
SHA shortstat
/trace/565c1f00385ebd0b

> a.js
HTMLBodyElement.wrapped
fnAa
fnAb
> b.js
fnBa
fnBb
> ultra-long-func.js
Excerpt of Alone, by Edgar Allen Poe:|"Then—in my childhood—in the dawn|Of a most stormy life—was drawn|From the red cliff of the mountain—|From the sun that ’round me roll’d|In its autumn tint of gold—|From the lightning in the sky|As it pass’d me flying by—|From the thunder, and the storm|And the cloud that took the form|(When the rest of Heaven was blue)|Of a d~`;

const label = `! test-sentry
trace
11
SHA shortstat

~om the top (oldest)
! 4 Breadcrumbs should be truncated from the top (oldest)
! 3 Breadcrumbs should be truncated from the top (oldest)
! 2 Breadcrumbs should be truncated from the top (oldest)
! 1 Breadcrumbs should be truncated from the top (oldest)
! 0 Breadcrumbs should be truncated from the top (oldest)
[tr][tr|404][??]

tr

??
! test-sentry
! Type! A very long message that will be truncated and re~
cic2i2i{.LabeledList.TracePageHeader--overviewItems}`;

export const RAVEN_TO_GA = deepFreeze({
  action,
  label,
  message: '! test-sentry',
  category: 'jaeger/trace/error',
  value: 11,
});
