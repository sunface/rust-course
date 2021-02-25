package internal

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
)

type UIConfig struct {
	Posts *PostsConfig `json:"posts"`
}

type PostsConfig struct {
	TitleMaxLen    int  `json:"titleMaxLen"`
	BriefMaxLen    int  `json:"briefMaxLen"`
	WritingEnabled bool `json:"writingEnabled"`
	MaxTags        int  `json:"maxTags"`
}

// 在后台页面配置，存储到mysql中
func GetUIConfig(c *gin.Context) {
	conf := &UIConfig{
		Posts: &PostsConfig{
			TitleMaxLen:    config.Data.Posts.TitleMaxLen,
			BriefMaxLen:    config.Data.Posts.BriefMaxLen,
			WritingEnabled: config.Data.Posts.WritingEnabled,
			MaxTags:        2,
		},
	}

	c.JSON(http.StatusOK, common.RespSuccess(conf))
}
