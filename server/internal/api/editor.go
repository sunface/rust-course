package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/posts"
	"github.com/imdotdev/im.dev/server/internal/session"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
)

func GetEditorPosts(c *gin.Context) {
	user := session.CurrentUser(c)
	ars, err := posts.UserPosts(int64(user.ID))
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func SubmitPost(c *gin.Context) {
	res, err := posts.SubmitPost(c)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(res))
}

func DeletePost(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := session.CurrentUser(c)
	creator, err := posts.GetPostCreator(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	if user.ID != creator {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err = posts.DeletePost(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetEditorPost(c *gin.Context) {
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := session.CurrentUser(c)
	creator, err := posts.GetPostCreator(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	if user.ID != creator {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	ar, err := posts.GetPost(id, "")
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ar))
}
