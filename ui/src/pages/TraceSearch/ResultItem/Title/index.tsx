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

import * as React from 'react';

import { formatDuration } from '../../../../library/utils/date';
import './index.less';


const DEFAULT_DURATION_PERCENT = 0;


export default class ResultItemTitle extends React.PureComponent<any> {
  render() {
    const {
      duration,
      durationPercent,
      traceID,
      traceName,
    } = this.props;
    return (
      <div className="ResultItemTitle">
        <a className="ResultItemTitle--item ub-flex-auto" href={'/trace/' + traceID}>
          <span
            className="ResultItemTitle--durationBar"
            style={{ width: `${durationPercent || DEFAULT_DURATION_PERCENT}%` }}
          />
          {duration != null && <span className="ub-right ub-relative">{formatDuration(duration)}</span>}
          <h3 className="ResultItemTitle--title">
            {traceName}
            <small className="ResultItemTitle--idExcerpt">{traceID.slice(0, 7)}</small>
          </h3>
        </a>
      </div>
    );
  }
}
