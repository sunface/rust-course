package misc

import (
	"encoding/base64"

	"github.com/gocql/gocql"
	"go.uber.org/zap"
)

// Conf is the global var for config
var Conf *Config

// Log is the global var for log
var Log *zap.Logger

// Base64 is the base64 handler
var Base64 = base64.NewEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")

// CQL is the cql session for access cassandra
var CQL *gocql.Session
