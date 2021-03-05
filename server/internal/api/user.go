package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func GetUsers(c *gin.Context) {
	query := c.Query("query")
	users, err := user.GetUsers(query)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(users))
}

func GetUserSelf(c *gin.Context) {
	u := user.CurrentUser(c)

	userDetail, err := user.GetUserDetail(u.ID, "")
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(userDetail))
}

func GetUser(c *gin.Context) {
	username := c.Param("username")

	userDetail, err := user.GetUserDetail("", username)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(userDetail))
}

func UpdateUser(c *gin.Context) {
	u := &models.User{}
	c.Bind(&u)

	currentUser := user.CurrentUser(c)
	if currentUser.ID != u.ID {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err := user.UpdateUser(u)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetSession(c *gin.Context) {
	sess := user.GetSession(c)
	c.JSON(http.StatusOK, common.RespSuccess(sess))
}
