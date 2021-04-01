package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/notification"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
)

func GetNotifications(c *gin.Context) {
	tp, _ := strconv.Atoi(c.Param("type"))
	u := user.CurrentUser(c)

	nos, err := notification.Query(u, tp)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nos))
}

func GetUnread(c *gin.Context) {
	u := user.CurrentUser(c)
	count := notification.QueryUnRead(u.ID)

	c.JSON(http.StatusOK, common.RespSuccess(count))
}

func ResetUnread(c *gin.Context) {
	u := user.CurrentUser(c)
	err := notification.ResetUnRead(u.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}
	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
