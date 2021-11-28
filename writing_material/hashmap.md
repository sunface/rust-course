## Key of hashmap
Any type that implements the Eq and Hash traits can be a key in HashMap.

Note that f32 and f64 do not implement Hash, likely because floating-point precision errors would make using them as hashmap keys horribly error-prone.

All collection classes implement Eq and Hash if their contained type also respectively implements Eq and Hash. For example, Vec<T> will implement Hash if T implements Hash.
