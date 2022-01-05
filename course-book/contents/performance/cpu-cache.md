# CPU缓存性能优化

https://github.com/TC5027/blog/blob/master/false_sharing.md


# On a use of the "repr" attribute in Rust

Consider we work with the following struct representing a counter,
```rust
struct Counter(u64);
```
and we want to increment it with random ``u8`` values with the help of a for loop : 
```rust
use rand::Rng;
fn main() {
	let mut counter = Counter(0);
	let mut rng = rand::thread_rng();
	
	for _ in 0..1_000_000 {
		counter.0 += rng.gen::<u8>() as u64;
	}
}
```
This takes 1.90ms to run on my laptop using ``cargo run --release``. Remember this timing as it will be our reference value :)
Now suppose we were given this struct, holding not 1 but 2 counters : 
```rust
struct Counters {
	c1 : u64,
	c2 : u64
}
```
Using the same approach, performing the increments for the 2 counters in a single-threaded fashion, we would expect to be twice slower (in fact it takes 3.71ms to execute).
Can we do better ? Well, as our 2 counters are independent, we could spawn 2 threads, assign them one counter and increment concurrently ! Given I have 4 CPUs on my laptop, I would expect to be just as fast as the first scenario. Let's see !

First thing, we could create a local variable in each thread which would be incremented and then we would set the counter value to this incremented one (spoiler : good idea). But we could also save these 2 variables and share the ``Counter`` between the 2 threads with an ``Arc`` (spoiler : definitely not worth). Let's do this second option ! ^^

Doing the following code, 

```rust
fn main() {
	let counters = Arc::new(Counters{c1:0, c2:0});
	let counters_clone = counters.clone();
	
	let handler1 = thread::spawn(move || {
		let mut rng = rand::thread_rng();
		for _ in 0..1_000_000 {
			counters.c1 += rng.gen::<u8>() as u64;
		}
	});
	let handler2 = thread::spawn(move || {
		let mut rng = rand::thread_rng();
		for _ in 0..1_000_000 {
			counters_clone.c2 += rng.gen::<u8>() as u64;
		}
	});
	handler1.join(); handler2.join();
}
```
we end up with an error : 

**cannot assign to data in an `Arc`**
**cannot assign**
**help: trait `DerefMut` is required to modify through a dereference, but it is not implemented for `std::sync::Arc<Counters>`rustc(E0594)**

Unlucky. Maybe we could use **atomic types**. These types provide operations that synchronize updates between threads. In fact, as an equivalent of ``+=`` we could use the ``fetch_add`` method which has the following signature : ``pub fn fetch_add(&self, val: u64, order: Ordering) -> u64``. What should be highlighted is the ``&self``. We could expect a ``&mut self`` given the modification we want to perform using it but thanks to the property that an atomic operation is performed without interruptions we don't need exclusive access to the variable to safely update it.
We can solve the error replacing the counter's type by ``AtomicU64`` as like that we only require ``Arc`` to implement the ``Deref`` trait (given the signature of ``fetch_add``) and it is the case !

We so have to change a bit our struct to : 
```rust
struct Counters {
	c1 : AtomicU64,
	c2 : AtomicU64,
}
```
and our code to :
```rust
fn main() {
    let counters = Arc::new(Counters{
        c1 :  AtomicU64::new(0),
        c2 : AtomicU64::new(0)
    });
    let counters_clone = counters.clone();
    let handler1 = thread::spawn(move || {
        let mut rng = rand::thread_rng();
        for _ in 0..1_000_000 {
            counters.c1.fetch_add(rng.gen::<u8>() as u64,Relaxed);
        }
    });
    let handler2 = thread::spawn(move || {
        let mut rng = rand::thread_rng();
        for _ in 0..1_000_000 {
            counters_clone.c2.fetch_add(rng.gen::<u8>() as u64,Relaxed);
        }
    });
    handler1.join();handler2.join();
}
```
We could naturally expect the operation on Atomics to be a bit slower than the ones on ``u64`` but let's see !
30.22ms .. ok... that's terrible ^^
Do Atomics operations explain all this ?
I ran a benchmark to compare ``+=`` and ``fetch_add( ,Relaxed)`` to figure it out : 

