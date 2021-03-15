package internal

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
)

type Config struct {
	AppName      string       `json:"appName"`
	CommonMaxLen int          `json:"commonMaxlen"`
	Posts        *PostsConfig `json:"posts"`
	User         *UserConfig  `json:"user"`
}

type PostsConfig struct {
	TitleMaxLen    int  `json:"titleMaxLen"`
	BriefMaxLen    int  `json:"briefMaxLen"`
	WritingEnabled bool `json:"writingEnabled"`
	MaxTags        int  `json:"maxTags"`
}

type UserConfig struct {
	NicknameMaxLen int `json:"nicknameMaxLen"`
	UsernameMaxLen int `json:"usernameMaxLen"`
	NavabarMaxLen  int `json:"navbarMaxLen"`
}

// 在后台页面配置，存储到mysql中
func GetConfig(c *gin.Context) {
	conf := &Config{
		AppName:      config.Data.Common.AppName,
		CommonMaxLen: 255,
		Posts: &PostsConfig{
			TitleMaxLen:    config.Data.Posts.TitleMaxLen,
			BriefMaxLen:    config.Data.Posts.BriefMaxLen,
			WritingEnabled: config.Data.Posts.WritingEnabled,
			MaxTags:        2,
		},
		User: &UserConfig{
			UsernameMaxLen: 39,
			NicknameMaxLen: 64,
			NavabarMaxLen:  20,
		},
	}

	c.JSON(http.StatusOK, common.RespSuccess(conf))
}
