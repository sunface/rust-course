package db

import (
	"database/sql"

	"github.com/go-redis/redis/v8"
)

var Conn *sql.DB
var Redis *redis.Client
