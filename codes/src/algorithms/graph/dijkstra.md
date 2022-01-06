# 最短路径-Dijkstra

```rust
use std::cmp::Reverse;
use std::collections::{BTreeMap, BinaryHeap};
use std::ops::Add;

type Graph<V, E> = BTreeMap<V, BTreeMap<V, E>>;

// performs Dijsktra's algorithm on the given graph from the given start
// the graph is a positively-weighted undirected graph
//
// returns a map that for each reachable vertex associates the distance and the predecessor
// since the start has no predecessor but is reachable, map[start] will be None
pub fn dijkstra<V: Ord + Copy, E: Ord + Copy + Add<Output = E>>(
    graph: &Graph<V, E>,
    start: &V,
) -> BTreeMap<V, Option<(V, E)>> {
    let mut ans = BTreeMap::new();
    let mut prio = BinaryHeap::new();

    // start is the special case that doesn't have a predecessor
    ans.insert(*start, None);

    for (new, weight) in &graph[start] {
        ans.insert(*new, Some((*start, *weight)));
        prio.push(Reverse((*weight, new, start)));
    }

    while let Some(Reverse((dist_new, new, prev))) = prio.pop() {
        match ans[new] {
            // what we popped is what is in ans, we'll compute it
            Some((p, d)) if p == *prev && d == dist_new => {}
            // otherwise it's not interesting
            _ => continue,
        }

        for (next, weight) in &graph[new] {
            match ans.get(next) {
                // if ans[next] is a lower dist than the alternative one, we do nothing
                Some(Some((_, dist_next))) if dist_new + *weight >= *dist_next => {}
                // if ans[next] is None then next is start and so the distance won't be changed, it won't be added again in prio
                Some(None) => {}
                // the new path is shorter, either new was not in ans or it was farther
                _ => {
                    ans.insert(*next, Some((*new, *weight + dist_new)));
                    prio.push(Reverse((*weight + dist_new, next, new)));
                }
            }
        }
    }

    ans
}

#[cfg(test)]
mod tests {
    use super::{dijkstra, Graph};
    use std::collections::BTreeMap;

    fn add_edge<V: Ord + Copy, E: Ord>(graph: &mut Graph<V, E>, v1: V, v2: V, c: E) {
        graph.entry(v1).or_insert_with(BTreeMap::new).insert(v2, c);
        graph.entry(v2).or_insert_with(BTreeMap::new);
    }

    #[test]
    fn single_vertex() {
        let mut graph: Graph<usize, usize> = BTreeMap::new();
        graph.insert(0, BTreeMap::new());

        let mut dists = BTreeMap::new();
        dists.insert(0, None);

        assert_eq!(dijkstra(&graph, &0), dists);
    }

    #[test]
    fn single_edge() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 0, 1, 2);

        let mut dists_0 = BTreeMap::new();
        dists_0.insert(0, None);
        dists_0.insert(1, Some((0, 2)));

        assert_eq!(dijkstra(&graph, &0), dists_0);

        let mut dists_1 = BTreeMap::new();
        dists_1.insert(1, None);

        assert_eq!(dijkstra(&graph, &1), dists_1);
    }

    #[test]
    fn tree_1() {
        let mut graph = BTreeMap::new();
        let mut dists = BTreeMap::new();
        dists.insert(1, None);
        for i in 1..100 {
            add_edge(&mut graph, i, i * 2, i * 2);
            add_edge(&mut graph, i, i * 2 + 1, i * 2 + 1);

            match dists[&i] {
                Some((_, d)) => {
                    dists.insert(i * 2, Some((i, d + i * 2)));
                    dists.insert(i * 2 + 1, Some((i, d + i * 2 + 1)));
                }
                None => {
                    dists.insert(i * 2, Some((i, i * 2)));
                    dists.insert(i * 2 + 1, Some((i, i * 2 + 1)));
                }
            }
        }

        assert_eq!(dijkstra(&graph, &1), dists);
    }

    #[test]
    fn graph_1() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 'a', 'c', 12);
        add_edge(&mut graph, 'a', 'd', 60);
        add_edge(&mut graph, 'b', 'a', 10);
        add_edge(&mut graph, 'c', 'b', 20);
        add_edge(&mut graph, 'c', 'd', 32);
        add_edge(&mut graph, 'e', 'a', 7);

        let mut dists_a = BTreeMap::new();
        dists_a.insert('a', None);
        dists_a.insert('c', Some(('a', 12)));
        dists_a.insert('d', Some(('c', 44)));
        dists_a.insert('b', Some(('c', 32)));
        assert_eq!(dijkstra(&graph, &'a'), dists_a);

        let mut dists_b = BTreeMap::new();
        dists_b.insert('b', None);
        dists_b.insert('a', Some(('b', 10)));
        dists_b.insert('c', Some(('a', 22)));
        dists_b.insert('d', Some(('c', 54)));
        assert_eq!(dijkstra(&graph, &'b'), dists_b);

        let mut dists_c = BTreeMap::new();
        dists_c.insert('c', None);
        dists_c.insert('b', Some(('c', 20)));
        dists_c.insert('d', Some(('c', 32)));
        dists_c.insert('a', Some(('b', 30)));
        assert_eq!(dijkstra(&graph, &'c'), dists_c);

        let mut dists_d = BTreeMap::new();
        dists_d.insert('d', None);
        assert_eq!(dijkstra(&graph, &'d'), dists_d);

        let mut dists_e = BTreeMap::new();
        dists_e.insert('e', None);
        dists_e.insert('a', Some(('e', 7)));
        dists_e.insert('c', Some(('a', 19)));
        dists_e.insert('d', Some(('c', 51)));
        dists_e.insert('b', Some(('c', 39)));
        assert_eq!(dijkstra(&graph, &'e'), dists_e);
    }
}
```