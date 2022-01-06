# Prim算法(最小生成树)

```rust
use std::cmp::Reverse;
use std::collections::{BTreeMap, BinaryHeap};
use std::ops::Add;

type Graph<V, E> = BTreeMap<V, BTreeMap<V, E>>;

fn add_edge<V: Ord + Copy, E: Ord + Add + Copy>(graph: &mut Graph<V, E>, v1: V, v2: V, c: E) {
    graph.entry(v1).or_insert_with(BTreeMap::new).insert(v2, c);
    graph.entry(v2).or_insert_with(BTreeMap::new).insert(v1, c);
}

// selects a start and run the algorithm from it
pub fn prim<V: Ord + Copy + std::fmt::Debug, E: Ord + Add + Copy + std::fmt::Debug>(
    graph: &Graph<V, E>,
) -> Graph<V, E> {
    match graph.keys().next() {
        Some(v) => prim_with_start(graph, *v),
        None => BTreeMap::new(),
    }
}

// only works for a connected graph
// if the given graph is not connected it will return the MST of the connected subgraph
pub fn prim_with_start<V: Ord + Copy, E: Ord + Add + Copy>(
    graph: &Graph<V, E>,
    start: V,
) -> Graph<V, E> {
    // will contain the MST
    let mut mst: Graph<V, E> = Graph::new();
    // a priority queue based on a binary heap, used to get the cheapest edge
    // the elements are an edge: the cost, destination and source
    let mut prio = BinaryHeap::new();

    mst.insert(start, BTreeMap::new());

    for (v, c) in &graph[&start] {
        // the heap is a max heap, we have to use Reverse when adding to simulate a min heap
        prio.push(Reverse((*c, v, start)));
    }

    while let Some(Reverse((dist, t, prev))) = prio.pop() {
        // the destination of the edge has already been seen
        if mst.contains_key(t) {
            continue;
        }

        // the destination is a new vertex
        add_edge(&mut mst, prev, *t, dist);

        for (v, c) in &graph[t] {
            if !mst.contains_key(v) {
                prio.push(Reverse((*c, v, *t)));
            }
        }
    }

    mst
}

#[cfg(test)]
mod tests {
    use super::{add_edge, prim, Graph};
    use std::collections::BTreeMap;

    #[test]
    fn empty() {
        assert_eq!(prim::<usize, usize>(&BTreeMap::new()), BTreeMap::new());
    }

    #[test]
    fn single_vertex() {
        let mut graph: Graph<usize, usize> = BTreeMap::new();
        graph.insert(42, BTreeMap::new());

        assert_eq!(prim(&graph), graph);
    }

    #[test]
    fn single_edge() {
        let mut graph = BTreeMap::new();

        add_edge(&mut graph, 42, 666, 12);

        assert_eq!(prim(&graph), graph);
    }

    #[test]
    fn tree_1() {
        let mut graph = BTreeMap::new();

        add_edge(&mut graph, 0, 1, 10);
        add_edge(&mut graph, 0, 2, 11);
        add_edge(&mut graph, 2, 3, 12);
        add_edge(&mut graph, 2, 4, 13);
        add_edge(&mut graph, 1, 5, 14);
        add_edge(&mut graph, 1, 6, 15);
        add_edge(&mut graph, 3, 7, 16);

        assert_eq!(prim(&graph), graph);
    }

    #[test]
    fn tree_2() {
        let mut graph = BTreeMap::new();

        add_edge(&mut graph, 1, 2, 11);
        add_edge(&mut graph, 2, 3, 12);
        add_edge(&mut graph, 2, 4, 13);
        add_edge(&mut graph, 4, 5, 14);
        add_edge(&mut graph, 4, 6, 15);
        add_edge(&mut graph, 6, 7, 16);

        assert_eq!(prim(&graph), graph);
    }

    #[test]
    fn tree_3() {
        let mut graph = BTreeMap::new();

        for i in 1..100 {
            add_edge(&mut graph, i, 2 * i, i);
            add_edge(&mut graph, i, 2 * i + 1, -i);
        }

        assert_eq!(prim(&graph), graph);
    }

    #[test]
    fn graph_1() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 'a', 'b', 6);
        add_edge(&mut graph, 'a', 'c', 7);
        add_edge(&mut graph, 'a', 'e', 2);
        add_edge(&mut graph, 'a', 'f', 3);
        add_edge(&mut graph, 'b', 'c', 5);
        add_edge(&mut graph, 'c', 'e', 5);
        add_edge(&mut graph, 'd', 'e', 4);
        add_edge(&mut graph, 'd', 'f', 1);
        add_edge(&mut graph, 'e', 'f', 2);

        let mut ans = BTreeMap::new();
        add_edge(&mut ans, 'd', 'f', 1);
        add_edge(&mut ans, 'e', 'f', 2);
        add_edge(&mut ans, 'a', 'e', 2);
        add_edge(&mut ans, 'b', 'c', 5);
        add_edge(&mut ans, 'c', 'e', 5);

        assert_eq!(prim(&graph), ans);
    }

    #[test]
    fn graph_2() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 1, 2, 6);
        add_edge(&mut graph, 1, 3, 1);
        add_edge(&mut graph, 1, 4, 5);
        add_edge(&mut graph, 2, 3, 5);
        add_edge(&mut graph, 2, 5, 3);
        add_edge(&mut graph, 3, 4, 5);
        add_edge(&mut graph, 3, 5, 6);
        add_edge(&mut graph, 3, 6, 4);
        add_edge(&mut graph, 4, 6, 2);
        add_edge(&mut graph, 5, 6, 6);

        let mut ans = BTreeMap::new();
        add_edge(&mut ans, 1, 3, 1);
        add_edge(&mut ans, 4, 6, 2);
        add_edge(&mut ans, 2, 5, 3);
        add_edge(&mut ans, 2, 3, 5);
        add_edge(&mut ans, 3, 6, 4);

        assert_eq!(prim(&graph), ans);
    }

    #[test]
    fn graph_3() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, "v1", "v2", 1);
        add_edge(&mut graph, "v1", "v3", 3);
        add_edge(&mut graph, "v1", "v5", 6);
        add_edge(&mut graph, "v2", "v3", 2);
        add_edge(&mut graph, "v2", "v4", 3);
        add_edge(&mut graph, "v2", "v5", 5);
        add_edge(&mut graph, "v3", "v4", 5);
        add_edge(&mut graph, "v3", "v6", 2);
        add_edge(&mut graph, "v4", "v5", 2);
        add_edge(&mut graph, "v4", "v6", 4);
        add_edge(&mut graph, "v5", "v6", 1);

        let mut ans = BTreeMap::new();
        add_edge(&mut ans, "v1", "v2", 1);
        add_edge(&mut ans, "v5", "v6", 1);
        add_edge(&mut ans, "v2", "v3", 2);
        add_edge(&mut ans, "v3", "v6", 2);
        add_edge(&mut ans, "v4", "v5", 2);

        assert_eq!(prim(&graph), ans);
    }
}
```