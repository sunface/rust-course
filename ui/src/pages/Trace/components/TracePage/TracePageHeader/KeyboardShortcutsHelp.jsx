/* eslint react/prop-types: 0 */

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
import { Button, Modal, Table } from 'antd';

import keyboardMappings from '../keyboard-mappings';
import track from './KeyboardShortcutsHelp.track';

import './KeyboardShortcutsHelp.css';


const { Column } = Table;

const SYMBOL_CONV = {
  up: '↑',
  right: '→',
  down: '↓',
  left: '←',
  shift: '⇧',
};

const ODD_ROW_CLASS = 'KeyboardShortcutsHelp--oddRow';

function convertKeys(keyConfig) {
  const config = Array.isArray(keyConfig) ? keyConfig : [keyConfig];
  return config.map(str => str.split('+').map(part => SYMBOL_CONV[part] || part.toUpperCase()));
}

const padLeft = text => <span className="ub-pl4">{text}</span>;
const padRight = text => <span className="ub-pr4">{text}</span>;
const getRowClass = (_, index) => (index % 2 > 0 ? ODD_ROW_CLASS : '');

let kbdTable= null;

function getHelpModal() {
  if (kbdTable) {
    return kbdTable;
  }
  const data = [];
  Object.keys(keyboardMappings).forEach(handle => {
    const { binding, label } = keyboardMappings[handle];
    const keyConfigs = convertKeys(binding);
    data.push(
      ...keyConfigs.map(config => ({
        key: String(config),
        kbds: <kbd>{config.join(' ')}</kbd>,
        description: label,
      }))
    );
  });

  kbdTable = (
    <Table
      className="KeyboardShortcutsHelp--table u-simple-scrollbars"
      dataSource={data}
      size="middle"
      pagination={false}
      showHeader={false}
      rowClassName={getRowClass}
    >
      <Column title="Description" dataIndex="description" key="description" render={padLeft} />
      <Column title="Key(s)" dataIndex="kbds" key="kbds" align="right" render={padRight} />
    </Table>
  );
  return kbdTable;
}

export default class KeyboardShortcutsHelp extends React.PureComponent {
  state = {
    visible: false,
  };

  onCtaClicked = () => {
    track();
    this.setState({ visible: true });
  };

  onCloserClicked = () => this.setState({ visible: false });

  render() {
    const { className } = this.props;
    return (
      <React.Fragment>
        <Button className={className} htmlType="button" onClick={this.onCtaClicked}>
          <span className="KeyboardShortcutsHelp--cta">⌘</span>
        </Button>
        <Modal
          align={undefined}
          title="Keyboard Shortcuts"
          visible={this.state.visible}
          onOk={this.onCloserClicked}
          onCancel={this.onCloserClicked}
          cancelButtonProps={{ style: { display: 'none' } }}
          bodyStyle={{ padding: 0 }}
        >
          {getHelpModal()}
        </Modal>
      </React.Fragment>
    );
  }
}
