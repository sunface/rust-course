package internal

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
)

type Config struct {
	AppName      string       `json:"appName"`
	UIDomain     string       `json:"uiDomain"`
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
		UIDomain:     config.Data.UI.Domain,
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

func UpdateConfig(c *gin.Context) {
	d := make(map[string]interface{})
	c.Bind(&d)

	currentUser := user.CurrentUser(c)
	if !currentUser.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	b, _ := json.Marshal(&d)
	_, err := db.Conn.Exec(`UPDATE config SET data=?,updated=? WHERE id=?`, b, time.Now(), 1)
	if err != nil {
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
