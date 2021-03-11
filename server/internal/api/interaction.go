package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func Follow(c *gin.Context) {
	user := user.CurrentUser(c)
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	err := interaction.Follow(id, user.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func Followed(c *gin.Context) {
	user := user.CurrentUser(c)
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	followed := false
	if user != nil {
		followed = interaction.GetFollowed(id, user.ID)
	}

	c.JSON(http.StatusOK, common.RespSuccess(followed))
}

func Like(c *gin.Context) {
	user := user.CurrentUser(c)
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	err := interaction.Like(id, user.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetFollowing(c *gin.Context) {
	userID := c.Param("userID")
	targetType := c.Query("type")
	if userID == "" || !models.ValidFollowIDType(targetType) {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	if userID == "0" {
		u := user.CurrentUser(c)
		userID = u.ID
	}

	tags, err := interaction.GetFollowing(userID, targetType)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(tags))
}

func SetFollowingWeight(c *gin.Context) {
	f := &models.Following{}
	c.Bind(&f)
	u := user.CurrentUser(c)
	err := interaction.SetFolloingWeight(u.ID, f)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
