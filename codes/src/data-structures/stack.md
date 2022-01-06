# 栈

From Wikipedia, a stack is an abstract data type that serves as a collection of elements, with two main principal operations, `Push` and `Pop`.

__Properties__
* Push O(1)
* Pop head.data O(1) tail.data O(n)
* Peek O(1)

```
// the public struct can hide the implementation detail
pub struct Stack<T> {
    head: Link<T>,
}

type Link<T> = Option<Box<Node<T>>>;

struct Node<T> {
    elem: T,
    next: Link<T>,
}

impl<T> Stack<T> {
    // Self is an alias for Stack
    // We implement associated function name new for single-linked-list
    pub fn new() -> Self {
        // for new function we need to return a new instance
        Self {
            // we refer to variants of an enum using :: the namespacing operator
            head: None,
        } // we need to return the variant, so there without the ;
    }

    // As we know the primary forms that self can take: self, &mut self and &self, push will change the linked list
    // so we need &mut
    // The push method which the signature's first parameter is self
    pub fn push(&mut self, elem: T) {
        let new_node = Box::new(Node {
            elem,
            next: self.head.take(),
        });
        // don't forget replace the head with new node for stack
        self.head = Some(new_node);
    }
    ///
    /// In pop function, we trying to:
    /// * check if the list is empty, so we use enum Option<T>, it can either be Some(T) or None
    ///   * if it's empty, return None
    ///   * if it's not empty
    ///     * remove the head of the list
    ///     * remove its elem
    ///     * replace the list's head with its next
    ///     * return Some(elem), as the situation if need
    ///
    /// so, we need to remove the head, and return the value of the head
    pub fn pop(&mut self) -> Result<T, &str> {
        match self.head.take() {
            None => Err("Stack is empty"),
            Some(node) => {
                self.head = node.next;
                Ok(node.elem)
            }
        }
    }

    pub fn is_empty(&self) -> bool {
        // Returns true if the option is a [None] value.
        self.head.is_none()
    }

    pub fn peek(&self) -> Option<&T> {
        // Converts from &Option<T> to Option<&T>.
        match self.head.as_ref() {
            None => None,
            Some(node) => Some(&node.elem),
        }
    }

    pub fn peek_mut(&mut self) -> Option<&mut T> {
        match self.head.as_mut() {
            None => None,
            Some(node) => Some(&mut node.elem),
        }
    }

    pub fn into_iter_for_stack(self) -> IntoIter<T> {
        IntoIter(self)
    }
    pub fn iter(&self) -> Iter<'_, T> {
        Iter {
            next: self.head.as_deref(),
        }
    }
    // '_ is the "explicitly elided lifetime" syntax of Rust
    pub fn iter_mut(&mut self) -> IterMut<'_, T> {
        IterMut {
            next: self.head.as_deref_mut(),
        }
    }
}

impl<T> Default for Stack<T> {
    fn default() -> Self {
        Self::new()
    }
}

/// The drop method of singly linked list. There's a question that do we need to worry about cleaning up our list?
/// As we all know the ownership and borrow mechanism, so we know the type will clean automatically after it goes out the scope,
/// this implement by the Rust compiler automatically did which mean add trait `drop` for the automatically.
///
/// So, the complier will implements Drop for `List->Link->Box<Node> ->Node` automatically and tail recursive to clean the elements
/// one by one. And we know the recursive will stop at Box<Node>
/// https://rust-unofficial.github.io/too-many-lists/first-drop.html
///
/// As we know we can't drop the contents of the Box after deallocating, so we need to manually write the iterative drop

impl<T> Drop for Stack<T> {
    fn drop(&mut self) {
        let mut cur_link = self.head.take();
        while let Some(mut boxed_node) = cur_link {
            cur_link = boxed_node.next.take();
            // boxed_node goes out of scope and gets dropped here;
            // but its Node's `next` field has been set to None
            // so no unbound recursion occurs.
        }
    }
}

/// Rust has nothing like a yield statement, and there's actually 3 different kinds of iterator should to implement

// Collections are iterated in Rust using the Iterator trait, we define a struct implement Iterator
pub struct IntoIter<T>(Stack<T>);

impl<T> Iterator for IntoIter<T> {
    // This is declaring that every implementation of iterator has an associated type called Item
    type Item = T;
    // the reason iterator yield Option<self::Item> is because the interface coalesces the `has_next` and `get_next` concepts
    fn next(&mut self) -> Option<Self::Item> {
        self.0.pop().ok()
    }
}

pub struct Iter<'a, T> {
    next: Option<&'a Node<T>>,
}

impl<'a, T> Iterator for Iter<'a, T> {
    type Item = &'a T;
    fn next(&mut self) -> Option<Self::Item> {
        self.next.map(|node| {
            // as_deref: Converts from Option<T> (or &Option<T>) to Option<&T::Target>.
            self.next = node.next.as_deref();
            &node.elem
        })
    }
}

pub struct IterMut<'a, T> {
    next: Option<&'a mut Node<T>>,
}

impl<'a, T> Iterator for IterMut<'a, T> {
    type Item = &'a mut T;
    fn next(&mut self) -> Option<Self::Item> {
        // we add take() here due to &mut self isn't Copy(& and Option<&> is Copy)
        self.next.take().map(|node| {
            self.next = node.next.as_deref_mut();
            &mut node.elem
        })
    }
}

#[cfg(test)]
mod test_stack {

    use super::*;

    #[test]
    fn basics() {
        let mut list = Stack::new();
        assert_eq!(list.pop(), Err("Stack is empty"));

        list.push(1);
        list.push(2);
        list.push(3);

        assert_eq!(list.pop(), Ok(3));
        assert_eq!(list.pop(), Ok(2));

        list.push(4);
        list.push(5);

        assert_eq!(list.is_empty(), false);

        assert_eq!(list.pop(), Ok(5));
        assert_eq!(list.pop(), Ok(4));

        assert_eq!(list.pop(), Ok(1));
        assert_eq!(list.pop(), Err("Stack is empty"));

        assert_eq!(list.is_empty(), true);
    }

    #[test]
    fn peek() {
        let mut list = Stack::new();
        assert_eq!(list.peek(), None);
        list.push(1);
        list.push(2);
        list.push(3);

        assert_eq!(list.peek(), Some(&3));
        assert_eq!(list.peek_mut(), Some(&mut 3));

        match list.peek_mut() {
            None => None,
            Some(value) => Some(*value = 42),
        };

        assert_eq!(list.peek(), Some(&42));
        assert_eq!(list.pop(), Ok(42));
    }

    #[test]
    fn into_iter() {
        let mut list = Stack::new();
        list.push(1);
        list.push(2);
        list.push(3);

        let mut iter = list.into_iter_for_stack();
        assert_eq!(iter.next(), Some(3));
        assert_eq!(iter.next(), Some(2));
        assert_eq!(iter.next(), Some(1));
        assert_eq!(iter.next(), None);
    }

    #[test]
    fn iter() {
        let mut list = Stack::new();
        list.push(1);
        list.push(2);
        list.push(3);

        let mut iter = list.iter();
        assert_eq!(iter.next(), Some(&3));
        assert_eq!(iter.next(), Some(&2));
        assert_eq!(iter.next(), Some(&1));
    }

    #[test]
    fn iter_mut() {
        let mut list = Stack::new();
        list.push(1);
        list.push(2);
        list.push(3);

        let mut iter = list.iter_mut();
        assert_eq!(iter.next(), Some(&mut 3));
        assert_eq!(iter.next(), Some(&mut 2));
        assert_eq!(iter.next(), Some(&mut 1));
    }
}
```