# 最近点算法

```rust
type Point = (f64, f64);
use std::cmp::Ordering;

fn point_cmp((a1, a2): &Point, (b1, b2): &Point) -> Ordering {
    let acmp = f64_cmp(a1, b1);
    match acmp {
        Ordering::Equal => f64_cmp(a2, b2),
        _ => acmp,
    }
}

fn f64_cmp(a: &f64, b: &f64) -> Ordering {
    a.partial_cmp(b).unwrap()
}

/// returns the two closest points
/// or None if there are zero or one point
pub fn closest_points(points: &[Point]) -> Option<(Point, Point)> {
    let mut points: Vec<Point> = points.to_vec();
    points.sort_by(point_cmp);

    closest_points_aux(&points, 0, points.len())
}

fn dist((x1, y1): &Point, (x2, y2): &Point) -> f64 {
    let dx = *x1 - *x2;
    let dy = *y1 - *y2;

    (dx * dx + dy * dy).sqrt()
}

fn closest_points_aux(
    points: &[Point],
    mut start: usize,
    mut end: usize,
) -> Option<(Point, Point)> {
    let n = end - start;

    if n <= 1 {
        return None;
    }

    if n <= 3 {
        // bruteforce
        let mut min = dist(&points[0], &points[1]);
        let mut pair = (points[0], points[1]);

        for i in 0..n {
            for j in (i + 1)..n {
                let new = dist(&points[i], &points[j]);
                if new < min {
                    min = new;
                    pair = (points[i], points[j]);
                }
            }
        }
        return Some(pair);
    }

    let mid = (start + end) / 2;
    let left = closest_points_aux(points, start, mid);
    let right = closest_points_aux(points, mid, end);

    let (mut min_dist, mut pair) = match (left, right) {
        (Some((l1, l2)), Some((r1, r2))) => {
            let dl = dist(&l1, &l2);
            let dr = dist(&r1, &r2);
            if dl < dr {
                (dl, (l1, l2))
            } else {
                (dr, (r1, r2))
            }
        }
        (Some((a, b)), None) => (dist(&a, &b), (a, b)),
        (None, Some((a, b))) => (dist(&a, &b), (a, b)),
        (None, None) => unreachable!(),
    };

    let mid_x = points[mid].0;
    while points[start].0 < mid_x - min_dist {
        start += 1;
    }
    while points[end - 1].0 > mid_x + min_dist {
        end -= 1;
    }

    let mut mids: Vec<&Point> = points[start..end].iter().collect();
    mids.sort_by(|a, b| f64_cmp(&a.1, &b.1));

    for (i, e) in mids.iter().enumerate() {
        for k in 1..8 {
            if i + k >= mids.len() {
                break;
            }

            let new = dist(e, mids[i + k]);
            if new < min_dist {
                min_dist = new;
                pair = (**e, *mids[i + k]);
            }
        }
    }

    Some(pair)
}

#[cfg(test)]
mod tests {
    use super::closest_points;
    use super::Point;

    fn eq(p1: Option<(Point, Point)>, p2: Option<(Point, Point)>) -> bool {
        match (p1, p2) {
            (None, None) => true,
            (Some((p1, p2)), Some((p3, p4))) => (p1 == p3 && p2 == p4) || (p1 == p4 && p2 == p3),
            _ => false,
        }
    }

    macro_rules! assert_display {
        ($left: expr, $right: expr) => {
            assert!(
                eq($left, $right),
                "assertion failed: `(left == right)`\nleft: `{:?}`,\nright: `{:?}`",
                $left,
                $right
            )
        };
    }

    #[test]
    fn zero_points() {
        let vals: [Point; 0] = [];
        assert_display!(closest_points(&vals), None::<(Point, Point)>);
    }

    #[test]
    fn one_points() {
        let vals = [(0., 0.)];
        assert_display!(closest_points(&vals), None::<(Point, Point)>);
    }

    #[test]
    fn two_points() {
        let vals = [(0., 0.), (1., 1.)];
        assert_display!(closest_points(&vals), Some(((0., 0.), (1., 1.))));
    }

    #[test]
    fn three_points() {
        let vals = [(0., 0.), (1., 1.), (3., 3.)];
        assert_display!(closest_points(&vals), Some(((0., 0.), (1., 1.))));
    }

    #[test]
    fn list_1() {
        let vals = [
            (0., 0.),
            (2., 1.),
            (5., 2.),
            (2., 3.),
            (4., 0.),
            (0., 4.),
            (5., 6.),
            (4., 4.),
            (7., 3.),
            (-1., 2.),
            (2., 6.),
        ];
        assert_display!(closest_points(&vals), Some(((2., 1.), (2., 3.))));
    }

    #[test]
    fn list_2() {
        let vals = [
            (1., 3.),
            (4., 6.),
            (8., 8.),
            (7., 5.),
            (5., 3.),
            (10., 3.),
            (7., 1.),
            (8., 3.),
            (4., 9.),
            (4., 12.),
            (4., 15.),
            (7., 14.),
            (8., 12.),
            (6., 10.),
            (4., 14.),
            (2., 7.),
            (3., 8.),
            (5., 8.),
            (6., 7.),
            (8., 10.),
            (6., 12.),
        ];
        assert_display!(closest_points(&vals), Some(((4., 14.), (4., 15.))));
    }

    #[test]
    fn vertical_points() {
        let vals = [
            (0., 0.),
            (0., 50.),
            (0., -25.),
            (0., 40.),
            (0., 42.),
            (0., 100.),
            (0., 17.),
            (0., 29.),
            (0., -50.),
            (0., 37.),
            (0., 34.),
            (0., 8.),
            (0., 3.),
            (0., 46.),
        ];
        assert_display!(closest_points(&vals), Some(((0., 40.), (0., 42.))));
    }
}
```