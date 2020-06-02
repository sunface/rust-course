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
import { FixedSizeList as VList } from 'react-window';
import { Key as EKey } from 'ts-key-enum';

import FilteredList from './index';

describe('<FilteredList>', () => {
  const words = ['and', 'apples', 'are'];
  const numbers = ['0', '1', '2'];

  let props;
  let wrapper;

  const getData = () => wrapper.find(VList).prop('itemData');

  const keyDown = key => wrapper.find('input').simulate('keydown', { key });

  beforeEach(() => {
    props = {
      cancel: jest.fn(),
      options: words.concat(numbers),
      value: null,
      setValue: jest.fn(),
    };
    wrapper = shallow(<FilteredList {...props} />);
  });

  it('renders without exploding', () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('puts the focus on the input on update', () => {
    const fn = jest.fn();
    wrapper.instance().inputRef = {
      current: {
        focus: fn,
      },
    };
    wrapper.setProps({ value: 'anything' });
    expect(fn.mock.calls.length).toBe(1);
  });

  it('filters options based on the current input text', () => {
    expect(getData().options).toEqual(props.options);
    wrapper.find('input').simulate('change', { target: { value: 'a' } });
    expect(getData().options).toEqual(words);
  });

  it('setting the value clears the filter and focus index', () => {
    const n = -99;
    const s = 'a';
    wrapper.setState({ filterText: s, focusedIndex: n });
    let data = getData();
    expect(data.focusedIndex).toBe(n);
    expect(data.options).toEqual(words);

    data.setValue('anything');
    data = getData();
    expect(data.options.length).toBe(props.options.length);
    expect(data.focusedIndex).toBe(null);
  });

  describe('up / down arrow keys', () => {
    let indices;

    beforeAll(jest.useFakeTimers);

    beforeEach(() => {
      indices = {
        visibleStartIndex: 1,
        visibleStopIndex: props.options.length - 1,
      };
      wrapper.instance().onListItemsRendered(indices);
      jest.runAllTimers();
    });

    afterAll(jest.useRealTimers);

    it('down arrow sets the focus index to the first visible item when focusIndex == null', () => {
      keyDown(EKey.ArrowDown);
      expect(wrapper.state('focusedIndex')).toBe(indices.visibleStartIndex);
    });

    it('up arrow sets the focus index to the last visible item when focusIndex == null', () => {
      keyDown(EKey.ArrowUp);
      expect(wrapper.state('focusedIndex')).toBe(indices.visibleStopIndex);
    });

    it('shift the focus index to the next element', () => {
      keyDown(EKey.ArrowUp);
      expect(wrapper.state('focusedIndex')).toBe(indices.visibleStopIndex);
      keyDown(EKey.ArrowUp);
      expect(wrapper.state('focusedIndex')).toBe(indices.visibleStopIndex - 1);
    });

    it('cause the view to scroll if necessary', () => {
      const fn = jest.fn();
      keyDown(EKey.ArrowDown);
      expect(wrapper.state('focusedIndex')).toBe(indices.visibleStartIndex);
      wrapper.instance().vlistRef = {
        current: {
          scrollToItem: fn,
        },
      };
      keyDown(EKey.ArrowUp);
      expect(wrapper.state('focusedIndex')).toBe(indices.visibleStartIndex - 1);
      expect(fn.mock.calls).toEqual([[indices.visibleStartIndex - 1]]);
    });
  });

  it('escape triggers cancel', () => {
    expect(props.cancel.mock.calls.length).toBe(0);
    keyDown(EKey.Escape);
    expect(props.cancel.mock.calls.length).toBe(1);
  });

  it('enter selects the current focus index', () => {
    const focusedIndex = 0;
    expect(props.setValue.mock.calls.length).toBe(0);
    wrapper.setState({ focusedIndex });
    keyDown(EKey.Enter);
    expect(props.setValue.mock.calls).toEqual([[props.options[focusedIndex]]]);
  });

  it('enter selects the filteredOption if there is only one option', () => {
    const value = words[1];
    wrapper.find('input').simulate('change', { target: { value } });
    expect(props.setValue.mock.calls.length).toBe(0);
    keyDown(EKey.Enter);
    expect(props.setValue.mock.calls).toEqual([[value]]);
  });

  it('enter is ignored when an item is not focused', () => {
    expect(props.setValue.mock.calls.length).toBe(0);
    keyDown(EKey.Enter);
    expect(props.setValue.mock.calls.length).toBe(0);
  });

  it('scrolling unsets the focus index', () => {
    jest.useFakeTimers();
    wrapper.setState({ focusedIndex: 0 });
    wrapper.instance().onListScrolled({ scrollUpdateWasRequested: false });
    jest.runAllTimers();
    expect(wrapper.state('focusedIndex')).toBe(null);
  });
});
