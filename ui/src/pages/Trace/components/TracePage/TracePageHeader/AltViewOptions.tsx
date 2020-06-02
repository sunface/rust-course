// Copyright (c) 2018 Uber Technologies, Inc.
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
import { Button, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { trackGanttView, trackGraphView, trackJsonView, trackRawJsonView } from './TracePageHeader.track';
import prefixUrl from '../../../utils/prefix-url';

type Props = {
  onTraceGraphViewClicked: () => void;
  traceGraphView: boolean;
  traceID: string;
};

export default function AltViewOptions(props: Props) {
  const { onTraceGraphViewClicked, traceGraphView, traceID } = props;
  const handleToggleView = () => {
    if (traceGraphView) trackGanttView();
    else trackGraphView();
    onTraceGraphViewClicked();
  };
  const menu = (
    <Menu>
      <Menu.Item>
        <a onClick={handleToggleView} role="button">
          {traceGraphView ? 'Trace Timeline' : 'Trace Graph'}
        </a>
      </Menu.Item>
      <Menu.Item>
        <Link
          to={prefixUrl(`/api/traces/${traceID}?prettyPrint=true`)}
          rel="noopener noreferrer"
          target="_blank"
          onClick={trackJsonView}
        >
          Trace JSON
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link
          to={prefixUrl(`/api/traces/${traceID}?raw=true&prettyPrint=true`)}
          rel="noopener noreferrer"
          target="_blank"
          onClick={trackRawJsonView}
        >
          Trace JSON (unadjusted)
        </Link>
      </Menu.Item>
    </Menu>
  );
  return ( 
    <Dropdown overlay={menu}>
      <Button className="ub-mr2" htmlType="button" onClick={handleToggleView}>
        Alternate Views <DownOutlined />
      </Button>
    </Dropdown>
  );
}
