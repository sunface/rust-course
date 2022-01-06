# 最短路径-Bellman Ford

```rust
use std::collections::BTreeMap;
use std::ops::Add;

use std::ops::Neg;

type Graph<V, E> = BTreeMap<V, BTreeMap<V, E>>;

// performs the Bellman-Ford algorithm on the given graph from the given start
// the graph is an undirected graph
//
// if there is a negative weighted loop it returns None
// else it returns a map that for each reachable vertex associates the distance and the predecessor
// since the start has no predecessor but is reachable, map[start] will be None
pub fn bellman_ford<
    V: Ord + Copy,
    E: Ord + Copy + Add<Output = E> + Neg<Output = E> + std::ops::Sub<Output = E>,
>(
    graph: &Graph<V, E>,
    start: &V,
) -> Option<BTreeMap<V, Option<(V, E)>>> {
    let mut ans: BTreeMap<V, Option<(V, E)>> = BTreeMap::new();

    ans.insert(*start, None);

    for _ in 1..(graph.len()) {
        for (u, edges) in graph {
            let dist_u = match ans.get(u) {
                Some(Some((_, d))) => Some(*d),
                Some(None) => None,
                None => continue,
            };

            for (v, d) in edges {
                match ans.get(v) {
                    Some(Some((_, dist)))
                        // if this is a longer path, do nothing
                        if match dist_u {
                            Some(dist_u) => dist_u + *d >= *dist,
                            None => d >= dist,
                        } => {}
                    Some(None) => {
                        match dist_u {
                            // if dist_u + d < 0 there is a negative loop going by start
                            // else it's just a longer path
                            Some(dist_u) if dist_u >= -*d => {}
                            // negative self edge or negative loop
                            _ => {
                                if *d > *d + *d {
                                    return None;
                                }
                            }
                        };
                    }
                    // it's a shorter path: either dist_v was infinite or it was longer than dist_u + d
                    _ => {
                        ans.insert(
                            *v,
                            Some((
                                *u,
                                match dist_u {
                                    Some(dist) => dist + *d,
                                    None => *d,
                                },
                            )),
                        );
                    }
                }
            }
        }
    }

    for (u, edges) in graph {
        for (v, d) in edges {
            match (ans.get(u), ans.get(v)) {
                (Some(None), Some(None)) if *d > *d + *d => return None,
                (Some(None), Some(Some((_, dv)))) if d < dv => return None,
                (Some(Some((_, du))), Some(None)) if *du < -*d => return None,
                (Some(Some((_, du))), Some(Some((_, dv)))) if *du + *d < *dv => return None,
                (_, _) => {}
            }
        }
    }

    Some(ans)
}

#[cfg(test)]
mod tests {
    use super::{bellman_ford, Graph};
    use std::collections::BTreeMap;

    fn add_edge<V: Ord + Copy, E: Ord>(graph: &mut Graph<V, E>, v1: V, v2: V, c: E) {
        graph.entry(v1).or_insert_with(BTreeMap::new).insert(v2, c);
        graph.entry(v2).or_insert_with(BTreeMap::new);
    }

    #[test]
    fn single_vertex() {
        let mut graph: Graph<isize, isize> = BTreeMap::new();
        graph.insert(0, BTreeMap::new());

        let mut dists = BTreeMap::new();
        dists.insert(0, None);

        assert_eq!(bellman_ford(&graph, &0), Some(dists));
    }

    #[test]
    fn single_edge() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 0, 1, 2);

        let mut dists_0 = BTreeMap::new();
        dists_0.insert(0, None);
        dists_0.insert(1, Some((0, 2)));

        assert_eq!(bellman_ford(&graph, &0), Some(dists_0));

        let mut dists_1 = BTreeMap::new();
        dists_1.insert(1, None);

        assert_eq!(bellman_ford(&graph, &1), Some(dists_1));
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

        assert_eq!(bellman_ford(&graph, &1), Some(dists));
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
        assert_eq!(bellman_ford(&graph, &'a'), Some(dists_a));

        let mut dists_b = BTreeMap::new();
        dists_b.insert('b', None);
        dists_b.insert('a', Some(('b', 10)));
        dists_b.insert('c', Some(('a', 22)));
        dists_b.insert('d', Some(('c', 54)));
        assert_eq!(bellman_ford(&graph, &'b'), Some(dists_b));

        let mut dists_c = BTreeMap::new();
        dists_c.insert('c', None);
        dists_c.insert('b', Some(('c', 20)));
        dists_c.insert('d', Some(('c', 32)));
        dists_c.insert('a', Some(('b', 30)));
        assert_eq!(bellman_ford(&graph, &'c'), Some(dists_c));

        let mut dists_d = BTreeMap::new();
        dists_d.insert('d', None);
        assert_eq!(bellman_ford(&graph, &'d'), Some(dists_d));

        let mut dists_e = BTreeMap::new();
        dists_e.insert('e', None);
        dists_e.insert('a', Some(('e', 7)));
        dists_e.insert('c', Some(('a', 19)));
        dists_e.insert('d', Some(('c', 51)));
        dists_e.insert('b', Some(('c', 39)));
        assert_eq!(bellman_ford(&graph, &'e'), Some(dists_e));
    }

    #[test]
    fn graph_2() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 0, 1, 6);
        add_edge(&mut graph, 0, 3, 7);
        add_edge(&mut graph, 1, 2, 5);
        add_edge(&mut graph, 1, 3, 8);
        add_edge(&mut graph, 1, 4, -4);
        add_edge(&mut graph, 2, 1, -2);
        add_edge(&mut graph, 3, 2, -3);
        add_edge(&mut graph, 3, 4, 9);
        add_edge(&mut graph, 4, 0, 3);
        add_edge(&mut graph, 4, 2, 7);

        let mut dists_0 = BTreeMap::new();
        dists_0.insert(0, None);
        dists_0.insert(1, Some((2, 2)));
        dists_0.insert(2, Some((3, 4)));
        dists_0.insert(3, Some((0, 7)));
        dists_0.insert(4, Some((1, -2)));
        assert_eq!(bellman_ford(&graph, &0), Some(dists_0));

        let mut dists_1 = BTreeMap::new();
        dists_1.insert(0, Some((4, -1)));
        dists_1.insert(1, None);
        dists_1.insert(2, Some((4, 3)));
        dists_1.insert(3, Some((0, 6)));
        dists_1.insert(4, Some((1, -4)));
        assert_eq!(bellman_ford(&graph, &1), Some(dists_1));

        let mut dists_2 = BTreeMap::new();
        dists_2.insert(0, Some((4, -3)));
        dists_2.insert(1, Some((2, -2)));
        dists_2.insert(2, None);
        dists_2.insert(3, Some((0, 4)));
        dists_2.insert(4, Some((1, -6)));
        assert_eq!(bellman_ford(&graph, &2), Some(dists_2));

        let mut dists_3 = BTreeMap::new();
        dists_3.insert(0, Some((4, -6)));
        dists_3.insert(1, Some((2, -5)));
        dists_3.insert(2, Some((3, -3)));
        dists_3.insert(3, None);
        dists_3.insert(4, Some((1, -9)));
        assert_eq!(bellman_ford(&graph, &3), Some(dists_3));

        let mut dists_4 = BTreeMap::new();
        dists_4.insert(0, Some((4, 3)));
        dists_4.insert(1, Some((2, 5)));
        dists_4.insert(2, Some((4, 7)));
        dists_4.insert(3, Some((0, 10)));
        dists_4.insert(4, None);
        assert_eq!(bellman_ford(&graph, &4), Some(dists_4));
    }

    #[test]
    fn graph_with_negative_loop() {
        let mut graph = BTreeMap::new();
        add_edge(&mut graph, 0, 1, 6);
        add_edge(&mut graph, 0, 3, 7);
        add_edge(&mut graph, 1, 2, 5);
        add_edge(&mut graph, 1, 3, 8);
        add_edge(&mut graph, 1, 4, -4);
        add_edge(&mut graph, 2, 1, -4);
        add_edge(&mut graph, 3, 2, -3);
        add_edge(&mut graph, 3, 4, 9);
        add_edge(&mut graph, 4, 0, 3);
        add_edge(&mut graph, 4, 2, 7);

        assert_eq!(bellman_ford(&graph, &0), None);
        assert_eq!(bellman_ford(&graph, &1), None);
        assert_eq!(bellman_ford(&graph, &2), None);
        assert_eq!(bellman_ford(&graph, &3), None);
        assert_eq!(bellman_ford(&graph, &4), None);
    }
}
```