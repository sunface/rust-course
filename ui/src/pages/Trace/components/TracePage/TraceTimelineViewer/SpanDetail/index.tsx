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
import { Divider } from 'antd';

import AccordianKeyValues from './AccordianKeyValues';
import AccordianLogs from './AccordianLogs';
import AccordianText from './AccordianText';
import DetailState from './DetailState';
import { formatDuration } from '../utils';
import CopyIcon from '../../../common/CopyIcon';
import LabeledList from '../../../common/LabeledList';

import { TNil } from '../../../../types';
import { KeyValuePair, Link, Log, Span } from '../../../../types/trace';

import './index.css';
import AccordianReferences from './AccordianReferences';

type SpanDetailProps = {
  detailState: DetailState;
  linksGetter: ((links: KeyValuePair[], index: number) => Link[]) | TNil;
  logItemToggle: (spanID: string, log: Log) => void;
  logsToggle: (spanID: string) => void;
  processToggle: (spanID: string) => void;
  span: Span;
  tagsToggle: (spanID: string) => void;
  traceStartTime: number;
  warningsToggle: (spanID: string) => void;
  referencesToggle: (spanID: string) => void;
  focusSpan: (uiFind: string) => void;
};

export default function SpanDetail(props: SpanDetailProps) {
  const {
    detailState,
    linksGetter,
    logItemToggle,
    logsToggle,
    processToggle,
    span,
    tagsToggle,
    traceStartTime,
    warningsToggle,
    referencesToggle,
    focusSpan,
  } = props;
  const { isTagsOpen, isProcessOpen, logs: logsState, isWarningsOpen, isReferencesOpen } = detailState;
  const {
    operationName,
    process,
    duration,
    relativeStartTime,
    spanID,
    logs,
    tags,
    warnings,
    references,
  } = span;
  const overviewItems = [
    {
      key: 'svc',
      label: 'Service:',
      value: process.serviceName,
    },
    {
      key: 'duration',
      label: 'Duration:',
      value: formatDuration(duration),
    },
    {
      key: 'start',
      label: 'Start Time:',
      value: formatDuration(relativeStartTime),
    },
  ];
  const deepLinkCopyText = `${window.location.origin}${window.location.pathname}?uiFind=${spanID}`;

  return (
    <div>
      <div className="ub-flex ub-items-center">
        <h2 className="ub-flex-auto ub-m0">{operationName}</h2>
        <LabeledList
          className="ub-tx-right-align"
          dividerClassName="SpanDetail--divider"
          items={overviewItems}
        />
      </div>
      <Divider className="SpanDetail--divider ub-my1" />
      <div>
        <div>
          <AccordianKeyValues
            data={tags}
            label="Tags"
            linksGetter={linksGetter}
            isOpen={isTagsOpen}
            onToggle={() => tagsToggle(spanID)}
          />
          {process.tags && (
            <AccordianKeyValues
              className="ub-mb1"
              data={process.tags}
              label="Process"
              linksGetter={linksGetter}
              isOpen={isProcessOpen}
              onToggle={() => processToggle(spanID)}
            />
          )}
        </div>
        {logs && logs.length > 0 && (
          <AccordianLogs
            linksGetter={linksGetter}
            logs={logs}
            isOpen={logsState.isOpen}
            openedItems={logsState.openedItems}
            onToggle={() => logsToggle(spanID)}
            onItemToggle={logItem => logItemToggle(spanID, logItem)}
            timestamp={traceStartTime}
          />
        )}
        {warnings && warnings.length > 0 && (
          <AccordianText
            className="AccordianWarnings"
            headerClassName="AccordianWarnings--header"
            label={<span className="AccordianWarnings--label">Warnings</span>}
            data={warnings}
            isOpen={isWarningsOpen}
            onToggle={() => warningsToggle(spanID)}
          />
        )}
        {references && references.length > 1 && (
          <AccordianReferences
            data={references}
            isOpen={isReferencesOpen}
            onToggle={() => referencesToggle(spanID)}
            focusSpan={focusSpan}
          />
        )}
        <small className="SpanDetail--debugInfo">
          <span className="SpanDetail--debugLabel" data-label="SpanID:" /> {spanID}
          <CopyIcon
            copyText={deepLinkCopyText}
            icon="link"
            placement="topRight"
            tooltipTitle="Copy deep link to this span"
          />
        </small>
      </div>
    </div>
  );
}
