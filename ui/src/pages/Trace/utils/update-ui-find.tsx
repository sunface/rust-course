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

import queryString from 'query-string';

import { History as RouterHistory, Location } from 'history';

import { TNil } from '../types';

export default function updateUiFind({
  history,
  location,
  trackFindFunction,
  uiFind,
}: {
  history: RouterHistory;
  location: Location;
  trackFindFunction?: (uiFind: string | TNil) => void;
  uiFind?: string | TNil;
}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { uiFind: _oldUiFind, ...queryParams } = queryString.parse(location.search);
  if (trackFindFunction) trackFindFunction(uiFind);
  if (uiFind) (queryParams as Record<string, string>).uiFind = uiFind;
  history.replace({
    ...location,
    search: `?${queryString.stringify(queryParams)}`,
  });
}
