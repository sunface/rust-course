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
import { Button, Modal } from 'antd';
import { shallow } from 'enzyme';

import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import * as track from './KeyboardShortcutsHelp.track';

describe('KeyboardShortcutsHelp', () => {
  const testClassName = 'test--ClassName';
  const wrapper = shallow(<KeyboardShortcutsHelp className={testClassName} />);
  let trackSpy;

  beforeAll(() => {
    trackSpy = jest.spyOn(track, 'default');
  });

  beforeEach(() => {
    trackSpy.mockReset();
  });

  it('renders as expected', () => {
    expect(wrapper.find(Button).hasClass(testClassName)).toBe(true);
    expect(wrapper).toMatchSnapshot();
  });

  it('opens modal and tracks its opening', () => {
    expect(wrapper.setState({ visible: false }));

    wrapper.find(Button).simulate('click', {});
    expect(wrapper.state('visible')).toBe(true);
    expect(trackSpy).toHaveBeenCalled();
  });

  it('closes modal', () => {
    wrapper.setState({ visible: true });
    wrapper.find(Modal).prop('onOk')();
    expect(wrapper.state('visible')).toBe(false);

    wrapper.setState({ visible: true });
    wrapper.find(Modal).prop('onCancel')();
    expect(wrapper.state('visible')).toBe(false);
  });
});
