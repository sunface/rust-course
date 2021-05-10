package api

import (
	"encoding/json"
	"net/http"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/admin"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func AdminSubmitUser(c *gin.Context) {
	currentUser := user.CurrentUser(c)
	if !currentUser.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	u := &models.User{}
	c.Bind(&u)

	if u.Username == "" || u.Email == "" || !govalidator.IsEmail(u.Email) || !u.Role.IsValid() {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	err0 := models.IsUsernameValid(u.Username)
	if err0 != nil {
		c.JSON(http.StatusBadRequest, common.RespError(err0.Error()))
		return
	}
	err := user.SubmitUser(u)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func AdminGetUsers(c *gin.Context) {
	currentUser := user.CurrentUser(c)
	if !currentUser.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	users, err := admin.GetUsers()
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(users))
}

func AdminConfig(c *gin.Context) {
	var data []byte
	db.Conn.QueryRow("SELECT data FROM config WHERE id=?", 1).Scan(&data)

	m := make(map[string]interface{})
	json.Unmarshal(data, &m)
	c.JSON(http.StatusOK, common.RespSuccess(m))
}

type ReportReq struct {
	TargetID string `json:"targetID"`
	Content  string `json:"content"`
}

func SubmitReport(c *gin.Context) {
	req := &ReportReq{}
	c.Bind(&req)

	u := user.CurrentUser(c)
	err := admin.AddReport(req.TargetID, req.Content, u.ID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetReports(c *gin.Context) {
	currentUser := user.CurrentUser(c)
	if !currentUser.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	res, err := admin.GetReports(1)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(res))
}

func DeleteReport(c *gin.Context) {
	id := c.Param("id")
	currentUser := user.CurrentUser(c)
	if !currentUser.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err := admin.DeleteReport(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
