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

import { TDenseSpan, NodeID } from './types';

export type TIdFactory = (denseSpan: TDenseSpan, parentID: NodeID | null) => NodeID;

export function ancestralPathParentOrLeaf(denseSpan: TDenseSpan, parentID: NodeID | null): NodeID {
  const { children, operation, service } = denseSpan;
  const name = `${service}\t${operation}${children.size ? '' : '\t__LEAF__'}`;
  return parentID ? `${parentID}\v${name}` : name;
}
