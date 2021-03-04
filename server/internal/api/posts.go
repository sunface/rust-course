package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
)

func GetEditorPosts(c *gin.Context) {
	user := user.CurrentUser(c)
	ars, err := story.UserPosts(user, int64(user.ID))
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func GetUserPosts(c *gin.Context) {
	userID, _ := strconv.ParseInt(c.Param("userID"), 10, 64)

	user := user.CurrentUser(c)

	posts, err := story.UserPosts(user, userID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetTagPosts(c *gin.Context) {
	tagID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
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
