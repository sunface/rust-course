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

import _get from 'lodash/get';
import queryString from 'query-string';
import ReactGA from 'react-ga';
import Raven, { RavenOptions, RavenTransportOptions } from 'raven-js';

import convRavenToGa from './conv-raven-to-ga';
import getConfig from '../config/get-config';
import { TNil } from '../../types';

const EVENT_LENGTHS = {
  action: 499,
  category: 149,
  label: 499,
};

// Util so "0" and "false" become false
const isTruish = (value?: string | string[]) => Boolean(value) && value !== '0' && value !== 'false';

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// In test mode if development and envvar REACT_APP_GA_DEBUG is true-ish
const isDebugMode =
  (isDev && isTruish(process.env.REACT_APP_GA_DEBUG)) ||
  isTruish(queryString.parse(_get(window, 'location.search'))['ga-debug']);

const config = getConfig();
const gaID = _get(config, 'tracking.gaID');
// enable for tests, debug or if in prod with a GA ID
export const isGaEnabled = isTest || isDebugMode || (isProd && Boolean(gaID));
const isErrorsEnabled = isDebugMode || (isGaEnabled && Boolean(_get(config, 'tracking.trackErrors')));

/* istanbul ignore next */
function logTrackingCalls() {
  const calls = ReactGA.testModeAPI.calls;
  for (let i = 0; i < calls.length; i++) {
    // eslint-disable-next-line no-console
    console.log('[react-ga]', ...calls[i]);
  }
  calls.length = 0;
}

export function trackPageView(pathname: string, search: string | TNil) {
  if (isGaEnabled) {
    const pagePath = search ? `${pathname}${search}` : pathname;
    ReactGA.pageview(pagePath);
    if (isDebugMode) {
      logTrackingCalls();
    }
  }
}

export function trackError(description: string) {
  if (isGaEnabled) {
    let msg = description;
    if (!/^jaeger/i.test(msg)) {
      msg = `jaeger/${msg}`;
    }
    msg = msg.slice(0, 149);
    ReactGA.exception({ description: msg, fatal: false });
    if (isDebugMode) {
      logTrackingCalls();
    }
  }
}

export function trackEvent(
  category: string,
  action: string,
  labelOrValue?: string | number | TNil,
  value?: number | TNil
) {
  if (isGaEnabled) {
    const event: {
      action: string;
      category: string;
      label?: string;
      value?: number;
    } = {
      category: !/^jaeger/i.test(category)
        ? `jaeger/${category}`.slice(0, EVENT_LENGTHS.category)
        : category.slice(0, EVENT_LENGTHS.category),
      action: action.slice(0, EVENT_LENGTHS.action),
    };
    if (labelOrValue != null) {
      if (typeof labelOrValue === 'string') {
        event.label = labelOrValue.slice(0, EVENT_LENGTHS.action);
      } else {
        // value should be an int
        event.value = Math.round(labelOrValue);
      }
    }
    if (value != null) {
      event.value = Math.round(value);
    }
    ReactGA.event(event);
    if (isDebugMode) {
      logTrackingCalls();
    }
  }
}

function trackRavenError(ravenData: RavenTransportOptions) {
  const { message, category, action, label, value } = convRavenToGa(ravenData);
  trackError(message);
  trackEvent(category, action, label, value);
}

// Tracking needs to be initialized when this file is imported, e.g. early in
// the process of initializing the app, so Raven can wrap various resources,
// like `fetch()`, and generate breadcrumbs from them.

if (isGaEnabled) {
  let versionShort;
  let versionLong;
  if (process.env.REACT_APP_VSN_STATE) {
    try {
      const data = JSON.parse(process.env.REACT_APP_VSN_STATE);
      const joiner = [data.objName];
      if (data.changed.hasChanged) {
        joiner.push(data.changed.pretty);
      }
      versionShort = joiner.join(' ');
      versionLong = data.pretty;
    } catch (_) {
      versionShort = process.env.REACT_APP_VSN_STATE;
      versionLong = process.env.REACT_APP_VSN_STATE;
    }
    versionLong = versionLong.length > 99 ? `${versionLong.slice(0, 96)}...` : versionLong;
  } else {
    versionShort = 'unknown';
    versionLong = 'unknown';
  }
  const gaConfig = { testMode: isTest || isDebugMode, titleCase: false };
  ReactGA.initialize(gaID || 'debug-mode', gaConfig);
  ReactGA.set({
    appId: 'github.com/jaegertracing/jaeger-ui',
    appName: 'Jaeger UI',
    appVersion: versionLong,
  });
  const cookiesToDimensions = _get(config, 'tracking.cookiesToDimensions');
  if (cookiesToDimensions) {
    cookiesToDimensions.forEach(({ cookie, dimension }: { cookie: string; dimension: string }) => {
      const match = ` ${document.cookie}`.match(new RegExp(`[; ]${cookie}=([^\\s;]*)`));
      if (match) ReactGA.set({ [dimension]: match[1] });
      // eslint-disable-next-line no-console
      else console.warn(`${cookie} not present in cookies, could not set dimension: ${dimension}`);
    });
  }
  if (isErrorsEnabled) {
    const ravenConfig: RavenOptions = {
      autoBreadcrumbs: {
        xhr: true,
        console: false,
        dom: true,
        location: true,
      },
      environment: process.env.NODE_ENV || 'unkonwn',
      transport: trackRavenError,
    };
    if (versionShort && versionShort !== 'unknown') {
      ravenConfig.tags = {
        git: versionShort,
      };
    }
    Raven.config('https://fakedsn@omg.com/1', ravenConfig).install();
    window.onunhandledrejection = function trackRejectedPromise(evt) {
      Raven.captureException(evt.reason);
    };
  }
  if (isDebugMode) {
    logTrackingCalls();
  }
}

export const context = isErrorsEnabled ? Raven : null;
