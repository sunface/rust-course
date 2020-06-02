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

/* eslint-disable import/no-extraneous-dependencies */

import * as React from 'react';
import { DownOutlined } from '@ant-design/icons'; 
import VirtualizedSelect from 'react-virtualized-select';

import 'react-select/dist/react-select.css';
import 'react-virtualized/styles.css';
import 'react-virtualized-select/styles.css';

import './VirtSelect.css';

function renderOption({
  focusedOption,
  focusOption,
  key,
  labelKey,
  option,
  selectValue,
  style,
  valueArray,
}) /* RenderOptionArgs) \*\/: JSX.Element */ {
  const className = ['VirtSelect--option'];
  if (option === focusedOption) {
    className.push('is-focused');
  }
  if (option.disabled) {
    className.push('is-disabled');
  }
  if (valueArray && valueArray.indexOf(option) >= 0) {
    className.push('is-selected');
  }
  if (option.className) {
    className.push(option.className);
  }
  const events = option.disabled
    ? {}
    : {
        onClick: () => selectValue(option),
        onMouseEnter: () => focusOption(option),
      };
  return (
    <div className={className.join(' ')} key={key} style={style} title={option.title} {...events}>
      {option[labelKey]}
    </div>
  );
}

function renderArrow({ isOpen }) {
  return <DownOutlined className={`VirtSelect--arrow ${isOpen ? 'is-open' : ''}`}  />;
}

export default function VirtSelect(props) {
  return (
    <VirtualizedSelect
      className="VirtSelect"
      arrowRenderer={renderArrow}
      optionRenderer={renderOption}
      {...props}
    />
  );
}
