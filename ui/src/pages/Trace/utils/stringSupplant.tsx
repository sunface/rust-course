// Copyright (c) 2020 The Jaeger Authors.
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

const PARAMETER_REG_EXP = /#\{([^{}]*)\}/g;

export function encodedStringSupplant(
  str: string,
  encodeFn: null | ((unencoded: string | number) => string),
  map: Record<string, string | number | undefined>
) {
  return str.replace(PARAMETER_REG_EXP, (_, name) => {
    const mapValue = map[name];
    const value = mapValue != null && encodeFn ? encodeFn(mapValue) : mapValue;
    return value == null ? '' : `${value}`;
  });
}

export default function stringSupplant(str: string, map: Record<string, string | number | undefined>) {
  return encodedStringSupplant(str, null, map);
}

export function getParamNames(str: string) {
  const names = new Set<string>();
  str.replace(PARAMETER_REG_EXP, (match, name) => {
    names.add(name);
    return match;
  });
  return Array.from(names);
}
