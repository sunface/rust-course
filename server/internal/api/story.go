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

	u := user.CurrentUser(c)
	if !isStoryCreator(u.ID, id) {
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

	u := user.CurrentUser(c)
	ar, err := story.GetStory(id, "")
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	if u != nil {
		ar.Liked = interaction.GetLiked(ar.ID, u.ID)
		ar.Bookmarked, _ = story.Bookmarked(u.ID, ar.ID)
	}

	story.UpdateViews(id)
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

	u := user.CurrentUser(c)

	err := story.Bookmark(u.ID, storyID)
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
	if !isStoryCreator(u.ID, seriesID) {
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

func GetSeriesPosts(c *gin.Context) {
	id := c.Param("id")
	u := user.CurrentUser(c)
	posts, err := story.GetSeriesPosts(u, id)
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

	u := user.CurrentUser(c)
	if !isStoryCreator(u.ID, id) {
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

func GetPostSeries(c *gin.Context) {
	postID := c.Param("id")
	series, err := story.GetPostSeries(postID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(series))
}

func GetSeries(c *gin.Context) {
	ids := make([]string, 0)
	c.Bind(&ids)

	u := user.CurrentUser(c)

	series, err := story.GetSeries(u, ids)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(series))
}

type PinData struct {
	TargetID string `json:"targetID"`
	StoryID  string `json:"storyID"`
}

func PinStory(c *gin.Context) {
	storyID := c.Param("storyID")
	u := user.CurrentUser(c)

	if !isStoryCreator(u.ID, storyID) {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err := story.PinStory(storyID, u.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
