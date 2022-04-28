# 使用 tracing 输出自定义的 Rust 日志

在 [tracing](https://docs.rs/crate/tracing/latest) 包出来前，Rust 的日志也就 `log` 有一战之力，但是 `log` 的功能相对来说还是简单一些。在大名鼎鼎的 tokio 开发团队推出 `tracing` 后，我现在坚定的认为 `tracing` 就是未来！


> 截至目前，rust编译器团队、GraphQL 都在使用 tracing，而且 tokio 在密谋一件大事：基于 tracing 开发一套终端交互式 debug 工具: [console](https://github.com/tokio-rs/console)！


基于这种坚定的信仰，我们决定将公司之前使用的 `log` 包替换成 `tracing` ，但是有一个问题：后者提供的 JSON logger 总感觉不是那个味儿。这意味着，对于程序员来说，最快乐的时光又要到来了：定制自己的开发工具。

好了，闲话少说，下面我们一起来看看该如何构建自己的 logger，以及深入了解 tracing 的一些原理，当然你也可以只选择来凑个热闹，总之，开始吧！

## 打地基(1)

首先，使用 `cargo new --bin test-tracing` 创建一个新的二进制类型( binary )的项目。

然后引入以下依赖：
```toml
# in cargo.toml

[dependencies]
serde_json = "1"
tracing = "0.1"
tracing-subscriber = "0.3"
```

其中 `tracing-subscriber` 用于订阅正在发生的日志、监控事件，然后可以对它们进行进一步的处理。`serde_json` 可以帮我们更好的处理格式化的 JSON，毕竟咱们要解决的问题就来自于 JSON logger。

下面来实现一个基本功能：设置自定义的 logger，并使用 `info!` 来打印一行日志。

```rust
// in examples/figure_0/main.rs

use tracing::info;
use tracing_subscriber::prelude::*;

mod custom_layer;
use custom_layer::CustomLayer;

fn main() {
    // 设置 `tracing-subscriber` 对 tracing 数据的处理方式
    tracing_subscriber::registry().with(CustomLayer).init();

    // 打印一条简单的日志。用 `tracing` 的行话来说，`info!` 将创建一个事件
    info!(a_bool = true, answer = 42, message = "first example");
}
```

大家会发现，上面引入了一个模块 `custom_layer`， 下面从该模块开始，来实现我们的自定义 logger。首先，`tracing-subscriber` 提供了一个特征 [`Layer`](https://docs.rs/tracing-subscriber/0.3/tracing_subscriber/layer/trait.Layer.html) 专门用于处理 `tracing` 的各种事件( span, event )。

```rust
// in examples/figure_0/custom_layer.rs

use tracing_subscriber::Layer;

pub struct CustomLayer;

impl<S> Layer<S> for CustomLayer where S: tracing::Subscriber {}
```

由于还没有填入任何代码，运行该示例比你打的水漂还无力 - 毫无效果。


## 捕获事件

在 `tracing` 中，当 `info!`、`error!` 等日志宏被调用时，就会产生一个相应的[事件 Event](https://docs.rs/tracing/0.1/tracing/event/struct.Event.html)。

而我们首先，就要为之前的 `Layer` 特征实现 `on_event` 方法。

```rust,editable
// in examples/figure_0/custom_layer.rs

where
    S: tracing::Subscriber,
{
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        println!("Got event!");
        println!("  level={:?}", event.metadata().level());
        println!("  target={:?}", event.metadata().target());
        println!("  name={:?}", event.metadata().name());
        for field in event.fields() {
            println!("  field={}", field.name());
        }
    }
}
```

从代码中可以看出，我们打印了事件中包含的事件名、日志等级以及事件发生的代码路径。运行后，可以看到以下输出:

```shell
$ cargo run --example figure_1

Got event!
  level=Level(Info)
  target="figure_1"
  name="event examples/figure_1/main.rs:10"
  field=a_bool
  field=answer
  field=message
```

但是奇怪的是，我们无法通过 API 来获取到具体的 `field` 值。还有就是，上面的输出还不是 JSON 格式。

现在问题来了，要创建自己的 logger，不能获取 `filed` 显然是不靠谱的。

### 访问者模式

在设计上，`tracing` 作出了一个选择：永远不会自动存储产生的事件数据( spans, events )。如果我们要获取这些数据，就必须自己手动存储。

解决办法就是使用访问者模式(Visitor Pattern)：手动实现 `Visit` 特征去获取事件中的值。`Visit` 为每个 `tracing` 可以处理的类型都提供了对应的 `record_X` 方法。

```rust
// in examples/figure_2/custom_layer.rs

struct PrintlnVisitor;

impl tracing::field::Visit for PrintlnVisitor {
    fn record_f64(&mut self, field: &tracing::field::Field, value: f64) {
        println!("  field={} value={}", field.name(), value)
    }

    fn record_i64(&mut self, field: &tracing::field::Field, value: i64) {
        println!("  field={} value={}", field.name(), value)
    }

    fn record_u64(&mut self, field: &tracing::field::Field, value: u64) {
        println!("  field={} value={}", field.name(), value)
    }

    fn record_bool(&mut self, field: &tracing::field::Field, value: bool) {
        println!("  field={} value={}", field.name(), value)
    }

    fn record_str(&mut self, field: &tracing::field::Field, value: &str) {
        println!("  field={} value={}", field.name(), value)
    }

    fn record_error(
        &mut self,
        field: &tracing::field::Field,
        value: &(dyn std::error::Error + 'static),
    ) {
        println!("  field={} value={}", field.name(), value)
    }

    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        println!("  field={} value={:?}", field.name(), value)
    }
}
```



然后在之前的 `on_event` 中来使用这个新的访问者： `event.record(&mut visitor)` 可以访问其中的所有值。

```rust
// in examples/figure_2/custom_layer.rs

fn on_event(
    &self,
    event: &tracing::Event<'_>,
    _ctx: tracing_subscriber::layer::Context<'_, S>,
) {
    println!("Got event!");
    println!("  level={:?}", event.metadata().level());
    println!("  target={:?}", event.metadata().target());
    println!("  name={:?}", event.metadata().name());
    let mut visitor = PrintlnVisitor;
    event.record(&mut visitor);
}
```

这段代码看起来有模有样，来运行下试试：
```shell
$ cargo run --example figure_2

Got event!
  level=Level(Info)
  target="figure_2"
  name="event examples/figure_2/main.rs:10"
  field=a_bool value=true
  field=answer value=42
  field=message value=first example
```

Bingo ! 一切完美运行 ！

### 构建 JSON logger
目前为止，离我们想要的 JSON logger 只差一步了。下面来实现一个 `JsonVisitor` 替代之前的 `PrintlnVisitor` 用于构建一个 JSON 对象。

```rust
// in  examples/figure_3/custom_layer.rs


impl<'a> tracing::field::Visit for JsonVisitor<'a> {
    fn record_f64(&mut self, field: &tracing::field::Field, value: f64) {
        self.0
            .insert(field.name().to_string(), serde_json::json!(value));
    }

    fn record_i64(&mut self, field: &tracing::field::Field, value: i64) {
        self.0
            .insert(field.name().to_string(), serde_json::json!(value));
    }

    fn record_u64(&mut self, field: &tracing::field::Field, value: u64) {
        self.0
            .insert(field.name().to_string(), serde_json::json!(value));
    }

    fn record_bool(&mut self, field: &tracing::field::Field, value: bool) {
        self.0
            .insert(field.name().to_string(), serde_json::json!(value));
    }

    fn record_str(&mut self, field: &tracing::field::Field, value: &str) {
        self.0
            .insert(field.name().to_string(), serde_json::json!(value));
    }

    fn record_error(
        &mut self,
        field: &tracing::field::Field,
        value: &(dyn std::error::Error + 'static),
    ) {
        self.0.insert(
            field.name().to_string(),
            serde_json::json!(value.to_string()),
        );
    }

    fn record_debug(&mut self, field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        self.0.insert(
            field.name().to_string(),
            serde_json::json!(format!("{:?}", value)),
        );
    }
}
```

```rust
// in examples/figure_3/custom_layer.rs

fn on_event(
    &self,
    event: &tracing::Event<'_>,
    _ctx: tracing_subscriber::layer::Context<'_, S>,
) {
    // Covert the values into a JSON object
    let mut fields = BTreeMap::new();
    let mut visitor = JsonVisitor(&mut fields);
    event.record(&mut visitor);

    // Output the event in JSON
    let output = serde_json::json!({
        "target": event.metadata().target(),
        "name": event.metadata().name(),
        "level": format!("{:?}", event.metadata().level()),
        "fields": fields,
    });
    println!("{}", serde_json::to_string_pretty(&output).unwrap());
}
```

继续运行:
```shell
$ cargo run --example figure_3

{
  "fields": {
    "a_bool": true,
    "answer": 42,
    "message": "first example"
  },
  "level": "Level(Info)",
  "name": "event examples/figure_3/main.rs:10",
  "target": "figure_3"
}
```

终于，我们实现了自己的 logger，并且成功地输出了一条 JSON 格式的日志。并且新实现的 `Layer` 就可以添加到 `tracing-subscriber` 中用于记录日志事件。

下面再来一起看看如何使用`tracing` 提供的 `period-of-time spans` 为日志增加更详细的上下文信息。


### 何为 span
在之前我们多次提到 span 这个词，但是何为 span？

不知道大家知道分布式追踪不？在分布式系统中每一个请求从开始到返回，会经过多个服务，这条请求路径被称为请求跟踪链路( trace )，可以看出，一条链路是由多个部分组成，我们可以简单的把其中一个部分认为是一个 span。

跟 log 是对某个时间点的记录不同，span 记录的是一个时间段。当程序开始执行一系列任务时，span 就会开始，当这一系列任务结束后，span 也随之结束。

由此可见，tracing 其实不仅仅是一个日志库，它还是一个分布式追踪的库，可以帮助我们采集信息，然后上传给 jaeger 等分布式追踪平台，最终实现对指定应用程序的监控。

在理解后，再来看看该如何为自定义的 logger 实现 spans。

### 打地基(2)
先来创建一个外部 span 和一个内部 span，从概念上来说，spans 和 events 创建的东东类似以下嵌套结构：

- 进入外部 span 
  - 进入内部 span
    - 事件已创建，内部 span 是它的父 span，外部 span 是它的祖父 span
  - 结束内部 span
- 结束外部 span

> 有些同学可能还是不太理解，你就把 span 理解成为监控埋点，进入 span == 埋点开始，结束 span == 埋点结束

在下面的代码中，当使用 `span.enter()` 创建的 span 超出作用域时，将自动退出：根据 `Drop` 特征触发的顺序，`inner_span` 将先退出，然后才是 `outer_span` 的退出。

```rust
// in examples/figure_5/main.rs

use tracing::{debug_span, info, info_span};
use tracing_subscriber::prelude::*;

mod custom_layer;
use custom_layer::CustomLayer;

fn main() {
    tracing_subscriber::registry().with(CustomLayer).init();

    let outer_span = info_span!("outer", level = 0);
    let _outer_entered = outer_span.enter();

    let inner_span = debug_span!("inner", level = 1);
    let _inner_entered = inner_span.enter();

    info!(a_bool = true, answer = 42, message = "first example");
}
```

再回到事件处理部分，通过使用 `examples/figure_0/main.rs` 我们能获取到事件的父 span，当然，前提是它存在。但是在实际场景中，直接使用 `ctx.event_scope(event)` 来迭代所有 span 会更加简单好用。

注意，这种迭代顺序类似于栈结构，以上面的代码为例，先被迭代的是 `inner_span`，然后才是 `outer_span`。

当然，如果你不想以类似于出栈的方式访问，还可以使用 `scope.from_root()` 直接反转，此时的访问将从最外层开始： `outer -> innter`。

对了，为了使用 `ctx.event_scope()`，我们的订阅者还需实现 `LookupRef`。提前给出免责声明：这里的实现方式有些诡异，大家可能难以理解，但是..我们其实也无需理解，只要这么用即可。

> 译者注：这里用到了高阶生命周期 HRTB( Higher Ranke Trait Bounds ) 的概念，一般的读者无需了解，感兴趣的可以看看(这里)[https://doc.rust-lang.org/nomicon/hrtb.html]

```rust
// in examples/figure_5/custom_layer.rs

impl<S> Layer<S> for CustomLayer
where
    S: tracing::Subscriber,
    // 好可怕! 还好我们不需要理解它，只要使用即可
    S: for<'lookup> tracing_subscriber::registry::LookupSpan<'lookup>,
{
    fn on_event(&self, event: &tracing::Event<'_>, ctx: tracing_subscriber::layer::Context<'_, S>) {
        // 父 span
        let parent_span = ctx.event_span(event).unwrap();
        println!("parent span");
        println!("  name={}", parent_span.name());
        println!("  target={}", parent_span.metadata().target());

        println!();

        // 迭代范围内的所有的 spans
        let scope = ctx.event_scope(event).unwrap();
        for span in scope.from_root() {
            println!("an ancestor span");
            println!("  name={}", span.name());
            println!("  target={}", span.metadata().target());
        }
    }
}
```

运行下看看效果:
```shell
$ cargo run --example figure_5

parent span
  name=inner
  target=figure_5

an ancestor span
  name=outer
  target=figure_5
an ancestor span
  name=inner
  target=figure_5
```

细心的同学可能会发现，这里怎么也没有 field 数据？没错，而且恰恰是这些 field 包含的数据才让日志和监控有意义。那我们可以像之前一样，使用访问器 Visitor 来解决吗？

### span 的数据在哪里

答案是：No。因为 `ctx.event_scope ` 返回的东东没有任何办法可以访问其中的字段。

不知道大家还记得我们为何之前要使用访问器吗？很简单，因为 `tracing` 默认不会去存储数据，既然如此，那 `span` 这种跨了某个时间段的，就更不可能去存储数据了。

现在只能看看 `Layer` 特征有没有提供其它的方法了，哦呦，发现了一个 `on_new_span`，从名字可以看出，该方法是在 `span` 创建时调用的。

```rust
// in  examples/figure_6/custom_layer.rs

impl<S> Layer<S> for CustomLayer
where
    S: tracing::Subscriber,
    S: for<'lookup> tracing_subscriber::registry::LookupSpan<'lookup>,
{
    fn on_new_span(
        &self,
        attrs: &tracing::span::Attributes<'_>,
        id: &tracing::span::Id,
        ctx: tracing_subscriber::layer::Context<'_, S>,
    ) {
        let span = ctx.span(id).unwrap();
        println!("Got on_new_span!");
        println!("  level={:?}", span.metadata().level());
        println!("  target={:?}", span.metadata().target());
        println!("  name={:?}", span.metadata().name());

        // Our old friend, `println!` exploration.
        let mut visitor = PrintlnVisitor;
        attrs.record(&mut visitor);
    }
}
```

```shell
$ cargo run --example figure_6
Got on_new_span!
  level=Level(Info)
  target="figure_7"
  name="outer"
  field=level value=0
Got on_new_span!
  level=Level(Debug)
  target="figure_7"
  name="inner"
  field=level value=1
```

芜湖! 我们的数据回来了！但是这里有一个隐患：只能在创建的时候去访问数据。如果仅仅是为了记录 spans，那没什么大问题，但是如果我们随后需要记录事件然后去尝试访问之前的 span 呢？此时 span 的数据已经不存在了！

如果 `tracing` 不能存储数据，那我们这些可怜的开发者该怎么办？

### 自己存储 span 数据

何为一个优秀的程序员？能偷懒的时候绝不多动半跟手指，但是需要勤快的时候，也是自己动手丰衣足食的典型。

因此，既然 `tracing` 不支持，那就自己实现吧。先确定一个目标：捕获 span 的数据，然后存储在某个地方以便后续访问。

好在 `tracing-subscriber` 提供了扩展 extensions 的方式，可以让我们轻松地存储自己的数据，该扩展甚至可以跟每一个 span 联系在一起！

虽然我们可以把之前见过的 `BTreeMap<String, serde_json::Value>` 存在扩展中，但是由于扩展数据是被 registry 中的所有layers 所共享的，因此出于私密性的考虑，还是只保存私有字段比较合适。这里使用一个 newtype 模式来创建新的类型:
```rust
// in examples/figure_8/custom_layer.rs

#[derive(Debug)]
struct CustomFieldStorage(BTreeMap<String, serde_json::Value>);
```

每次发现一个新的 span 时，都基于它来构建一个 JSON 对象，然后将其存储在扩展数据中。

```rust
// in examples/figure_8/custom_layer.rs

fn on_new_span(
    &self,
    attrs: &tracing::span::Attributes<'_>,
    id: &tracing::span::Id,
    ctx: tracing_subscriber::layer::Context<'_, S>,
) {
    // 基于 field 值来构建我们自己的 JSON 对象
    let mut fields = BTreeMap::new();
    let mut visitor = JsonVisitor(&mut fields);
    attrs.record(&mut visitor);

    // 使用之前创建的 newtype 包裹下
    let storage = CustomFieldStorage(fields);

    // 获取内部 span 数据的引用
    let span = ctx.span(id).unwrap();
    // 获取扩展，用于存储我们的 span 数据
    let mut extensions = span.extensions_mut();
    // 存储！
    extensions.insert::<CustomFieldStorage>(storage);
}
```

这样，未来任何时候我们都可以取到该 span 包含的数据( 例如在 `on_event` 方法中 )。

```rust
// in examples/figure_8/custom_layer.rs

fn on_event(&self, event: &tracing::Event<'_>, ctx: tracing_subscriber::layer::Context<'_, S>) {
    let scope = ctx.event_scope(event).unwrap();
    println!("Got event!");
    for span in scope.from_root() {
        let extensions = span.extensions();
        let storage = extensions.get::<CustomFieldStorage>().unwrap();
        println!("  span");
        println!("    target={:?}", span.metadata().target());
        println!("    name={:?}", span.metadata().name());
        println!("    stored fields={:?}", storage);
    }
}
```

### 功能齐全的 JSON logger
截至目前，我们已经学了不少东西，下面来利用这些知识实现最后的 JSON logger。

```rust
// in examples/figure_9/custom_layer.rs

fn on_event(&self, event: &tracing::Event<'_>, ctx: tracing_subscriber::layer::Context<'_, S>) {
    // All of the span context
    let scope = ctx.event_scope(event).unwrap();
    let mut spans = vec![];
    for span in scope.from_root() {
        let extensions = span.extensions();
        let storage = extensions.get::<CustomFieldStorage>().unwrap();
        let field_data: &BTreeMap<String, serde_json::Value> = &storage.0;
        spans.push(serde_json::json!({
            "target": span.metadata().target(),
            "name": span.name(),
            "level": format!("{:?}", span.metadata().level()),
            "fields": field_data,
        }));
    }

    // The fields of the event
    let mut fields = BTreeMap::new();
    let mut visitor = JsonVisitor(&mut fields);
    event.record(&mut visitor);

    // And create our output
    let output = serde_json::json!({
        "target": event.metadata().target(),
        "name": event.metadata().name(),
        "level": format!("{:?}", event.metadata().level()),
        "fields": fields,
        "spans": spans,
    });
    println!("{}", serde_json::to_string_pretty(&output).unwrap());
}
```

```shell
$ cargo run --example figure_9

{
  "fields": {
    "a_bool": true,
    "answer": 42,
    "message": "first example"
  },
  "level": "Level(Info)",
  "name": "event examples/figure_9/main.rs:16",
  "spans": [
    {
      "fields": {
        "level": 0
      },
      "level": "Level(Info)",
      "name": "outer",
      "target": "figure_9"
    },
    {
      "fields": {
        "level": 1
      },
      "level": "Level(Debug)",
      "name": "inner",
      "target": "figure_9"
    }
  ],
  "target": "figure_9"
}
```

嗯，完美。

### 等等，你说功能齐全？

上面的代码在发布到生产环境后，依然运行地相当不错，但是我发现还缺失了一个功能: span 在创建之后，依然要能记录数据。

```rust
// in examples/figure_10/main.rs

let outer_span = info_span!("outer", level = 0, other_field = tracing::field::Empty);
let _outer_entered = outer_span.enter();
// Some code...
outer_span.record("other_field", &7);
```

如果基于之前的代码运行上面的代码，我们将不会记录 `other_field`，因为该字段在收到 `on_new_span` 事件时，还不存在。

对此，`Layer` 提供了 `on_record` 方法：
```rust
// in examples/figure_10/custom_layer.rs

fn on_record(
    &self,
    id: &tracing::span::Id,
    values: &tracing::span::Record<'_>,
    ctx: tracing_subscriber::layer::Context<'_, S>,
) {
    // 获取正在记录数据的 span
    let span = ctx.span(id).unwrap();

    // 获取数据的可变引用，该数据是在 on_new_span 中创建的
    let mut extensions_mut = span.extensions_mut();
    let custom_field_storage: &mut CustomFieldStorage =
        extensions_mut.get_mut::<CustomFieldStorage>().unwrap();
    let json_data: &mut BTreeMap<String, serde_json::Value> = &mut custom_field_storage.0;

    // 使用我们的访问器老朋友
    let mut visitor = JsonVisitor(json_data);
    values.record(&mut visitor);
}
```


终于，在最后，我们拥有了一个功能齐全的自定义的 JSON logger，大家快去尝试下吧。当然，你也可以根据自己的需求来定制专属于你的 logger，毕竟方法是一通百通的。

> 在以下 github 仓库，可以找到完整的代码: https://github.com/bryanburgers/tracing-blog-post 
>
> 本文由 Rustt 提供翻译
> 原文链接: https://github.com/studyrs/Rustt/blob/main/Articles/%5B2022-04-07%5D%20在%20Rust%20中使用%20tracing%20自定义日志.md
