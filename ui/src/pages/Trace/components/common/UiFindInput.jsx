// Copyright (c) 2019 Uber Technologies, Inc.
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
import {  Input } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import _debounce from 'lodash/debounce';
import _isString from 'lodash/isString';
import queryString from 'query-string';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import updateUiFind from '../../utils/update-ui-find';






export class UnconnectedUiFindInput extends React.PureComponent {
  static defaultProps = {
    forwardedRef: undefined,
    inputProps: {},
    trackFindFunction: undefined,
    uiFind: undefined,
  };

  state = {
    ownInputValue: undefined,
  };

  updateUiFindQueryParam = _debounce(uiFind => {
    const { history, location, uiFind: prevUiFind, trackFindFunction } = this.props;
    if (uiFind === prevUiFind || (!prevUiFind && !uiFind)) return;
    updateUiFind({
      location,
      history,
      trackFindFunction,
      uiFind,
    });
  }, 250);

  clearUiFind = () => {
    this.updateUiFindQueryParam();
    this.updateUiFindQueryParam.flush();
  };

  handleInputBlur = () => {
    this.updateUiFindQueryParam.flush();
    this.setState({ ownInputValue: undefined });
  };

  handleInputChange = evt => {
    const { value } = evt.target;
    this.updateUiFindQueryParam(value);
    this.setState({ ownInputValue: value });
  };

  render() {
    const { allowClear, forwardedRef, inputProps } = this.props;

    const inputValue = _isString(this.state.ownInputValue) ? this.state.ownInputValue : this.props.uiFind;
    const suffix = (
      <>
        {allowClear && inputValue && inputValue.length && <CloseOutlined  onClick={this.clearUiFind} />}
        {inputProps.suffix}
      </>
    );

    return (
      <Input
        autosize={null}
        placeholder="Find..."
        {...inputProps}
        onBlur={this.handleInputBlur}
        onChange={this.handleInputChange}
        ref={forwardedRef}
        suffix={suffix}
        value={inputValue}
      />
    );
  }
}

export function extractUiFindFromState(state) {
  const { uiFind: uiFindFromUrl } = queryString.parse(state.router.location.search);
  const uiFind = Array.isArray(uiFindFromUrl) ? uiFindFromUrl.join(' ') : uiFindFromUrl;
  return { uiFind };
}

export default withRouter(connect(extractUiFindFromState)(UnconnectedUiFindInput));