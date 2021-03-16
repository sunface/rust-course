package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/org"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func CreateOrg(c *gin.Context) {
	o := &models.User{}
	c.Bind(&o)

	exist, err := user.NameExist(o.Username)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	if exist {
		c.JSON(http.StatusConflict, common.RespError(e.AlreadyExist))
		return
	}

	u := user.CurrentUser(c)
	err = org.Create(o, u.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func UpdateOrg(c *gin.Context) {
	u := &models.User{}
	c.Bind(&u)

	currentUser := user.CurrentUser(c)
	if !org.IsOrgAdmin(currentUser.ID, u.ID) {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err := user.UpdateUser(u)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetOrgByUserID(c *gin.Context) {
	userID := c.Param("userID")
	if userID == "0" {
		u := user.CurrentUser(c)
		if u == nil {
			c.JSON(http.StatusBadRequest, common.RespError(e.BadRequest))
			return
		}

		userID = u.ID
	}

	orgs, err := org.GetOrgByUserID(userID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(orgs))
}

func GetOrgMembers(c *gin.Context) {
	orgID := c.Param("id")

	u := user.CurrentUser(c)
	users, err := org.GetMembers(u, orgID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(users))
}
