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

import { Popover } from 'antd';
import cx from 'classnames';
import * as React from 'react';

import './redux-form-field-adapter.css';

const noop = () => {};

export default function reduxFormFieldAdapter({
  AntInputComponent,
  onChangeAdapter,
  isValidatedInput = false,
}: {
  AntInputComponent: React.ComponentType;
  onChangeAdapter: (evt: React.ChangeEvent) => any;
  isValidatedInput: boolean;
}) {
  return function _reduxFormFieldAdapter(props: any) {
    const {
      input: { onBlur, onChange, onFocus, value },
      children,
      ...rest
    } = props;
    const isInvalid = !rest.meta.active && Boolean(rest.meta.error);
    const content = (
      <AntInputComponent
        className={cx({
          'is-invalid': isInvalid,
          'AdaptedReduxFormField--isValidatedInput': isValidatedInput,
        })}
        onBlur={isValidatedInput && onBlur ? onBlur : noop}
        onFocus={isValidatedInput && onFocus ? onFocus : noop}
        onChange={onChangeAdapter ? (arg: React.ChangeEvent) => onChange(onChangeAdapter(arg)) : onChange}
        value={value}
        {...rest}
      >
        {children}
      </AntInputComponent>
    );
    return isValidatedInput ? (
      <Popover placement="bottomLeft" visible={isInvalid} {...rest.meta.error}>
        {content}
      </Popover>
    ) : (
      content
    );
  };
}
