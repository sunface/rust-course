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

import _throttle from 'lodash/throttle';

import { trackEvent } from '.';

// export for tests
export const ACTION_FILTER_SET = 'set';
export const ACTION_FILTER_CLEAR = 'clear';

const getTrackFilterSet = (category: string) =>
  _throttle(trackEvent.bind(null, category, ACTION_FILTER_SET), 750, {
    leading: false,
  });

const getTrackFilterClear = (category: string) =>
  _throttle(trackEvent.bind(null, category, ACTION_FILTER_CLEAR), 750, {
    leading: false,
  });

export default function getTrackFilter(category: string) {
  const trackFilterSet = getTrackFilterSet(category);
  const trackFilterClear = getTrackFilterClear(category);
  return (value: any) => (value ? trackFilterSet() : trackFilterClear());
}
