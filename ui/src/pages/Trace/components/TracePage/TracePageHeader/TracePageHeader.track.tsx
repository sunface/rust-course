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

import { getToggleValue } from '../../../utils/tracking/common';
import { trackEvent } from '../../../utils/tracking';

// export for tests
export const CATEGORY_ALT_VIEW = 'jaeger/ux/trace/alt-view';
export const CATEGORY_SLIM_HEADER = 'jaeger/ux/trace/slim-header';

// export for tests
export const ACTION_GANTT = 'gantt';
export const ACTION_GRAPH = 'graph';
export const ACTION_JSON = 'json';
export const ACTION_RAW_JSON = 'rawJson';

// use a closure instead of bind to prevent forwarding any arguments to trackEvent()
export const trackGanttView = () => trackEvent(CATEGORY_ALT_VIEW, ACTION_GANTT);
export const trackGraphView = () => trackEvent(CATEGORY_ALT_VIEW, ACTION_GRAPH);
export const trackJsonView = () => trackEvent(CATEGORY_ALT_VIEW, ACTION_JSON);
export const trackRawJsonView = () => trackEvent(CATEGORY_ALT_VIEW, ACTION_RAW_JSON);

export const trackSlimHeaderToggle = (isOpen: boolean) =>
  trackEvent(CATEGORY_SLIM_HEADER, getToggleValue(isOpen));
