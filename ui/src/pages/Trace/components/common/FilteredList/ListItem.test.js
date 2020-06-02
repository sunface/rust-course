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

import React from 'react';
import { shallow } from 'enzyme';

import ListItem from './ListItem';

describe('<ListItem>', () => {
  let wrapper;
  let props;
  let setValue;

  beforeEach(() => {
    setValue = jest.fn();
    props = {
      style: {},
      index: 0,
      data: {
        setValue,
        focusedIndex: null,
        highlightQuery: '',
        options: ['a', 'b'],
        selectedValue: null,
      },
    };
    wrapper = shallow(<ListItem {...props} />);
  });

  it('renders without exploding', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('is focused when the index is the focusIndex', () => {
    const data = { ...props.data, focusedIndex: props.index };
    wrapper.setProps({ data });
    expect(wrapper).toMatchSnapshot();
  });

  it('is selected when options[index] == selectedValue', () => {
    const data = { ...props.data, selectedValue: props.data.options[props.index] };
    wrapper.setProps({ data });
    expect(wrapper).toMatchSnapshot();
  });

  it('sets the value when clicked', () => {
    expect(setValue.mock.calls.length).toBe(0);
    wrapper.simulate('click');
    expect(setValue.mock.calls).toEqual([[props.data.options[props.index]]]);
  });
});
