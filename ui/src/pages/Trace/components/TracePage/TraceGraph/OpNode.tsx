// Copyright (c) 2018 The Jaeger Authors.
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
import { Popover } from 'antd';
import { TLayoutVertex } from 'apm-plexus/lib/types';

import { TSumSpan } from './types';
import CopyIcon from '../../common/CopyIcon';
import { TDenseSpanMembers } from '../../../model/trace-dag/types';
import TDagPlexusVertex from '../../../model/trace-dag/types/TDagPlexusVertex';
import colorGenerator from '../../../utils/color-generator';

import './OpNode.css';
import EmphasizedNode from '../../common/EmphasizedNode';

type Props = {
  count: number;
  errors: number;
  time: number;
  percent: number;
  selfTime: number;
  percentSelfTime: number;
  operation: string;
  service: string;
  mode: string;
};

export const MODE_SERVICE = 'service';
export const MODE_TIME = 'time';
export const MODE_SELFTIME = 'selftime';

export const HELP_TABLE = (
  <table className="OpNode OpNode--legendNode">
    <tbody>
      <tr>
        <td className="OpNode--metricCell">Count / Error</td>
        <td className="OpNode--labelCell">
          <strong>Service</strong>
        </td>
        <td className="OpNode--metricCell">Avg</td>
      </tr>
      <tr>
        <td className="OpNode--metricCell">Duration</td>
        <td className="OpNode--labelCell">Operation</td>
        <td className="OpNode--metricCell">Self time</td>
      </tr>
    </tbody>
  </table>
);

export function round2(percent: number) {
  return Math.round(percent * 100) / 100;
}

export default class OpNode extends React.PureComponent<Props> {
  render() {
    const { count, errors, time, percent, selfTime, percentSelfTime, operation, service, mode } = this.props;

    // Spans over 20 % time are full red - we have probably to reconsider better approach
    let backgroundColor;
    if (mode === MODE_TIME) {
      const percentBoosted = Math.min(percent / 20, 1);
      backgroundColor = [255, 0, 0, percentBoosted].join();
    } else if (mode === MODE_SELFTIME) {
      backgroundColor = [255, 0, 0, percentSelfTime / 100].join();
    } else {
      backgroundColor = colorGenerator
        .getRgbColorByKey(service)
        .concat(0.8)
        .join();
    }

    const table = (
      <table className={`OpNode OpNode--mode-${mode}`} cellSpacing="0">
        <tbody
          className="OpNode--body"
          style={{
            background: `rgba(${backgroundColor})`,
          }}
        >
          <tr>
            <td className="OpNode--metricCell OpNode--count">
              {count} / {errors}
            </td>
            <td className="OpNode--labelCell OpNode--service">
              <strong>{service}</strong>
              <CopyIcon
                className="OpNode--copyIcon"
                copyText={`${service} ${operation}`}
                tooltipTitle="Copy label"
              />
            </td>
            <td className="OpNode--metricCell OpNode--avg">{round2(time / 1000 / count)} ms</td>
          </tr>
          <tr>
            <td className="OpNode--metricCell OpNode--time">
              {time / 1000} ms ({round2(percent)} %)
            </td>
            <td className="OpNode--labelCell OpNode--op">{operation}</td>
            <td className="OpNode--metricCell OpNode--selfTime">
              {selfTime / 1000} ms ({round2(percentSelfTime)} %)
            </td>
          </tr>
        </tbody>
      </table>
    );
    const popoverContent = <div className="OpNode--popoverContent">{table}</div>;

    return (
      <Popover overlayClassName="OpNode--popover" mouseEnterDelay={0.25} content={popoverContent}>
        {table}
      </Popover>
    );
  }
}

export function getNodeRenderer(mode: string) {
  return function drawNode(vertex: TDagPlexusVertex<TSumSpan & TDenseSpanMembers>) {
    return <OpNode {...vertex.data} mode={mode} />;
  };
}

export function getNodeFindEmphasisRenderer(uiFindVertexKeys: Set<string> | null | undefined) {
  return function renderFindEmphasis(lv: TLayoutVertex<TDagPlexusVertex<TSumSpan & TDenseSpanMembers>>) {
    if (!uiFindVertexKeys || !uiFindVertexKeys.has(lv.vertex.key)) {
      return null;
    }
    return <EmphasizedNode height={lv.height} width={lv.width} />;
  };
}

export function renderNodeVectorBorder(lv: TLayoutVertex<TDagPlexusVertex<TSumSpan>>) {
  return (
    <rect
      className="OpNode--vectorBorder"
      vectorEffect="non-scaling-stroke"
      width={lv.width}
      height={lv.height}
    />
  );
}
