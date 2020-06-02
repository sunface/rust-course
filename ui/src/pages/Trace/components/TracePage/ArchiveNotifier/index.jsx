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
import {  notification } from 'antd';
import { LoadingOutlined,ClockCircleOutlined} from '@ant-design/icons';

import ErrorMessage from '../../common/ErrorMessage';


import './index.css';

const ENotifiedState = {
  Progress : 'ENotifiedState.Progress',
  Outcome : 'ENotifiedState.Outcome',
}



function getNextNotifiedState(props) {
  const { archivedState } = props;
  if (!archivedState) {
    return null;
  }
  if (archivedState.isLoading) {
    return ENotifiedState.Progress;
  }
  return archivedState.isAcknowledged ? null : ENotifiedState.Outcome;
}

function updateNotification(oldState,nextState, props) {
  if (oldState === nextState) {
    return;
  }
  if (oldState) {
    notification.close(oldState);
  }
  if (nextState === ENotifiedState.Progress) {
    notification.info({
      key: ENotifiedState.Progress,
      description: null,
      duration: 0,
      icon: <LoadingOutlined />,
      message: 'Archiving trace...',
    });
    return;
  }
  const { acknowledge, archivedState } = props;
  if (nextState === ENotifiedState.Outcome) {
    if (archivedState && archivedState.error) {
      const error = typeof archivedState.error === 'string' ? archivedState.error : archivedState.error;
      notification.warn({
        key: ENotifiedState.Outcome,
        className: 'ArchiveNotifier--errorNotification',
        message: <ErrorMessage.Message error={error} wrap />,
        description: <ErrorMessage.Details error={error} wrap />,
        duration: null,
        icon: <ClockCircleOutlined  className="ArchiveNotifier--errorIcon" />,
        onClose: acknowledge,
      });
    } else if (archivedState && archivedState.isArchived) {
      notification.success({
        key: ENotifiedState.Outcome,
        description: null,
        duration: null,
        icon: <ClockCircleOutlined className="ArchiveNotifier--doneIcon" />,
        message: 'This trace has been archived.',
        onClose: acknowledge,
      });
    } else {
      throw new Error('Unexpected condition');
    }
  }
}

function processProps(notifiedState, props) {
  const nxNotifiedState = getNextNotifiedState(props);
  updateNotification(notifiedState, nxNotifiedState, props);
  return nxNotifiedState;
}

export default class ArchiveNotifier extends React.PureComponent {
  constructor(props) {
    super(props);
    const notifiedState = processProps(null, props);
    this.state = { notifiedState };
  }

  componentWillReceiveProps(nextProps) {
    const notifiedState = processProps(this.state.notifiedState, nextProps);
    if (this.state.notifiedState !== notifiedState) {
      this.setState({ notifiedState });
    }
  }

  componentWillUnmount() {
    const { notifiedState } = this.state;
    if (notifiedState) {
      notification.close(notifiedState);
    }
  }

  render() {
    return null;
  }
}
