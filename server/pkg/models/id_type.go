package models

import (
	"fmt"

	"github.com/grafana/grafana/pkg/cmd/grafana-cli/logger"
	"github.com/imdotdev/im.dev/server/pkg/db"
)

const (
	IDUndefined   = "0"
	IDTypePost    = "1"
	IDTypeComment = "2"
	IDTypeUser    = "3"
	IDTypeTag     = "4"
)

func GetIDType(id string) string {
	if id == "" {
		return ""
	}

	return id[:1]
}

func GetIdTypeTable(id string) string {
	switch id[:1] {
	case IDTypePost:
		return "posts"
	case IDTypeComment:
		return "comments"
	case IDTypeUser:
		return "user"
	case IDTypeTag:
		return "tags"
	default:
		return IDUndefined
	}
}

func IdExist(id string) bool {
	if id == "" {
		return false
	}

	tbl := GetIdTypeTable(id)
	if tbl == IDUndefined {
		return false
	}

	var nid string
	err := db.Conn.QueryRow(fmt.Sprintf("SELECT id from %s WHERE id=?", tbl), id).Scan(&nid)
	if err != nil {
		logger.Warn("query post error", "error", err)
		return false
	}

	if nid != id {
		return false
	}

	return true
}
