package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/internal/top"
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
	ars, err := story.UserPosts(tp, user, user.ID, 0, 0)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func GetOrgPosts(c *gin.Context) {
	tp := c.Query("type")
	if tp != models.IDTypeUndefined && !models.ValidStoryIDType(tp) {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	filter := c.Query("filter")
	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)
	perPage, _ := strconv.ParseInt(c.Query("per_page"), 10, 64)

	orgID := c.Param("id")

	user := user.CurrentUser(c)

	var posts []*models.Story
	var err *e.Error

	if filter == "" {
		posts, err = story.OrgPosts(tp, user, orgID, page, perPage)
	} else {
		posts, err = story.OrgTagPosts(user, filter, orgID, page, perPage)
	}

	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
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
	filter := c.Query("filter")
	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)
	perPage, _ := strconv.ParseInt(c.Query("per_page"), 10, 64)

	userID := c.Param("userID")

	user := user.CurrentUser(c)

	var posts []*models.Story
	var err *e.Error

	if filter == "" {
		posts, err = story.UserPosts(models.IDTypeUndefined, user, userID, page, perPage)
	} else {
		posts, err = story.UserTagPosts(user, filter, userID, page, perPage)
	}

	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetTagPosts(c *gin.Context) {
	var posts []*models.Story
	var err *e.Error

	tagID := c.Param("id")
	user := user.CurrentUser(c)

	filter := c.Query("filter")
	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)
	perPage, _ := strconv.ParseInt(c.Query("per_page"), 10, 64)
	if filter == models.FilterLatest {
		posts, err = story.TagPosts(user, tagID, page, perPage)
	} else {
		var ids []string
		ids = top.GetTopList(fmt.Sprintf(top.TagFormat, tagID, filter), (page-1)*perPage, page*perPage)
		posts, err = story.GetPostsByIDs(user, ids)
	}

	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetHomePosts(c *gin.Context) {
	var posts []*models.Story
	var err *e.Error
	user := user.CurrentUser(c)

	filter := c.Query("filter")
	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)
	perPage, _ := strconv.ParseInt(c.Query("per_page"), 10, 64)
	if filter == models.FilterBest {
		posts, err = story.HomePosts(user, filter, page, perPage)
	} else if filter == models.FilterLatest {
		posts, err = story.HomePosts(user, filter, page, perPage)
	} else {
		var ids []string
		ids = top.GetTopList(top.GlobalPrefix+filter, (page-1)*perPage, page*perPage)
		posts, err = story.GetPostsByIDs(user, ids)
	}

	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func GetDashboardPosts(c *gin.Context) {
	user := user.CurrentUser(c)

	posts, err := story.DashboardPosts(user)
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
