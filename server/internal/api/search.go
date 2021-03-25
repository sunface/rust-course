package api

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/search"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func SearchPosts(c *gin.Context) {
	filter := c.Query("filter")
	query := c.Query("query")
	if !models.ValidSearchFilter(filter) || query == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	page, _ := strconv.ParseInt(c.Query("page"), 10, 64)
	perPage, _ := strconv.ParseInt(c.Query("per_page"), 10, 64)

	user := user.CurrentUser(c)
	posts := search.Posts(user, filter, query, page, perPage)

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func SearchUsers(c *gin.Context) {
	filter := c.Query("filter")
	query := c.Query("query")
	if !models.ValidSearchFilter(filter) || query == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := user.CurrentUser(c)
	users := search.Users(user, filter, query)

	c.JSON(http.StatusOK, common.RespSuccess(users))
}
