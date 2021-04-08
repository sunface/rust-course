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
