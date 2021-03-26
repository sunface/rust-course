package models

import (
	"database/sql"
	"fmt"

	"github.com/imdotdev/im.dev/server/pkg/db"
)

const (
	IDTypeUndefined = "0"
	IDTypeTag       = "1"
	IDTypeComment   = "2"
	IDTypeUser      = "3"
	IDTypePost      = "4"
	IDTypeSeries    = "5"
	IDTypeBook      = "6"
	IDTypeOrg       = "7"
	IDTypeSecret    = "s"
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
		return "story"
	case IDTypeSeries:
		return "story"
	case IDTypeBook:
		return "story"
	case IDTypeComment:
		return "comments"
	case IDTypeUser:
		return "user"
	case IDTypeTag:
		return "tags"
	case IDTypeOrg:
		return "user"
	default:
		return IDTypeUndefined
	}
}

func IsIDStory(id string) bool {
	tp := GetIDType(id)
	return tp == IDTypePost || tp == IDTypeSeries || tp == IDTypeBook
}

func IdExist(id string) bool {
	if id == "" {
		return false
	}

	tbl := GetIdTypeTable(id)
	if tbl == IDTypeUndefined {
		return false
	}

	var nid string
	err := db.Conn.QueryRow(fmt.Sprintf("SELECT id from %s WHERE id=?", tbl), id).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("check id exist error", "error", err, "table", tbl, "id", id)
		return false
	}

	if nid != id {
		return false
	}

	return true
}

func ValidStoryIDType(tp string) bool {
	if tp == IDTypePost || tp == IDTypeSeries || tp == IDTypeBook {
		return true
	}

	return false
}

func ValidFollowIDType(tp string) bool {
	if tp == IDTypeUser || tp == IDTypeTag || tp == IDTypeOrg {
		return true
	}

	return false
}
