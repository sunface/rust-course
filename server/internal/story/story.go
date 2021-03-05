package story

import (
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "story")

func Exist(id string) bool {
	switch id[:1] {
	case models.IDTypePost:
		return postExist(id)
	case models.IDTypeComment:
		return commentExist(id)
	default:
		return false
	}
}
