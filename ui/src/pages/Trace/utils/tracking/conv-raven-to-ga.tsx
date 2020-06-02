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

/* eslint-disable camelcase */
import { RavenTransportOptions } from 'raven-js';

import prefixUrl from '../prefix-url';

const UNKNOWN_SYM = { sym: '??', word: '??' };

const NAV_SYMBOLS = [
  { sym: 'dp', word: 'dependencies', rx: /^\/dep/i },
  { sym: 'tr', word: 'trace', rx: /^\/trace/i },
  { sym: 'sd', word: 'search', rx: /^\/search\?./i },
  { sym: 'sr', word: 'search', rx: /^\/search/i },
  { sym: 'rt', word: 'home', rx: /^\/$/ },
];

const FETCH_SYMBOLS = [
  { sym: 'svc', word: '', rx: /^\/api\/services$/i },
  { sym: 'op', word: '', rx: /^\/api\/.*?operations$/i },
  { sym: 'sr', word: '', rx: /^\/api\/traces\?/i },
  { sym: 'tr', word: '', rx: /^\/api\/traces\/./i },
  { sym: 'dp', word: '', rx: /^\/api\/dep/i },
  { sym: '__IGNORE__', word: '', rx: /\.js(\.map)?$/i },
];

// eslint-disable-next-line no-console
const warn = console.warn.bind(console);

// common aspect of local URLs
const origin = window.location.origin + prefixUrl('');

// truncate and use "~" instead of ellipsis bc it's shorter
function truncate(str: string, len: number, front: boolean = false) {
  if (str.length > len) {
    if (!front) {
      return `${str.slice(0, len - 1)}~`;
    }
    return `~${str.slice(1 - len)}`;
  }
  return str;
}

// Replace newlines with "|" and collapse whitespace to " "
function collapseWhitespace(value: string) {
  return value
    .trim()
    .replace(/\n/g, '|')
    .replace(/\s\s+/g, ' ')
    .trim();
}

// shorten URLs to eitehr a short code or a word
function getSym(syms: typeof NAV_SYMBOLS | typeof FETCH_SYMBOLS, str: string) {
  for (let i = 0; i < syms.length; i++) {
    const { rx } = syms[i];
    if (rx.test(str)) {
      return syms[i];
    }
  }
  warn(`Unable to find symbol for: "${str}"`);
  return UNKNOWN_SYM;
}

// Convert an error message to a shorter string with the first "error" removed,
// a leading "! " added, and the first ":" replaced with "!".
//
//   Error: Houston we have a problem
//     ! Houston we have a problem
//
//   Error: HTTP Error: Fetch failed
//     ! HTTP Error: Fetch failed
//
//   TypeError: Awful things are happening
//     ! Type! Awful things are happening
//
//   The real error message
//     ! The real error message
function convErrorMessage(message: string, maxLen: number = 0) {
  let msg = collapseWhitespace(message);
  const parts = ['! '];
  const j = msg.indexOf(':');
  if (j > -1) {
    const start = msg
      .slice(0, j)
      .replace(/error/i, '')
      .trim();
    if (start) {
      parts.push(start, '! ');
    }
    msg = msg.slice(j + 1);
  }
  parts.push(msg.trim());
  const rv = parts.join('');
  return maxLen ? truncate(rv, maxLen) : parts.join('');
}

