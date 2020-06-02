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
import { shallow, mount } from 'enzyme';

import ErrorMessage from './ErrorMessage';

describe('<ErrorMessage>', () => {
  let wrapper;
  let error;

  beforeEach(() => {
    error = 'some-error';
    wrapper = shallow(<ErrorMessage error={error} />);
  });

  it('is ok when not passed an error', () => {
    wrapper.setProps({ error: null });
    expect(wrapper).toBeDefined();
  });

  it('renders a message when passed a string', () => {
    const msg = wrapper.find('Message');
    expect(msg.length).toBe(1);
    expect(msg.shallow().text()).toMatch(error);
  });

  describe('rendering more complex errors', () => {
    it('renders the error message', () => {
      error = new Error('another-error');
      wrapper.setProps({ error });
      const msg = wrapper.find('Message');
      expect(msg.length).toBe(1);
      expect(msg.shallow().text()).toMatch(error.message);
    });

    it('renders HTTP related data from the error', () => {
      error = {
        message: 'some-http-ish-message',
        httpStatus: 'value-httpStatus',
        httpStatusText: 'value-httpStatusText',
        httpUrl: 'value-httpUrl',
        httpQuery: 'value-httpQuery',
        httpBody: 'value-httpBody',
      };
      wrapper.setProps({ error });
      const details = wrapper.find('Details');
      expect(details.length).toBe(1);
      const detailsWrapper = details.shallow();
      Object.keys(error).forEach(key => {
        if (key === 'message') {
          return;
        }
        const errorAttr = detailsWrapper.find(`ErrorAttr[value="${error[key]}"]`);
        expect(errorAttr.length).toBe(1);
      });
    });
  });

  it('is fine when mounted', () => {
    error = { message: 'le-error', httpStatus: 'some-status' };
    wrapper = mount(<ErrorMessage error={error} />);
    expect(wrapper).toBeDefined();
  });
});
