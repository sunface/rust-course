# 计算性能优化


https://www.reddit.com/r/rust/comments/rn7ozz/find_perfect_number_comparison_go_java_rust/


```go
package main

import (
	"fmt"
	"math"
	"time"
)

func main() {
	n := 320000
	nums := make(map[int][]int)
	start := time.Now()
	calPerfs(n, nums)
	fmt.Printf("runtime: %s\n", time.Since(start))
}

func calPerfs(n int, nums map[int][]int) {
	for i := 1; i <= n; i++ {
		d := divs(i)
		if sum(d) == i {
			nums[i] = all(d)
		}
	}
}

func divs(num int) map[int]struct{} {
	r := make(map[int]struct{})
	r[1] = struct{}{}
	mid := int(math.Sqrt(float64(num)))
	for i := 2; i <= mid; i++ {
		if num%i == 0 {
			r[i] = struct{}{}
			r[num/i] = struct{}{}
		}
	}
	return r
}

func sum(ds map[int]struct{}) int {
	var n int
	for k := range ds {
		n += k
	}
	return n
}

func all(ds map[int]struct{}) []int {
	var a []int
	for k := range ds {
		a = append(a, k)
	}
	return a
}
```

## 120ms

```rust
use std::time::Instant;

const N: usize = 320_000	;

fn is_perfect(n: usize) -> bool {
    //println!("{:?}", n);
    let mut sum = 1;
    let end = (n as f64).sqrt() as usize;
    for i in 2..end  + 1{
        if n % i == 0 {
            if i * i == n {
                sum += i;
            }
            else {
                sum += i + n / i;
            }
        }
    }
    sum == n
}

fn find_perfs(n: usize) -> Vec<usize> {
    let mut perfs:Vec<usize> = vec![];
    for i in 2..n + 1 {
        if is_perfect(i) {
            perfs.push(i)
        }
    }
    perfs
}

fn main() {
    let start = Instant::now();
    let perfects = find_perfs(N);
    println!("{:?}", start.elapsed());
    println!("{:?}, in {:?}", perfects, N);
}
```

## 90ms

```rust
use {
    std::{time::Instant},
};

const N: usize = 320000;

// Optimized, takes about 320ms on an Core i7 6700 @ 3.4GHz
fn cal_perfs2(n: usize) -> Vec<usize> {
    (1..=n)
        .into_iter()
        .filter(|i| cal2(*i) == *i)
        .collect::<Vec<_>>()
}

fn cal2(n: usize) -> usize {
    (2..=(n as f64).sqrt() as usize)
        .into_iter()
        .filter_map(|i| if n % i == 0 { Some([i, n / i]) } else { None })
        .map(|a| a[0] + a[1])
        .sum::<usize>()
        + 1
}


fn main() {
    let start = Instant::now();
    let perf2 = cal_perfs2(N);
    println!("{:?}",perf2);
    println!("Optimized: {:?}", start.elapsed());
}
```