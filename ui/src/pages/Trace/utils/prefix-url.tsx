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

import sitePrefix from '../../../site-prefix';

const origin = process.env.NODE_ENV === 'test' ? global.location.origin : window.location.origin;

/**
 * Generate the URL prefix from `sitePrefix` and use it for all subsequent calls
 * to `prefixUrl()`. `sitePrefix` should be an absolute URL, e.g. with an origin.
 * `pathPrefix` is just the path portion and should not have a trailing slash:
 *
 * - `"http://localhost:3000/"` to `""`
 * - `"http://localhost:3000/abc/"` to `"/abc"`
 * - `"http://localhost:3000/abc/def/"` to `"/abc/def"`
 */
// exported for tests
export function getPathPrefix(orig?: string, sitePref?: string) {
  const o = orig == null ? '' : orig.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const s = sitePref == null ? '' : sitePref;
  const rx = new RegExp(`^${o}|/$`, 'ig');
  return s.replace(rx, '');
}

const pathPrefix = getPathPrefix(origin, sitePrefix);

/**
 * Add the path prefix to the  URL. See [site-prefix.js](../site-prefix.js) and
 * the `<base>` tag in [index.html](../../public/index.html) for details.
 *
 * @param {string} value The URL to have the prefix added to.
 * @return {string} The resultant URL.
 */
export default function prefixUrl(value?: string) {
  const s = value == null ? '' : String(value);
  return `${pathPrefix}${s}`;
}
