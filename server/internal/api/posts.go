package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func GetEditorPosts(c *gin.Context) {
	user := user.CurrentUser(c)
	tp := c.Query("type")
	if !models.ValidStoryIDType(tp) {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}
	ars, err := story.UserPosts(tp, user, user.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func GetOrgPosts(c *gin.Context) {
	orgID := c.Param("id")
	tp := c.Query("type")
	if tp != models.IDTypeUndefined && !models.ValidStoryIDType(tp) {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := user.CurrentUser(c)
	ars, err := story.OrgPosts(tp, user, orgID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func GetEditorDrafts(c *gin.Context) {
	user := user.CurrentUser(c)
	ars, err := story.UserDrafts(nil, user.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func GetUserPosts(c *gin.Context) {
	userID := c.Param("userID")

	user := user.CurrentUser(c)

	posts, err := story.UserPosts(models.IDTypeUndefined, user, userID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetTagPosts(c *gin.Context) {
	tagID := c.Param("id")
	user := user.CurrentUser(c)
	posts, err := story.TagPosts(user, tagID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetHomePosts(c *gin.Context) {
	filter := c.Param("filter")
	user := user.CurrentUser(c)
	posts, err := story.HomePosts(user, filter)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetBookmarkPosts(c *gin.Context) {
	filter := c.Param("filter")
	user := user.CurrentUser(c)

	posts, err := story.BookmarkPosts(user, filter)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}
