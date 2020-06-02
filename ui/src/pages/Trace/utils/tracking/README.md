# Google Analytics (GA) Tracking In Jaeger UI

Page-views and errors are tracked in production when a GA tracking ID is provided in the UI config and error tracking is not disabled via the UI config. See the [documentation](http://jaeger.readthedocs.io/en/latest/deployment/#ui-configuration) for details on the UI config.

The page-view tracking is pretty basic, so details aren't provided. The GA tracking is configured with [App Tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#apptracking) data. These fields, described [below](#app-tracking), can be used as a secondary dimension when viewing event data in GA. The error tracking is described, [below](#error-tracking).

## App Tracking

The following fields are sent for each GA session:

- [Application Name](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#appName)
  - Set to `Jaeger UI`
- [Application ID](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#appId)
  - Set to `github.com/jaegertracing/jaeger-ui`
- [Application Version](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#appVersion)
  - Example: `0.0.1 | github.com/jaegertracing/jaeger-ui | 8c50c6c | 2f +2 -12 | master`
  - A dynamic value set to: `<version> | <git remote> | <short SHA> | <diff shortstat> | <branch name>`
  - Truncated to 96 characters
  - **version** - `package.json#version`
  - **git remote** - `git remote get-url --push origin`, normalized
  - **short SHA** - `git branch --points-at HEAD --format="%(objectname:short)"`
  - **diff shortstat** - A compacted `git diff-index --shortstat HEAD`
    - E.g. `2f +3 -4 5?`
    - 2 modified files, having
    - 3 insertions and
    - 4 deletions
    - 5 untracked files
  - **branch name** - `$ git branch --points-at HEAD --format="%(refname:short)"`
    - `(detached)` is used when HEAD is detached because the SHA is already noted

## Error Tracking

Raven.js is used to capture error data ([GitHub](https://github.com/getsentry/raven-js), [docs](https://docs.sentry.io/clients/javascript/)). Once captured, the error data is transformed and sent to GA.

### How Are Errors Being Tracked In GA?

For every error we learn of, two GA calls are issued:

- An [exception](https://developers.google.com/analytics/devguides/collection/analyticsjs/exceptions)
- An [event](https://developers.google.com/analytics/devguides/collection/analyticsjs/events)

GA exception tracking is pretty minimal, allowing just a [150 byte string](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#exDescription). So, in addition to the exception, an event with additional data is also issued.

- [Category](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventCategory) - The page type the error occurred on
- [Action](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventAction) - Error information with a compacted stack trace (sans sourcemaps, at this time)
- [Label](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventLabel) - A compact form of the breadcrumbs
- [Value](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue) - The duration of the session when the error occurred (in seconds)

#### Event: Category - Which Page

The category indicates which type of page the error occurred on, and will be one of the following:

- `jaeger/home/error` - The site root
- `jaeger/search/error` - The search page
- `jaeger/trace/error` - The trace page
- `jaeger/dependencies/error` - The Dependencies page

#### Event: Action - Error Info

The action contains:

- The error message (truncated to 149 characters)
- A compact form of the git status (SHA and diff shortstat)
- The page URL with the origin and path-prefix removed (truncated to 50 characters)
- A compact form of the stack trace (without the benefit of sourcemaps, at this time)

For example, the following error:

```
Error: test-sentry
    at o (main.1ae26b34.js:1)
    at e.value (main.1ae26b34.js:1)
    at scrollToNextVisibleSpan (main.1ae26b34.js:1)
    at e.exports [as fireCallback] (main.1ae26b34.js:1)
    at e.exports [as handleKey] (main.1ae26b34.js:1)
    at e.exports (chunk.6b341ae2.js:1)
    at HTMLBodyElement.r (chunk.6b341ae2.js:1)
```

Might be tracked as the following event action (without the comments):

```
! test-sentry                 # error message
/trace/abc123def              # relevant portion of the URL
8c50c6c 2f +33 -56 1?         # commit SHA and 2 edited files, 1 unknown file
                              # stack trace starts
> main.1ae26b34.js            # source file for the following frames
o                             # function `o` in main.1ae26b34.js
e.value                       # function `e.value` in main.1ae26b34.js
scrollToNextVisibleSpan       # etc...
e.exports [as fireCallback]
e.exports [as handleKey]
> chunk.6b341ae2.js           # source file for the following frames
e.exports                     # function `e.exports` in chunk.6b341ae2.js
HTMLBodyElement.r             # also in chunk.6b341ae2.js
```

The `+33 -56` means there are 33 inserted lines and 56 deleted lines in the edits made to the two tracked files.

Note: The git status is determined when the build is generated or when `yarn start` is initially executed to start the dev server.

#### Event: Label - Breadcrumbs

The label contains:

- The error message (truncated to 149 characters)
- The type of page the error occurred on
- The duration, in seconds, of the session when the error occurred
- A compact form of the git status (SHA and diff shortstat)
- A compact form of breadcrumbs, with older entries preceding newer entries

For example, the following label:

```
! Houston we have a problem
trace
18
8c50c6c 2f +34 -56 1?

[tr|404]

sr
[svc][op]cic

sd
[sr]c3

tr
cc{.SpanTreeOffset.is-parent >.SpanTreeOffset--iconWrapper}
! test-sentry
```

Indicates:

- `! Houston...` - The error message is `Error: Houston we have a problem`
- `trace` - The error occurred on the trace page
- `18` - The error occurred 18 seconds into the session
- `8c50c6c 2f +34 -56 1?` - The build was generated from commit `8c50c6c` with two modified files and one untracked file
- The sequence of events indicated by the breadcrumbs is (oldest to most recent):
  - On the first page of the session
    - `[tr|404]` - A HTTP call to fetch a trace returned a `404` status code
  - `sr` - Next, on the search page
    - `[svc]` - The services were fetched with a `200` status code
    - `[op]` - The operations for a service were fetched with a `200` status code
    - `c` - 1 click
    - `i` - 1 text input
    - `c` - 1 click
  - `sd` - Next, on a search page showing results
    - `[sr]` - A HTTP call to execute a search returned a `200` status code
    - `c3` - 3 click UI interactions
  - `tr` - Next, on a trace page
    - `cc` - 2 clicks
      - `c{.SpanTree...}` - The second click is the last UI breadcrumb, so it is shown with a CSS selector related to the click event target. The CSS selector is "related" instead of "identifying" because it's been simplified.
    - `! test-sentry` - An error with the message `Error: test-sentry`
    - The error being tracked occurred — implicit as the next event

The cryptic encoding for the breadcrumbs is used to fit as much of the event history into the 500 characters as possible. It might turn out that fewer events with more details is preferable. In which case, the payload will be adjusted. For now, the encoding is:

- `[sym]` - A fetch to `sym` resulted in a `200` status code, possible values for `sym` are:
  - `svc` - Fetch the services for the search page
  - `op` - Fetch the operations for a service
  - `sr` - Execute a search
  - `tr` - Fetch a trace
  - `dp` - Fetch the dependency data
  - `??` - Unknown fetch (should not happen)
- `[sym|NNN]` - The status code was `NNN`, omitted for `200` status codes
- `\n\nsym\n` - Navigation to `sym`
  - Page navigation tokens are on their own line and have an empty line above them, e.g. empty lines separate events that occurred on different pages
  - `sym` indicates the type of page, valid values are:
    - `dp` - Dependencies page
    - `tr` - Trace page
    - `sd` - Search page with search results
    - `sr` - Search page
    - `rt` - The root page
    - `??` - Uknown page (should not happen)
- `c` or `i` - Indicates a user interaction
  - `c` is click
  - `i` is input
  - `cN` - Indicates `c` occurred `N` consecutive times, e.g. 3 clicks would be `c3` and `i2` is two input breadcrumbs
  - `c{selector}` - Indicates `c` was the last UI breadcrumb, and the CSS selector `selector` describes the event target
    - Takes for the form `i{selector}` for input events
- `! <some message>` - A previous error that was tracked, truncated to 58 characters
  - The first occurrence of `/error/i` is removed
  - The first `:` is replaced with `!`

### [Sentry](https://github.com/getsentry) Is Not Being Used

Using Sentry is currently under consideration. In the meantime, errors can be tracked with GA.

### Why Use Raven.js

You get a lot for free when using Raven.js:

- [Breadcrumbs](https://docs.sentry.io/learn/breadcrumbs/), which include:
  - [`fetch`](https://github.com/getsentry/raven-js/blob/master/src/raven.js#L1242) HTTP requests
  - [Previous errors](https://github.com/getsentry/raven-js/blob/master/src/raven.js#L1872)
  - Some [UI events](https://github.com/getsentry/raven-js/blob/master/src/raven.js#L870) (click and input)
  - [URL changes](https://github.com/getsentry/raven-js/blob/master/src/raven.js#L945)
- Stack traces are [normalized](https://github.com/getsentry/raven-js/blob/f8eec063c95f70d8978f895284946bd278748d97/vendor/TraceKit/tracekit.js)
- Some global handlers are added

Implementing the above from scratch would require substantial effort. Meanwhile, Raven.js is well tested.