// Convert an exception to the error message and a compacted stack trace. The
// message is truncated to 149 characters. The strack trace is compacted to the
// following format:
//    From (array of objects):
//      { filename: 'http://origin/static/js/main.js', function: 'aFn' }
//      { filename: 'http://origin/static/js/main.js', function: 'bFn' }
//      { filename: 'http://origin/static/js/chunk.js', function: 'cFn' }
//      { filename: 'http://origin/static/js/chunk.js', function: 'dFn' }
//    To (string):
//      > main.js
//      aFn
//      bFn
//      > chunk.js
//      cFn
//      dFn
//
interface IConvException {
  type: string;
  value: number;
  stacktrace: {
    frames: {
      filename: string;
      function: string;
    }[];
  };
}
function convException(errValue: IConvException) {
  const message = convErrorMessage(`${errValue.type}: ${errValue.value}`, 149);
  const frames = errValue.stacktrace.frames.map(fr => {
    const filename = fr.filename.replace(origin, '').replace(/^\/static\/js\//i, '');
    const fn = collapseWhitespace(fr.function || '??');
    return { filename, fn };
  });
  const joiner = [];
  let lastFile = '';
  for (let i = frames.length - 1; i >= 0; i--) {
    const { filename, fn } = frames[i];
    if (lastFile !== filename) {
      joiner.push(`> ${filename}`);
      lastFile = filename;
    }
    joiner.push(fn);
  }
  return { message, stack: joiner.join('\n') };
}

// Convert a navigation breadcrumb to one of the following string tokens:
//    "dp" - dependencies page
//    "tr" - trace page
//    "sd" - search page with search results
//    "sr" - search page
//    "rt" - the root page
function convNav(to: string) {
  const sym = getSym(NAV_SYMBOLS, to);
  return sym.sym;
}

// Convert a HTTP fetch breadcrumb to a string token in one of the two
// following forms:
//    "[SYM]"
//    "[SYM|NNN]"
// Where "SYM" is one of:
//    "svc" - fetch the services for the search page
//    "op" - fetch the operations for a service
//    "sr" - execute a search
//    "tr" - fetch a trace
//    "dp" - fetch the dependency data
// And, "NNN" is a non-200 status code.
type TCrumbData = {
  url: string;
  status_code: number;
  to: string;
};
function convFetch(data: TCrumbData) {
  const { url, status_code } = data;
  const statusStr = status_code === 200 ? '' : `|${status_code}`;
  const sym = getSym(FETCH_SYMBOLS, url);
  if (sym.sym === '__IGNORE__') {
    return null;
  }
  return `[${sym.sym}${statusStr}]`;
}

// Reduce the selector to something similar, but more compact. This is an
// informal reduction, i.e. the selector may actually function completely
// differently, but it should suffice as a reference for UI events. The
// intention is to trim the selector to something more compact but still
// recognizable.
//
// Some examples of the conversion:
//
//    div.ub-relative. > span > span.detail-row-expanded-accent
//      => .detail-row-expanded-accent
//
//    header > div.TracePageHeader--titleRow > button.ant-btn.ub-mr2[type="button"]
//      => .TracePageHeader--titleRow >.ant-btn[type="button"]
//
//    span.SpanTreeOffset.is-parent > span.SpanTreeOffset--iconWrapper
//      => .SpanTreeOffset.is-parent >.SpanTreeOffset--iconWrapper
//
//    div > div > div.AccordianLogs > a.AccordianLogs--header.
//      => .AccordianLogs >.AccordianLogs--header
//
//    body > div > div > div.ant-modal-wrap.
//      => .ant-modal-wrap
//
//    a.ub-flex-auto.ub-mr2 > h1.TracePageHeader--title
//      => .TracePageHeader--title
function compressCssSelector(selector: string) {
  return (
    selector
      // cut dangling dots, "div. > div" to "div > div"
      .replace(/\.(?=\s|$)/g, '')
      // cut ub-* class names, "a.ub-p.is-ok" to "a.is-ok"
      .replace(/\.ub-[^. [:]+/g, '')
      // cut leading tags, "div > a > .cls" to ".cls"
      .replace(/^(\w+ > )+/, '')
      // cut tag names when there is also a class, "a.is-ok" to ".is-ok"
      .replace(/(^| )\w+?(?=\.)/g, '$1')
      // cut the first space in child selectors, ".is-ok > .yuh" to ".is-ok >.yuh"
      .replace(/ > /g, ' >')
  );
}

// Convert the breadcrumbs to a compact string, discarding quite a lot of
// information.
//
// Navigation and HTTP fetch breadcrumbs are described above in `convFetch()`
// and `convNav()`.
//
// Previously logged errors captured by sentry are truncated to 58 characters
// and placed on their own line. Further, the first occurrence of "error" is
// removed and the first ":" is replaced with "!". E.g. the message:
//    "Error: some error here with a very long message that will be truncated"
// Becomes:
//    "\n! some error here with a very long message that will be t~\n"
//
// UI breadcrumbs are reduced to the first letter after the "ui.". And,
// repeated tokens are compacted to the form:
//    "tN"
// Where "t" is the event type ("c" is click, "i" is input) and "N" is the
// total number of times it occured in that sequence. E.g. "c2" indicates
// two "ui.click" breadcrumbs.
//
// The chronological ordering of the breadcrumbs is older events precede newer
// events. This ordering was kept because it's easier to see which page events
// occurred on.
interface ICrumb {
  category: string;
  data: TCrumbData;
  message: string;
  selector: string;
}
function convBreadcrumbs(crumbs: ICrumb[]) {
  if (!Array.isArray(crumbs) || !crumbs.length) {
    return '';
  }
  // the last UI breadcrumb has the CSS selector included
  let iLastUi = -1;
  for (let i = crumbs.length - 1; i >= 0; i--) {
    if (crumbs[i].category.slice(0, 2) === 'ui') {
      iLastUi = i;
      break;
    }
  }
  let joiner: string[] = [];
  // note when we're on a newline to avoid extra newlines
  let onNewLine = true;
  for (let i = 0; i < crumbs.length; i++) {
    const c = crumbs[i];
    const cStart = c.category.split('.')[0];
    switch (cStart) {
      case 'fetch': {
        const fetched = convFetch(c.data);
        if (fetched) {
          joiner.push(fetched);
          onNewLine = false;
        }
        break;
      }

      case 'navigation': {
        const nav = `${onNewLine ? '' : '\n'}\n${convNav(c.data.to)}\n`;
        joiner.push(nav);
        onNewLine = true;
        break;
      }

      case 'ui': {
        if (i === iLastUi) {
          const selector = compressCssSelector(c.message);
          joiner.push(`${c.category[3]}{${selector}}`);
        } else {
          joiner.push(c.category[3]);
        }
        onNewLine = false;
        break;
      }

      case 'sentry': {
        const msg = convErrorMessage(c.message, 58);
        joiner.push(`${onNewLine ? '' : '\n'}${msg}\n`);
        onNewLine = true;
        break;
      }

      default:
      // skip
    }
  }
  joiner = joiner.filter(Boolean);
  // combine repeating UI chars, e.g. ["c","c","c","c"] -> ["c","4"]
  let c = '';
  let ci = -1;
  const compacted = joiner.reduce((accum: string[], value: string, j: number): string[] => {
    if (value === c) {
      return accum;
    }
    if (c) {
      if (j - ci > 1) {
        accum.push(String(j - ci));
      }
      c = '';
      ci = -1;
    }
    accum.push(value);
    if (value.length === 1) {
      c = value;
      ci = j;
    }
    return accum;
  }, []);
  if (c && ci !== joiner.length - 1) {
    compacted.push(String(joiner.length - ci));
  }
  return compacted
    .join('')
    .trim()
    .replace(/\n\n\n/g, '\n');
}

// Create the GA label value from the message, page, duration, git info, and
// breadcrumbs. See <./README.md> for details.
function getLabel(message: string, page: string, duration: number, git: string, breadcrumbs: ICrumb[]) {
  const header = [message, page, duration, git, ''].filter(v => v != null).join('\n');
  const crumbs = convBreadcrumbs(breadcrumbs);
  return `${header}\n${truncate(crumbs, 498 - header.length, true)}`;
}

// Convert the Raven exception data to something that can be sent to Google
// Analytics. See <./README.md> for details.
export default function convRavenToGa({ data }: RavenTransportOptions) {
  const { breadcrumbs, exception, extra, request, tags } = data;
  const { message, stack } = convException(exception.values[0]);
  const url = truncate(request.url.replace(origin, ''), 50);
  const { word: page } = getSym(NAV_SYMBOLS, url);
  const value = Math.round(extra['session:duration'] / 1000);
  const category = `jaeger/${page}/error`;
  let action = [message, tags && tags.git, url, '', stack].filter(v => v != null).join('\n');
  action = truncate(action, 499);
  const label = getLabel(message, page, value, tags && tags.git, breadcrumbs && breadcrumbs.values);
  return {
    message,
    category,
    action,
    label,
    value,
  };
}
