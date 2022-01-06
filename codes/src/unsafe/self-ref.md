## 自引用unsafe实现

```rust
// 使用原生指针和unsafe实现自引用
pub struct Tree {
    count: usize,
    root: *mut Node,
}

#[derive(Debug)]
struct Node {
    data: i32,

    // Null指针这里代表"None`; right.is_null() ==> 没有right child
    left: *mut Node,
    right: *mut Node,
    parent: *mut Node,
}

impl Tree {
    pub fn new() -> Self {
        Self {
            count: 0,
            root: std::ptr::null_mut(),
        }
    }

    // 返回tree的节点数量
    pub fn node_count(&self) -> usize {
        assert!(self.count != 0 || self.root.is_null());
        self.count
    }


    // 在tree中新增一项，插入成功则返回true,若给定的数据在tree上已经存在，则返回false
    pub fn insert(&mut self, data: i32) -> bool {
        if self.root.is_null() {
            self.root = Node::new(data);
        } else {
            if !insert_node(self.root, data) {
                return false;
            }
        }

        self.count += 1;
        true
    }

    // 找到tree上的指定项，若找到，返回true
    pub fn find(&self, data: i32) -> bool {
        !find_node(self.root, data).is_null()
    }

    // 返回tree的字符串形式，用于Debug
    pub fn display(&self) -> String {
        display_node(self.root, 0)
    }

    // 使用中序遍历来返回tree中的所有数据
    pub fn inorder(&self) -> Vec<i32> {
        let mut v = vec![];
        if !self.root.is_null() {
            let mut node = leftmost_child(self.root);
            loop {
                if node.is_null() {
                    break;
                }
                unsafe {
                    v.push((*node).data);
                }
                node = successor_of_node(node);
            }
        }
        v
    }

    // 从tree上移除指定项, 若该项存在且被成功移除，则返回true，否则都返回false
    pub fn remove(&mut self, data: i32) -> bool {
        let node = find_node(self.root, data);
        if node.is_null() {
            false
        } else {
            self.remove_node(node);
            self.count -= 1;
            true
        }
    }

    // 在tree上找到指定项的继任者
    pub fn successor(&self, data: i32) -> Option<i32> {
        unsafe {
            let node = find_node(self.root, data);
            if !node.is_null() {
                let nodesucc = successor_of_node(node);
                if !nodesucc.is_null() {
                    return Some((*nodesucc).data);
                }
            }
            None
        }
    }

    // 从tree上移除指定的节点
    fn remove_node(&mut self, node: *mut Node) {
        unsafe {
            let lchild = (*node).left;
            let rchild = (*node).right;
            if lchild.is_null() && rchild.is_null() {
                // 节点没有子节点，所以可以安全移除
                self.replace_node(node, std::ptr::null_mut());
            } else if !lchild.is_null() && !rchild.is_null() {
                // 节点的左右子节点都在，我们需要找到该节点的继任者，然后将继任者的数据赋给当前节点，然后再递归删除继任者
                let succ = successor_of_node(node);
                assert!(!succ.is_null());
                (*node).data = (*succ).data;
                self.remove_node(succ);
            } else if !lchild.is_null() {
                // 节点只有左子节点，所以使用后者替代前者
                self.replace_node(node, lchild);
            } else if !rchild.is_null() {
                // 节点只有右子节点，所以使用后者替代前者
                self.replace_node(node, rchild);
            } else {
                panic!("unreachable");
            }
        }
    }

    // 使用`r`节点来替换目标`node`节点
    fn replace_node(&mut self, node: *mut Node, r: *mut Node) {
        unsafe {
            let parent = (*node).parent;
            if parent.is_null() {
                // Removing the root node.
                self.root = r;
                if !r.is_null() {
                    (*r).parent = std::ptr::null_mut();
                }
            } else {
                if !r.is_null() {
                    (*r).parent = parent;
                }
                if (*parent).left == node {
                    (*parent).left = r;
                } else if (*parent).right == node {
                    (*parent).right = r;
                }
            }

            // 被替换的节点不再被使用，因此可以回收它：通过`Box`拿走它的所有权，然后它会被自动drop
            Box::from_raw(node);
        }
    }
}

impl Drop for Tree {
    fn drop(&mut self) {
        // 也许不是性能最高的实现，但是简单，而且有用
        while !self.root.is_null() {
            self.remove_node(self.root);
        }
    }
}

impl Node {
    fn new(data: i32) -> *mut Self {
        Box::into_raw(Box::new(Self {
            data,
            left: std::ptr::null_mut(),
            right: std::ptr::null_mut(),
            parent: std::ptr::null_mut(),
        }))
    }

    fn new_with_parent(data: i32, parent: *mut Node) -> *mut Self {
        Box::into_raw(Box::new(Self {
            data,
            left: std::ptr::null_mut(),
            right: std::ptr::null_mut(),
            parent,
        }))
    }
}

// 在节点子树上创建新的节点
fn insert_node(node: *mut Node, data: i32) -> bool {
    unsafe {
        if (*node).data == data {
            false
        } else if data < (*node).data {
            if (*node).left.is_null() {
                (*node).left = Node::new_with_parent(data, node);
                true
            } else {
                insert_node((*node).left, data)
            }
        } else {
            if (*node).right.is_null() {
                (*node).right = Node::new_with_parent(data, node);
                true
            } else {
                insert_node((*node).right, data)
            }
        }
    }
}

// 在`fromnode`的子树上寻找目标数据，如果没找到则返回`null`
fn find_node(fromnode: *mut Node, data: i32) -> *mut Node {
    unsafe {
        if fromnode.is_null() || (*fromnode).data == data {
            fromnode
        } else if data < (*fromnode).data {
            find_node((*fromnode).left, data)
        } else {
            find_node((*fromnode).right, data)
        }
    }
}


// 返回`node`子树的字符串形式，同时指定缩进字符数
fn display_node(node: *const Node, indent: usize) -> String {
    let indent_str = " ".repeat(indent);
    if node.is_null() {
        indent_str + ".\n"
    } else {
        unsafe {
            let mut s = format!("{}{}\n", indent_str, (*node).data);
            s.push_str(&display_node((*node).left, indent + 2));
            s.push_str(&display_node((*node).right, indent + 2));
            s
        }
    }
}

// 找到`node`最左边的子节点，如果没有，就返回`node`自身, `node`不能为null
fn leftmost_child(node: *mut Node) -> *mut Node {
    unsafe {
        if (*node).left.is_null() {
            node
        } else {
            leftmost_child((*node).left)
        }
    }
}


// 在tree上找到`node`的继任者
fn successor_of_node(node: *mut Node) -> *mut Node {
    unsafe {
        if !(*node).right.is_null() {
            // 若node有一个右子节点，则继任者是该右子节点的最左子节点，若该右子节点没有子节点，则继任者就是右子节点
            leftmost_child((*node).right)
        } else {
            // 没有右子节点，则找到一个父节点，当前node是该父节点的左子节点, 若在root之前都没找到，说明node没有继任者
            parent_with_left(node)
        }
    }
}

// 在`node`的祖先中找到它的父节点,且`node`必须是该父节点的左子节点
fn parent_with_left(node: *mut Node) -> *mut Node {
    unsafe {
        // 若`node`有父节点，且该父节点拥有左子节点，同时`node`就是这个左子节点，那么该父节点就是我们的目标
        let parent = (*node).parent;
        if !parent.is_null() {
            if std::ptr::eq((*parent).left, node) {
                return parent;
            }
            return parent_with_left(parent);
        }

        // `node`没有父节点
        std::ptr::null_mut()
    }
}

fn main() {
    
}
```