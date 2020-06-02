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

/**
 * Util to generate an object of key:value pairs where key is
 * `commonPrefix/topLevelTypes[i]` and value is `topLevelTypes[i]` for all `i`
 * in `topLevelTypes`.
 *
 * @example generateActionTypes('a', ['b']) -> {'a/b': 'b'}
 *
 * @param commonPrefix A string that is prepended to each value in
 *                     `topLevelTypes` to create a property name
 * @param topLevelTypes An array of strings to generate property names from and
 *                      to assign as the corresponding values.
 * @returns {{[string]: string}}
 */
export default function generateActionTypes(
  commonPrefix: string,
  topLevelTypes: string[]
): Record<string, string> {
  const rv: Record<string, string> = {};
  topLevelTypes.forEach(type => {
    const fullType = `${commonPrefix}/${type}`;
    rv[type] = fullType;
  });
  return rv;
}
