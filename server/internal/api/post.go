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

func GetPost(c *gin.Context) {
	slug := c.Param("slug")

	ar, err := posts.GetPost(0, slug)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	user := session.CurrentUser(c)
	if user == nil {
		ar.Liked = false
	} else {
		ar.Liked = posts.GetLiked(ar.ID, user.ID)

	}

	c.JSON(http.StatusOK, common.RespSuccess(ar))
}

func LikePost(c *gin.Context) {
	user := session.CurrentUser(c)
	id, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	if id == 0 {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	err := posts.Like(id, user.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
