FROM rust:1.87-slim-bookworm AS builder

ENV CARGO_HOME=/usr/local/cargo
RUN cargo install mdbook

WORKDIR /app
COPY . .
RUN mdbook build --dest-dir /book

FROM nginx:alpine
COPY --from=builder /book /usr/share/nginx/html
