# 使用use引入


self 在路径中，有两种意思：

use self::xxx 表示，加载当前模块中的 xxx。此时 self 可省略；
use xxx::{self, yyy}，表示，加载当前路径下模块 xxx 本身，以及模块 xxx 下的 yyy；