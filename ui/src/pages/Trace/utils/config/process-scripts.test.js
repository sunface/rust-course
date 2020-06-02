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

import * as config from './get-config';
import processScripts from './process-scripts';

describe('processScripts', () => {
  const getConfigValueSpy = jest.spyOn(config, 'getConfigValue');
  const createTextNodeSpy = jest.spyOn(document, 'createTextNode');
  const createElementSpy = jest.spyOn(document, 'createElement');
  const appendScriptSpy = jest.spyOn(document.body, 'appendChild');
  const appendTextSpy = jest.fn();
  const mockValue = (text, number) => `${text} --- ${number}`;
  const texts = ['text 0', 'text 1'];
  const configScripts = texts.map(text => ({ text, type: 'inline' }));
  let scriptElems;

  beforeAll(() => {
    createTextNodeSpy.mockImplementation(text => mockValue(text, createTextNodeSpy.mock.calls.length));
    createElementSpy.mockImplementation(text => {
      const script = {
        append: appendTextSpy,
        identifier: mockValue(text, createElementSpy.mock.calls.length),
      };
      scriptElems.push(script);
      return script;
    });
    appendScriptSpy.mockImplementation();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    scriptElems = [];
  });

  it('adds inline scripts', () => {
    getConfigValueSpy.mockReturnValue(configScripts);

    processScripts();
    texts.forEach((text, i) => {
      expect(createTextNodeSpy).toHaveBeenCalledWith(text);
      expect(appendTextSpy).toHaveBeenCalledWith(mockValue(text, 1 + i));
      expect(appendScriptSpy).toHaveBeenCalledWith(scriptElems[i]);
    });
    expect(createElementSpy).toHaveBeenCalledWith('script');
    expect(createElementSpy).toHaveBeenCalledTimes(texts.length);
  });

  it('ignores other script types', () => {
    getConfigValueSpy.mockReturnValue([...configScripts, { type: 'not-inline' }]);

    processScripts();
    expect(createElementSpy).toHaveBeenCalledTimes(texts.length);
  });

  it('handles no scripts', () => {
    getConfigValueSpy.mockReturnValue(undefined);
    expect(processScripts).not.toThrowError();
  });
});
