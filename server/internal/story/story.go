package story

import (
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "story")

func Exist(id string) bool {
	switch id[:1] {
	case models.StoryPost:
		return postExist(id)
	case models.StoryComment:
		return commentExist(id)
	default:
		return false
	}
}

func getStorySqlTable(id string) string {
	switch id[:1] {
	case models.StoryPost:
		return "posts"
	case models.StoryComment:
		return "comments"
	default:
		return "unknown"
	}
}
