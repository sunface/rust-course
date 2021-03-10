package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func SubmitStory(c *gin.Context) {
	res, err := story.SubmitStory(c)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(res))
}

func SubmitPostDraft(c *gin.Context) {
	res, err := story.SubmitPostDraft(c)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(res))
}

func DeletePost(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := user.CurrentUser(c)
	if !models.IsStoryCreator(user.ID, id) {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err := story.DeletePost(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
func GetStory(c *gin.Context) {
	id := c.Param("id")

	user := user.CurrentUser(c)
	ar, err := story.GetStory(id, "")
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	if user != nil {
		ar.Liked = interaction.GetLiked(ar.ID, user.ID)
		ar.Bookmarked, _ = story.Bookmarked(user.ID, ar.ID)
	}

	c.JSON(http.StatusOK, common.RespSuccess(ar))
}

func GenStoryID(c *gin.Context) {
	tp := c.Param("type")
	if !models.ValidStoryIDType(tp) {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(utils.GenID(tp)))
}

func Bookmark(c *gin.Context) {
	storyID := c.Param("storyID")

	user := user.CurrentUser(c)

	err := story.Bookmark(user.ID, storyID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func SubmitSeriesPost(c *gin.Context) {
	seriesID := c.Param("id")
	exist := models.IdExist(seriesID)
	if !exist {
		c.JSON(http.StatusNotFound, common.RespError(e.NotFound))
		return
	}

	u := user.CurrentUser(c)
	if !models.IsStoryCreator(u.ID, seriesID) {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}
	posts := make([]*models.SeriesPost, 0)
	err0 := c.Bind(&posts)
	if err0 != nil {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	err := story.SubmitSeriesPost(seriesID, posts)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetSeriesPost(c *gin.Context) {
	id := c.Param("id")

	posts, err := story.GetSeriesPost(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func DeleteSeriesPost(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := user.CurrentUser(c)
	if !models.IsStoryCreator(user.ID, id) {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err := story.DeleteSeriesPost(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))

}
