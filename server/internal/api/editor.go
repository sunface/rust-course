package api

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/posts"
	"github.com/imdotdev/im.dev/server/internal/session"
	"github.com/imdotdev/im.dev/server/pkg/common"
)

func GetEditorArticles(c *gin.Context) {
	user := session.CurrentUser(c)
	ars, err := posts.UserArticles(int64(user.ID))
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get user articles error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(ars))
}

func PostEditorArticle(c *gin.Context) {
	err := posts.PostArticle(c)
	if err != nil {
		logger.Warn("post article error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func DeleteEditorArticle(c *gin.Context) {
	err := posts.DeleteArticle(c)
	if err != nil {
		logger.Warn("delete article error", "error", err)
		c.JSON(400, common.RespError(err.Error()))
		return
	}
	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
