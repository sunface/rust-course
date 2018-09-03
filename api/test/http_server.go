package main

import (
	"flag"
	"log"

	"runtime"

	"github.com/valyala/fasthttp"
)

func main() {
	runtime.GOMAXPROCS(1)
	flag.Parse()

	h := requestHandler

	if err := fasthttp.ListenAndServe("localhost:10001", h); err != nil {
		log.Fatalf("Error in ListenAndServe: %s", err)
	}
}

func requestHandler(ctx *fasthttp.RequestCtx) {
	ctx.SetContentType("text/plain; charset=utf8")

	// Set arbitrary headers
	ctx.Response.Header.Set("X-My-Header", "my-header-value")

	// Set cookies
	var c fasthttp.Cookie
	c.SetKey("cookie-name")
	c.SetValue("cookie-value")
	ctx.Response.Header.SetCookie(&c)
}
