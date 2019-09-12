package misc

import (
	"encoding/base64"

	"github.com/microcosm-cc/bluemonday"
	"go.uber.org/zap"
)

// Conf is the global var for config
var Conf *Config

// Log is the global var for log
var Log *zap.Logger

// Base64 is the base64 handler
var Base64 = base64.NewEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")

// Sanitizer makes outside string clean
var Sanitizer *bluemonday.Policy

func init() {
	p := bluemonday.UGCPolicy()
	p.AllowAttrs("class").Globally()
	p.AllowAttrs("id").Globally()
	p.AllowElements("input")
	p.AllowAttrs("checked").OnElements("input")
	p.AllowAttrs("disabled").OnElements("input")
	p.AllowAttrs("type").OnElements("input")
	p.AllowAttrs("style").OnElements("span")
	p.AllowAttrs("style").OnElements("td")
	p.AllowAttrs("style").OnElements("th")

	p.AllowDataURIImages()

	Sanitizer = p
}
