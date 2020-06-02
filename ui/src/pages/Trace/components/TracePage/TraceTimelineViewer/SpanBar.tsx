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
import { Popover } from 'antd';
import _groupBy from 'lodash/groupBy';
import { onlyUpdateForKeys, compose, withState, withProps } from 'recompose';

import AccordianLogs from './SpanDetail/AccordianLogs';

import { ViewedBoundsFunctionType } from './utils';
import { TNil } from '../../../types';
import { Span } from '../../../types/trace';

import './SpanBar.css';

type TCommonProps = {
  color: string;
  hintSide: string;
  // onClick: (evt: React.MouseEvent<any>) => void;
  onClick?: (evt: React.MouseEvent<any>) => void;
  viewEnd: number;
  viewStart: number;
  getViewedBounds: ViewedBoundsFunctionType;
  rpc:
    | {
        viewStart: number;
        viewEnd: number;
        color: string;
      }
    | TNil;
  traceStartTime: number;
  span: Span;
};

type TInnerProps = {
  label: string;
  setLongLabel: () => void;
  setShortLabel: () => void;
} & TCommonProps;

type TOuterProps = {
  longLabel: string;
  shortLabel: string;
} & TCommonProps;

function toPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function SpanBar(props: TInnerProps) {
  const {
    viewEnd,
    viewStart,
    getViewedBounds,
    color,
    label,
    hintSide,
    onClick,
    setLongLabel,
    setShortLabel,
    rpc,
    traceStartTime,
    span,
  } = props;
  // group logs based on timestamps
  const logGroups = _groupBy(span.logs, log => {
    const posPercent = getViewedBounds(log.timestamp, log.timestamp).start;
    // round to the nearest 0.2%
    return toPercent(Math.round(posPercent * 500) / 500);
  });

  return (
    <div
      className="SpanBar--wrapper"
      onClick={onClick}
      onMouseOut={setShortLabel}
      onMouseOver={setLongLabel}
      aria-hidden
    >
      <div
        aria-label={label}
        className="SpanBar--bar"
        style={{
          background: color,
          left: toPercent(viewStart),
          width: toPercent(viewEnd - viewStart),
        }}
      >
        <div className={`SpanBar--label is-${hintSide}`}>{label}</div>
      </div>
      <div>
        {Object.keys(logGroups).map(positionKey => (
          <Popover
            key={positionKey}
            arrowPointAtCenter
            overlayClassName="SpanBar--logHint"
            placement="topLeft"
            content={
              <AccordianLogs
                interactive={false}
                isOpen
                logs={logGroups[positionKey]}
                timestamp={traceStartTime}
              />
            }
          >
            <div className="SpanBar--logMarker" style={{ left: positionKey }} />
          </Popover>
        ))}
      </div>
      {rpc && (
        <div
          className="SpanBar--rpc"
          style={{
            background: rpc.color,
            left: toPercent(rpc.viewStart),
            width: toPercent(rpc.viewEnd - rpc.viewStart),
          }}
        />
      )}
    </div>
  );
}

export default compose<TInnerProps, TOuterProps>(
  withState('label', 'setLabel', (props: { shortLabel: string }) => props.shortLabel),
  withProps(
    ({
      setLabel,
      shortLabel,
      longLabel,
    }: {
      setLabel: (label: string) => void;
      shortLabel: string;
      longLabel: string;
    }) => ({
      setLongLabel: () => setLabel(longLabel),
      setShortLabel: () => setLabel(shortLabel),
    })
  ),
  onlyUpdateForKeys(['label', 'rpc', 'viewStart', 'viewEnd'])
)(SpanBar);
