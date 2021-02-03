package db

import (
	"database/sql"
	"strings"
)

var Conn *sql.DB

func IsErrUniqueConstraint(err error) bool {
	if strings.Contains(err.Error(), "UNIQUE") {
		return true
	}

	return false
}
