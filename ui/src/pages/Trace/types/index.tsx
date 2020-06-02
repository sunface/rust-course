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

import { Router } from 'react-router-dom';
import { Location } from 'history';

import { ApiError } from './api-error';
import { TracesArchive } from './archive';
import { Config } from './config';
import { EmbeddedState } from './embedded';
import { SearchQuery } from './search';
import TNil from './TNil';
import { Trace } from './trace';
import TTraceTimeline from './TTraceTimeline';

export type TNil = TNil;

export type FetchedState = 'FETCH_DONE' | 'FETCH_ERROR' | 'FETCH_LOADING';

export type FetchedTrace = {
  data?: Trace;
  error?: ApiError;
  id: string;
  state?: FetchedState;
};

export type ReduxState = {
  archive: TracesArchive;
  config: Config;
  embedded: EmbeddedState;
  router: Router & {
    location: Location;
  };
  services: {
    services: (string[]) | TNil;
    serverOpsForService: Record<string, string[]>;
    operationsForService: Record<string, string[]>;
    loading: boolean;
    error: ApiError | TNil;
  };
  trace: {
    traces: Record<string, FetchedTrace>;
    search: {
      error?: ApiError;
      results: string[];
      state?: FetchedState;
      query?: SearchQuery;
    };
  };
  traceTimeline: TTraceTimeline;
};
