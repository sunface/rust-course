package api

import (
	"github.com/imdotdev/im.dev/server/internal/org"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "api")

/* 鉴权、数据合法性验证都在api模块进行处理 */

func isStoryCreator(userID string, storyID string) bool {
	if models.GetIDType(storyID) == models.IDTypeSeries {
		// 如果是series，需要判断它属于组织还是个人,两者的权限验证不同
		story, _ := story.GetStory(storyID, "")
		if story.OwnerID != "" {
			if !org.IsOrgAdmin(userID, story.OwnerID) {
				return false
			}
		} else {
			if !models.IsStoryCreator(userID, storyID) {
				return false
			}
		}
	} else {
		if !models.IsStoryCreator(userID, storyID) {
			return false
		}
	}

	return true
}
