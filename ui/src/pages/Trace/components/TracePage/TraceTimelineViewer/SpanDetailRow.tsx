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

import React from 'react';

import SpanDetail from './SpanDetail';
import DetailState from './SpanDetail/DetailState';
import SpanTreeOffset from './SpanTreeOffset';
import TimelineRow from './TimelineRow';

import { Log, Span, KeyValuePair, Link } from '../../../types/trace';

import './SpanDetailRow.css';

type SpanDetailRowProps = {
  color: string;
  columnDivision: number;
  detailState: DetailState;
  onDetailToggled: (spanID: string) => void;
  linksGetter: (span: Span, links: KeyValuePair[], index: number) => Link[];
  logItemToggle: (spanID: string, log: Log) => void;
  logsToggle: (spanID: string) => void;
  processToggle: (spanID: string) => void;
  referencesToggle: (spanID: string) => void;
  warningsToggle: (spanID: string) => void;
  span: Span;
  tagsToggle: (spanID: string) => void;
  traceStartTime: number;
  focusSpan: (uiFind: string) => void;
};

export default class SpanDetailRow extends React.PureComponent<SpanDetailRowProps> {
  _detailToggle = () => {
    this.props.onDetailToggled(this.props.span.spanID);
  };

  _linksGetter = (items: KeyValuePair[], itemIndex: number) => {
    const { linksGetter, span } = this.props;
    return linksGetter(span, items, itemIndex);
  };

  render() {
    const {
      color,
      columnDivision,
      detailState,
      logItemToggle,
      logsToggle,
      processToggle,
      referencesToggle,
      warningsToggle,
      span,
      tagsToggle,
      traceStartTime,
      focusSpan,
    } = this.props;
    return (
      <TimelineRow className="detail-row">
        <TimelineRow.Cell width={columnDivision}>
          <SpanTreeOffset span={span} showChildrenIcon={false} />
          <span>
            <span
              className="detail-row-expanded-accent"
              aria-checked="true"
              onClick={this._detailToggle}
              role="switch"
              style={{ borderColor: color }}
            />
          </span>
        </TimelineRow.Cell>
        <TimelineRow.Cell width={1 - columnDivision}>
          <div className="detail-info-wrapper" style={{ borderTopColor: color }}>
            <SpanDetail
              detailState={detailState}
              linksGetter={this._linksGetter}
              logItemToggle={logItemToggle}
              logsToggle={logsToggle}
              processToggle={processToggle}
              referencesToggle={referencesToggle}
              warningsToggle={warningsToggle}
              span={span}
              tagsToggle={tagsToggle}
              traceStartTime={traceStartTime}
              focusSpan={focusSpan}
            />
          </div>
        </TimelineRow.Cell>
      </TimelineRow>
    );
  }
}
