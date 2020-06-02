/* eslint react/prop-types: 0 */

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
import { Card, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined,CloseOutlined} from '@ant-design/icons';
import cx from 'classnames';
import { Digraph, LayoutManager } from 'apm-plexus';
import cacheAs from 'apm-plexus/lib/cacheAs';

import {
  getNodeRenderer,
  getNodeFindEmphasisRenderer,
  renderNodeVectorBorder,
  MODE_SERVICE,
  MODE_TIME,
  MODE_SELFTIME,
  HELP_TABLE,
} from './OpNode';


import './TraceGraph.css';


const { classNameIsSmall, scaleOpacity, scaleStrokeOpacity } = Digraph.propsFactories;

export function setOnEdgePath(e) {
  return e.followsFrom ? { strokeDasharray: 4 } : {};
}

const HELP_CONTENT = (
  <div className="TraceGraph--help-content">
    {HELP_TABLE}
    <div>
      <table>
        <tbody>
          <tr>
            <td>
              <Button htmlType="button" shape="circle" size="small">
                S
              </Button>
            </td>
            <td>Service</td>
            <td>Colored by service</td>
          </tr>
          <tr>
            <td>
              <Button htmlType="button" shape="circle" size="small">
                T
              </Button>
            </td>
            <td>Time</td>
            <td>Colored by total time</td>
          </tr>
          <tr>
            <td>
              <Button htmlType="button" shape="circle" size="small">
                ST
              </Button>
            </td>
            <td>Selftime</td>
            <td>Colored by self time</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <svg width="100%" height="40">
        <line x1="0" y1="10" x2="90" y2="10" style={{ stroke: '#000', strokeWidth: 2 }} />
        <text alignmentBaseline="middle" x="100" y="10">
          ChildOf
        </text>
        <line
          x1="0"
          y1="30"
          x2="90"
          y2="30"
          style={{ stroke: '#000', strokeWidth: 2, strokeDasharray: '4' }}
        />
        <text alignmentBaseline="middle" x="100" y="30">
          FollowsFrom
        </text>
      </svg>
    </div>
  </div>
);

export default class TraceGraph extends React.PureComponent {

  static defaultProps = {
    ev: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showHelp: false,
      mode: MODE_SERVICE,
    };
    this.layoutManager = new LayoutManager({ useDotEdges: true, splines: 'polyline' });
  }

  componentWillUnmount() {
    this.layoutManager.stopAndRelease();
  }

  toggleNodeMode(newMode) {
    this.setState({ mode: newMode });
  }

  showHelp = () => {
    this.setState({ showHelp: true });
  };

  closeSidebar = () => {
    this.setState({ showHelp: false });
  };
 
  render() {
    const { ev, headerHeight, uiFind, uiFindVertexKeys } = this.props;
    const { showHelp, mode } = this.state;
    if (!ev) {
      return <h1 className="u-mt-vast u-tx-muted ub-tx-center">No trace found</h1>;
    }

    const wrapperClassName = cx('TraceGraph--graphWrapper', { 'is-uiFind-mode': uiFind });

    return (
      <div className={wrapperClassName} style={{ paddingTop: headerHeight + 47 }}>
        <Digraph
          minimap
          zoom
          className="TraceGraph--dag"
          minimapClassName="u-miniMap"
          layoutManager={this.layoutManager}
          measurableNodesKey="nodes"
          layers={[
            {
              key: 'node-find-emphasis',
              layerType: 'svg',
              renderNode: getNodeFindEmphasisRenderer(uiFindVertexKeys),
            },
            {
              key: 'edges',
              edges: true,
              layerType: 'svg',
              defs: [{ localId: 'arrow' }],
              markerEndId: 'arrow',
              setOnContainer: [scaleOpacity, scaleStrokeOpacity],
              setOnEdge: setOnEdgePath,
            },
            {
              key: 'nodes-borders',
              layerType: 'svg',
              setOnContainer: scaleStrokeOpacity,
              renderNode: renderNodeVectorBorder,
            },
            {
              key: 'nodes',
              layerType: 'html',
              measurable: true,
              renderNode: cacheAs(`trace-graph/nodes/render/${mode}`, getNodeRenderer(mode)),
            },
          ]}
          setOnGraph={classNameIsSmall}
          edges={ev.edges}
          vertices={ev.vertices}
        />
        <a
          className="TraceGraph--experimental"
          href="https://github.com/jaegertracing/jaeger-ui/issues/293"
          target="_blank"
          rel="noopener noreferrer"
        >
          Experimental
        </a>
        <div className="TraceGraph--sidebar-container">
          <ul className="TraceGraph--menu">
            <li>
              <QuestionCircleOutlined onClick={this.showHelp} />
            </li>
            <li>
              <Tooltip placement="left" title="Service">
                <Button
                  className="TraceGraph--btn-service"
                  htmlType="button"
                  shape="circle"
                  size="small"
                  onClick={() => this.toggleNodeMode(MODE_SERVICE)}
                >
                  S
                </Button>
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="left" title="Time">
                <Button
                  className="TraceGraph--btn-time"
                  htmlType="button"
                  shape="circle"
                  size="small"
                  onClick={() => this.toggleNodeMode(MODE_TIME)}
                >
                  T
                </Button>
              </Tooltip>
            </li>
            <li>
              <Tooltip placement="left" title="Selftime">
                <Button
                  className="TraceGraph--btn-selftime"
                  htmlType="button"
                  shape="circle"
                  size="small"
                  onClick={() => this.toggleNodeMode(MODE_SELFTIME)}
                >
                  ST
                </Button>
              </Tooltip>
            </li>
          </ul>
          {showHelp && (
            <Card
              title="Help"
              bordered={false}
              extra={
                <a onClick={this.closeSidebar} role="button">
                  <CloseOutlined  />
                </a>
              }
            >
              {HELP_CONTENT}
            </Card>
          )}
        </div>
      </div>
    );
  }
}
