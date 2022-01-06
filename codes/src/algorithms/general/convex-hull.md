# 凸包算法

```rust
use std::cmp::Ordering::Equal;

fn sort_by_min_angle(pts: &[(f64, f64)], min: &(f64, f64)) -> Vec<(f64, f64)> {
    let mut points: Vec<(f64, f64, (f64, f64))> = pts
        .iter()
        .map(|x| {
            (
                ((x.1 - min.1) as f64).atan2((x.0 - min.0) as f64),
                // angle
                ((x.1 - min.1) as f64).hypot((x.0 - min.0) as f64),
                // distance (we want the closest to be first)
                *x,
            )
        })
        .collect();
    points.sort_by(|a, b| a.partial_cmp(b).unwrap_or(Equal));
    points.into_iter().map(|x| x.2).collect()
}

// calculates the z coordinate of the vector product of vectors ab and ac
fn calc_z_coord_vector_product(a: &(f64, f64), b: &(f64, f64), c: &(f64, f64)) -> f64 {
    (b.0 - a.0) * (c.1 - a.1) - (c.0 - a.0) * (b.1 - a.1)
}

/*
    If three points are aligned and are part of the convex hull then the three are kept.
    If one doesn't want to keep those points, it is easy to iterate the answer and remove them.
    The first point is the one with the lowest y-coordinate and the lowest x-coordinate.
    Points are then given counter-clockwise, and the closest one is given first if needed.
*/
pub fn convex_hull_graham(pts: &[(f64, f64)]) -> Vec<(f64, f64)> {
    if pts.is_empty() {
        return vec![];
    }

    let mut stack: Vec<(f64, f64)> = vec![];
    let min = pts
        .iter()
        .min_by(|a, b| {
            let ord = a.1.partial_cmp(&b.1).unwrap_or(Equal);
            match ord {
                Equal => a.0.partial_cmp(&b.0).unwrap_or(Equal),
                o => o,
            }
        })
        .unwrap();
    let points = sort_by_min_angle(pts, min);

    if points.len() <= 3 {
        return points;
    }

    for point in points {
        while stack.len() > 1
            && calc_z_coord_vector_product(&stack[stack.len() - 2], &stack[stack.len() - 1], &point)
                < 0.
        {
            stack.pop();
        }
        stack.push(point);
    }

    stack
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty() {
        assert_eq!(convex_hull_graham(&vec![]), vec![]);
    }

    #[test]
    fn not_enough_points() {
        let list = vec![(0f64, 0f64)];
        assert_eq!(convex_hull_graham(&list), list);
    }

    #[test]
    fn not_enough_points1() {
        let list = vec![(2f64, 2f64), (1f64, 1f64), (0f64, 0f64)];
        let ans = vec![(0f64, 0f64), (1f64, 1f64), (2f64, 2f64)];
        assert_eq!(convex_hull_graham(&list), ans);
    }

    #[test]
    fn not_enough_points2() {
        let list = vec![(2f64, 2f64), (1f64, 2f64), (0f64, 0f64)];
        let ans = vec![(0f64, 0f64), (2f64, 2f64), (1f64, 2f64)];
        assert_eq!(convex_hull_graham(&list), ans);
    }

    #[test]
    // from https://codegolf.stackexchange.com/questions/11035/find-the-convex-hull-of-a-set-of-2d-points
    fn lots_of_points() {
        let list = vec![
            (4.4, 14.),
            (6.7, 15.25),
            (6.9, 12.8),
            (2.1, 11.1),
            (9.5, 14.9),
            (13.2, 11.9),
            (10.3, 12.3),
            (6.8, 9.5),
            (3.3, 7.7),
            (0.6, 5.1),
            (5.3, 2.4),
            (8.45, 4.7),
            (11.5, 9.6),
            (13.8, 7.3),
            (12.9, 3.1),
            (11., 1.1),
        ];
        let ans = vec![
            (11., 1.1),
            (12.9, 3.1),
            (13.8, 7.3),
            (13.2, 11.9),
            (9.5, 14.9),
            (6.7, 15.25),
            (4.4, 14.),
            (2.1, 11.1),
            (0.6, 5.1),
            (5.3, 2.4),
        ];

        assert_eq!(convex_hull_graham(&list), ans);
    }

    #[test]
    // from https://codegolf.stackexchange.com/questions/11035/find-the-convex-hull-of-a-set-of-2d-points
    fn lots_of_points2() {
        let list = vec![
            (1., 0.),
            (1., 1.),
            (1., -1.),
            (0.68957, 0.283647),
            (0.909487, 0.644276),
            (0.0361877, 0.803816),
            (0.583004, 0.91555),
            (-0.748169, 0.210483),
            (-0.553528, -0.967036),
            (0.316709, -0.153861),
            (-0.79267, 0.585945),
            (-0.700164, -0.750994),
            (0.452273, -0.604434),
            (-0.79134, -0.249902),
            (-0.594918, -0.397574),
            (-0.547371, -0.434041),
            (0.958132, -0.499614),
            (0.039941, 0.0990732),
            (-0.891471, -0.464943),
            (0.513187, -0.457062),
            (-0.930053, 0.60341),
            (0.656995, 0.854205),
        ];
        let ans = vec![
            (1., -1.),
            (1., 0.),
            (1., 1.),
            (0.583004, 0.91555),
            (0.0361877, 0.803816),
            (-0.930053, 0.60341),
            (-0.891471, -0.464943),
            (-0.700164, -0.750994),
            (-0.553528, -0.967036),
        ];

        assert_eq!(convex_hull_graham(&list), ans);
    }
}
```