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

import { getConfigValue } from './get-config';
import { TScript } from '../../types/config';

export default function() {
  const scripts = getConfigValue('scripts');
  if (scripts) {
    scripts.forEach((script: TScript) => {
      if (script.type === 'inline') {
        const textElem = document.createTextNode(script.text);
        const scriptElem = document.createElement('script');
        scriptElem.append(textElem);
        document.body.appendChild(scriptElem);
      }
    });
  }
}
