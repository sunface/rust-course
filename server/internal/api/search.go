package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/search"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func SearchPosts(c *gin.Context) {
	filter := c.Param("filter")
	query := c.Query("query")
	if !models.ValidSearchFilter(filter) || query == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := user.CurrentUser(c)
	posts := search.Posts(user, filter, query)

	c.JSON(http.StatusOK, common.RespSuccess(posts))
}

func SearchUsers(c *gin.Context) {
	filter := c.Param("filter")
	query := c.Query("query")
	if !models.ValidSearchFilter(filter) || query == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	user := user.CurrentUser(c)
	users := search.Users(user, filter, query)

	c.JSON(http.StatusOK, common.RespSuccess(users))
}
