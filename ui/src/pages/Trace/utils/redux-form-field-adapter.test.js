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

import { Input, Popover } from 'antd';
import { shallow } from 'enzyme';
import React from 'react';

import reduxFormFieldAdapter from './redux-form-field-adapter';

describe('reduxFormFieldAdapter', () => {
  const error = {
    content: 'error content',
    title: 'error title',
  };
  let input;
  let meta;

  beforeEach(() => {
    input = {
      onChange: function onChange() {},
      onBlur: function onBlur() {},
      value: 'inputValue',
    };
    meta = {
      error: null,
      active: false,
    };
  });

  describe('not validated input', () => {
    const AdaptedInput = reduxFormFieldAdapter({ AntInputComponent: Input });
    it('should render as expected', () => {
      const wrapper = shallow(<AdaptedInput input={input} meta={meta} />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('validate input', () => {
    const AdaptedInput = reduxFormFieldAdapter({ AntInputComponent: Input, isValidatedInput: true });
    it('should render as expected when there is not an error', () => {
      const wrapper = shallow(<AdaptedInput input={input} meta={meta} />);
      expect(wrapper).toMatchSnapshot();
    });

    it('should render Popover as invisible if there is an error but the field is active', () => {
      meta.error = error;
      meta.active = true;
      const wrapper = shallow(<AdaptedInput input={input} meta={meta} />);
      expect(wrapper.find(Popover).prop('visible')).toBeFalsy();
      expect(wrapper).toMatchSnapshot();
    });

    it('should render Popover as visible if there is an error and the field is not active', () => {
      meta.error = error;
      const wrapper = shallow(<AdaptedInput input={input} meta={meta} />);
      expect(wrapper.find(Popover).prop('visible')).toBeTruthy();
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('onChangeAdapter', () => {
    it('should use input.onChange when adapter is not provided', () => {
      const AdaptedInput = reduxFormFieldAdapter({ AntInputComponent: Input });
      const wrapper = shallow(<AdaptedInput input={input} meta={meta} />);
      expect(wrapper.find(Input).prop('onChange')).toBe(input.onChange);
    });

    it('should call input.onChange with result of adapter when adapter is provided', () => {
      const onChangeMockInput = 'onChangeMockInput';
      const onChangeAdapterMockReturnValue = 'onChangeAdapterMockReturnValue';
      const onChangeAdapter = jest.fn().mockReturnValue(onChangeAdapterMockReturnValue);
      const onChangeSpy = jest.fn();
      input.onChange = onChangeSpy;
      const AdaptedInput = reduxFormFieldAdapter({ AntInputComponent: Input, onChangeAdapter });
      const wrapper = shallow(<AdaptedInput input={input} meta={meta} />);

      const renderedOnChangeFn = wrapper.find(Input).prop('onChange');
      expect(renderedOnChangeFn).not.toBe(input.onChange);
      renderedOnChangeFn(onChangeMockInput);
      expect(onChangeAdapter).toHaveBeenCalledWith(onChangeMockInput);
      expect(onChangeSpy).toHaveBeenCalledWith(onChangeAdapterMockReturnValue);
    });
  });
});
