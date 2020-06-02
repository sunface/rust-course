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

import React from 'react';
import { mount } from 'enzyme';

import TimelineColumnResizer from './TimelineColumnResizer';

describe('<TimelineColumnResizer>', () => {
  let wrapper;
  let instance;

  const props = {
    min: 0.1,
    max: 0.9,
    onChange: jest.fn(),
    position: 0.5,
  };

  beforeEach(() => {
    props.onChange.mockReset();
    wrapper = mount(<TimelineColumnResizer {...props} />);
    instance = wrapper.instance();
  });

  it('renders without exploding', () => {
    expect(wrapper).toBeDefined();
    expect(wrapper.find('.TimelineColumnResizer').length).toBe(1);
    expect(wrapper.find('.TimelineColumnResizer--gripIcon').length).toBe(1);
    expect(wrapper.find('.TimelineColumnResizer--dragger').length).toBe(1);
  });

  it('sets the root elm', () => {
    const rootWrapper = wrapper.find('.TimelineColumnResizer');
    expect(rootWrapper.getDOMNode()).toBe(instance._rootElm);
  });

  describe('uses DraggableManager', () => {
    it('handles mouse down on the dragger', () => {
      const dragger = wrapper.find({ onMouseDown: instance._dragManager.handleMouseDown });
      expect(dragger.length).toBe(1);
      expect(dragger.is('.TimelineColumnResizer--dragger')).toBe(true);
    });

    it('returns the draggable bounds via _getDraggingBounds()', () => {
      const left = 10;
      const width = 100;
      instance._rootElm.getBoundingClientRect = () => ({ left, width });
      expect(instance._getDraggingBounds()).toEqual({
        width,
        clientXLeft: left,
        maxValue: props.max,
        minValue: props.min,
      });
    });

    it('handles drag start', () => {
      const value = Math.random();
      expect(wrapper.state('dragPosition')).toBe(null);
      instance._handleDragUpdate({ value });
      expect(wrapper.state('dragPosition')).toBe(value);
    });

    it('handles drag end', () => {
      const manager = { resetBounds: jest.fn() };
      const value = Math.random();
      wrapper.setState({ dragPosition: 2 * value });
      instance._handleDragEnd({ manager, value });
      expect(manager.resetBounds.mock.calls).toEqual([[]]);
      expect(wrapper.state('dragPosition')).toBe(null);
      expect(props.onChange.mock.calls).toEqual([[value]]);
    });
  });

  it('does not render a dragging indicator when not dragging', () => {
    expect(wrapper.find('.isDraggingLeft').length + wrapper.find('.isDraggingRight').length).toBe(0);
    expect(wrapper.find('.TimelineColumnResizer--dragger').prop('style').right).toBe(undefined);
  });

  it('renders a dragging indicator when dragging', () => {
    instance._dragManager.isDragging = () => true;
    instance._handleDragUpdate({ value: props.min });
    instance.forceUpdate();
    wrapper.update();
    expect(wrapper.find('.isDraggingLeft').length + wrapper.find('.isDraggingRight').length).toBe(1);
    expect(wrapper.find('.TimelineColumnResizer--dragger').prop('style').right).toBeDefined();
  });
});
