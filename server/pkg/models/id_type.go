package models

const (
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
		return "unknown"
	}
}