```rust
let mut sum = 0;
let start = Instant::now();
for _ in 0..10_000_000 {
	sum += rng.gen::<u8>() as u64;
}
println!("time spent u64 sum : {:?}", start.elapsed());
let atomic_sum = AtomicU64::new(0);
let start = Instant::now();
for _ in 0..10_000_000 {
	atomic_sum.fetch_add(rng.gen::<u8>() as u64, Relaxed);
}
println!("time spent AtomicU64 sum : {:?}", start.elapsed());
```

The ``u64`` sums takes 20.07ms while the ``AtomicU64`` one takes 70.28ms. So we should only be 3 times slower than 2ms but we are 15 times slower how can it be ???

Hint : CPU cache... but why should we care ?
CPU cache is a data storage, located close to CPU, offering a fast access to data.
In a computer, when the CPU needs to read or write a value, it checks if it is present inside the cache or not. If it is the case then the CPU directly uses the cached data. Otherwise, the cache allocates a new entry and copies data from main memory, an entry being of fixed size and called *cache line*.
CPU cache is relatively small compared to RAM but much faster, and that's why a program should be designed to use as much as possible data lying in cache, based on a locality principle, to avoid expensive access to RAM.

If we represent our current situation it looks like this :
 ![figure](https://github.com/TC5027/blog/blob/master/pngs/false_sharing.png)

The red square corresponds to the first counter and the green one to the second. They can potentially lie in the same cache line !

If data is modified through CPU 0 in its L1 cache we expect our computer to reflect the changes both in memory and in the other L1 cache. To ensure this coherency, there exists coherence protocols which can force the **whole cache line** impacted by the change to be propagated through the whole system, in order to update the copies of the value changed.

With that in mind, what is happening in our code comes from that : we suffer from coherency protocol due to our 2 counters lying on the same cache line. Updating first counter through CPU 0 involves an update in the system of the data stored in the cache line where the second counter (unchanged) potentially lies. During this update, CPU 1 cannot access the second counter whereas it is clearly independent from the change made by CPU 0, and that's why we are slow.
How can we solve then ? well by making sure that the counters lie on different cache lines and that's where we can use the ``repr`` attribute.

In Rust, we can specify the alignment we want for our type with the ``repr(align)`` attribute. We use it like this : 

```rust
#[repr(align(64))]
struct CachePadded(AtomicU64);
```

A data of alignment X is stored in memory at address multiple of X. Knowing this, giving to our counters an alignment equal to the size of a cache line, we ensure that the 2 counters won't be stored in the same cache line !

We can get the size of cache lines with command ``getconf LEVEL1_DCACHE_LINESIZE``. On my laptop the output value is 64.

With those changes we have now a timing of 7.16ms which seems decent given we work with Atomics. Mission succeeded ! 


Finally given my remark at the beginning, I wanted to share a potentially better solution, using local variables in the threads, and channels to communicate these local variables back to the main thread :

```rust
use std::sync::mpsc::channel;
fn main() {
    let (s1,t1) = channel();
    let (s2,t2) = channel();
    let h1 = thread::spawn(move || {
        let mut local_counter = 0;
        let mut rng = rand::thread_rng();
        for _ in 0..1_000_000 {
            local_counter += rng.gen::<u8>() as u64;
        }
        s1.send(local_counter)
    });
    let h2 = thread::spawn(move || {
        let mut local_counter = 0;
        let mut rng = rand::thread_rng();
        for _ in 0..1_000_000 {
            local_counter += rng.gen::<u8>() as u64;
        }
        s2.send(local_counter)
    });
    
    h1.join();
    h2.join();
    let counter = Counters{c1: t1.recv().unwrap(),c2: t2.recv().unwrap()};
}
```
It takes 2.03 ms to execute :)


## 动态和静态分发
https://www.reddit.com/r/rust/comments/ruavjm/is_there_a_difference_in_performance_between/