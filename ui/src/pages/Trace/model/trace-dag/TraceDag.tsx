// Copyright (c) 2018-2020 The Jaeger Authors.
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

import DenseTrace from './DenseTrace';
import { ancestralPathParentOrLeaf, TIdFactory } from './id-factories';
import { TDenseSpan, TDiffCounts, NodeID, TDenseSpanMembers } from './types';
import TDagNode from './types/TDagNode';
import { Trace } from '../../types/trace';

export default class TraceDag<TData extends { [k: string]: unknown } = {}> {
  static newFromTrace(trace: Trace, idFactory: TIdFactory = ancestralPathParentOrLeaf) {
    const dag: TraceDag<TDenseSpanMembers> = new TraceDag();
    const { denseSpansMap, rootIDs } = new DenseTrace(trace);

    function addDenseSpan(denseSpan: TDenseSpan | undefined, parentNodeID: NodeID | null) {
      if (!denseSpan) {
        // eslint-disable-next-line no-console
        console.warn(`Missing dense span`);
        return;
      }
      const { children, operation, service, skipToChild } = denseSpan;
      let id: NodeID | null;

      if (!skipToChild) {
        id = idFactory(denseSpan, parentNodeID);
        const node =
          dag.getNode(id) ||
          dag.addNode(id, parentNodeID, {
            operation,
            service,
            members: [],
          });
        node.members.push(denseSpan);
      } else {
        id = parentNodeID;
      }
      children.forEach(childId => addDenseSpan(denseSpansMap.get(childId), id));
    }

    rootIDs.forEach(rootId => addDenseSpan(denseSpansMap.get(rootId), null));
    return dag;
  }

  static diff(a: TraceDag<TDenseSpanMembers>, b: TraceDag<TDenseSpanMembers>) {
    const dag: TraceDag<TDiffCounts> = new TraceDag();

    function makeDiffNode(id: NodeID) {
      const nodeA = a.nodesMap.get(id);
      const nodeB = b.nodesMap.get(id);
      const parentNodeID = (nodeA && nodeA.parentID) || (nodeB && nodeB.parentID) || null;
      const members = [...(nodeA ? nodeA.members : []), ...(nodeB ? nodeB.members : [])];
      dag.addNode(id, parentNodeID, {
        members,
        a: nodeA ? nodeA.members : null,
        b: nodeB ? nodeB.members : null,
        operation: (nodeA && nodeA.operation) || (nodeB && nodeB.operation) || '__UNSET__',
        service: (nodeA && nodeA.service) || (nodeB && nodeB.service) || '__UNSET__',
      });
    }

    const ids = new Set([...a.nodesMap.keys(), ...b.nodesMap.keys()]);
    ids.forEach(makeDiffNode);
    return dag;
  }

  nodesMap: Map<NodeID, TDagNode<TData>>;
  rootIDs: Set<NodeID>;

  constructor() {
    this.nodesMap = new Map();
    this.rootIDs = new Set();
  }

  hasNode(id: NodeID) {
    return this.nodesMap.has(id);
  }

  getNode(id: NodeID) {
    return this.nodesMap.get(id);
  }

  mustGetNode(id: NodeID) {
    const node = this.getNode(id);
    if (!node) {
      throw new Error(`Node not found: ${JSON.stringify(id)}`);
    }
    return node;
  }

  addNode(id: NodeID, parentID: NodeID | null, data: TData) {
    if (this.hasNode(id)) {
      throw new Error(`Node already added: ${JSON.stringify(id)}`);
    }
    const node: TDagNode<TData> = {
      ...data,
      id,
      parentID,
      children: new Set(),
    };
    this.nodesMap.set(id, node);
    if (!parentID) {
      this.rootIDs.add(id);
    } else {
      const parentNode = this.nodesMap.get(parentID);
      if (parentNode) {
        parentNode.children.add(id);
      }
    }
    return node;
  }
}
