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
	BriefMaxLen int `json:"briefMaxLen"`
}

func GetUIConfig(c *gin.Context) {
	conf := &UIConfig{
		Posts: &UIPosts{
			BriefMaxLen: config.Data.Posts.BriefMaxLen,
		},
	}

	c.JSON(http.StatusOK, common.RespSuccess(conf))
}
