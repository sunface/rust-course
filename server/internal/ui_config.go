package internal

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
)

type UIConfig struct {
	Posts *UIPosts `json:"posts"`
}

type UIPosts struct {
	TitleMaxLen    int  `json:"titleMaxLen"`
	BriefMaxLen    int  `json:"briefMaxLen"`
	WritingEnabled bool `json:"writingEnabled"`
}

func GetUIConfig(c *gin.Context) {
	conf := &UIConfig{
		Posts: &UIPosts{
			TitleMaxLen:    config.Data.Posts.TitleMaxLen,
			BriefMaxLen:    config.Data.Posts.BriefMaxLen,
			WritingEnabled: config.Data.Posts.WritingEnabled,
		},
	}

	c.JSON(http.StatusOK, common.RespSuccess(conf))
}
