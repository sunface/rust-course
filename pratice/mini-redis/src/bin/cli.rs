use mini_redis::{client, DEFAULT_PORT};

use bytes::Bytes;
use std::num::ParseIntError;
use std::str;
use std::time::Duration;
use structopt::StructOpt;

#[derive(StructOpt, Debug)]
#[structopt(name = "mini-redis-cli",  author = env!("CARGO_PKG_AUTHORS"), about = "Issue Redis commands")]
struct Cli {
    #[structopt(subcommand)]
    command: Command,

    #[structopt(name = "hostname", long = "--host", default_value = "127.0.0.1")]
    host: String,

    #[structopt(name = "port", long = "--port", default_value = DEFAULT_PORT)]
    port: String,
}

#[derive(StructOpt, Debug)]
enum Command {
    /// Get the value of key.
    Get {
        /// Name of key to get
        key: String,
    },
    /// Set key to hold the string value.
    Set {
        /// Name of key to set
        key: String,

        /// Value to set.
        #[structopt(parse(from_str = bytes_from_str))]
        value: Bytes,

        /// Expire the value after specified amount of time
        #[structopt(parse(try_from_str = duration_from_ms_str))]
        expires: Option<Duration>,
    },
}

/// Entry point for CLI tool.
///
/// The `[tokio::main]` annotation signals that the Tokio runtime should be
/// started when the function is called. The body of the function is executed
/// within the newly spawned runtime.
///
/// `flavor = "current_thread"` is used here to avoid spawning background
/// threads. The CLI tool use case benefits more by being lighter instead of
/// multi-threaded.
#[tokio::main(flavor = "current_thread")]
async fn main() -> mini_redis::Result<()> {
    // Enable logging
    tracing_subscriber::fmt::try_init()?;

    // Parse command line arguments
    let cli = Cli::from_args();

    // Get the remote address to connect to
    let addr = format!("{}:{}", cli.host, cli.port);

    // Establish a connection
    let mut client = client::connect(&addr).await?;

    // Process the requested command
    match cli.command {
        Command::Get { key } => {
            if let Some(value) = client.get(&key).await? {
                if let Ok(string) = str::from_utf8(&value) {
                    println!("\"{}\"", string);
                } else {
                    println!("{:?}", value);
                }
            } else {
                println!("(nil)");
            }
        }
        Command::Set {
            key,
            value,
            expires: None,
        } => {
            client.set(&key, value).await?;
            println!("OK");
        }
        Command::Set {
            key,
            value,
            expires: Some(expires),
        } => {
            client.set_expires(&key, value, expires).await?;
            println!("OK");
        }
    }

    Ok(())
}

fn duration_from_ms_str(src: &str) -> Result<Duration, ParseIntError> {
    let ms = src.parse::<u64>()?;
    Ok(Duration::from_millis(ms))
}

fn bytes_from_str(src: &str) -> Bytes {
    Bytes::from(src.to_string())
}
