package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func GetUsers(c *gin.Context) {
	query := c.Query("query")
	users, err := user.GetUsers(query)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(users))
}

func GetUsersByIDs(c *gin.Context) {
	ids := make([]string, 0)
	err := c.Bind(&ids)
	if err != nil {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	us := user.GetUsersByIDs(ids)

	c.JSON(http.StatusOK, common.RespSuccess(us))
}

func GetUserSelf(c *gin.Context) {
	u := user.CurrentUser(c)

	userDetail, err := user.GetUserDetail(u.ID, "")
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(userDetail))
}

func GetUser(c *gin.Context) {
	username := c.Param("username")

	userDetail, err := user.GetUserDetail(username, username)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	u := user.CurrentUser(c)
	if u != nil {
		userDetail.Followed = interaction.GetFollowed(userDetail.ID, u.ID)
	}
	c.JSON(http.StatusOK, common.RespSuccess(userDetail))
}

func UpdateUser(c *gin.Context) {
	u := &models.User{}
	c.Bind(&u)

	currentUser := user.CurrentUser(c)
	if currentUser.ID != u.ID {
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

func GetSession(c *gin.Context) {
	sess := user.GetSession(c)
	c.JSON(http.StatusOK, common.RespSuccess(sess))
}

func SubmitUserNavbar(c *gin.Context) {
	nav := &models.Navbar{}
	err := c.Bind(&nav)
	if err != nil || !models.ValidNavbarType(nav.Type) {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	u := user.CurrentUser(c)
	if nav.Type == models.NavbarTypeSeries {
		if !models.IsStoryCreator(u.ID, nav.Value) {
			c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		}
	}

	nav.UserID = u.ID
	err1 := user.SubmitNavbar(nav)
	if err != nil {
		c.JSON(err1.Status, common.RespError(err1.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetUserNavbars(c *gin.Context) {
	userID := c.Param("userID")

	if userID == "0" {
		u := user.CurrentUser(c)
		userID = u.ID
	}

	navbars, err := user.GetNavbars(userID)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(navbars))
}

func DeleteUserNavbar(c *gin.Context) {
	id := c.Param("id")

	u := user.CurrentUser(c)
	err := user.DeleteNavbar(u.ID, id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func UserNameExist(c *gin.Context) {
	name := c.Param("name")
	if strings.TrimSpace(name) == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	exist, err := user.NameExist(name)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(exist))
}

func UserEmailExist(c *gin.Context) {
	email := c.Param("email")
	if strings.TrimSpace(email) == "" {
		c.JSON(http.StatusBadRequest, common.RespError(e.ParamInvalid))
		return
	}

	exist, err := user.EmailExist(email)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(exist))
}

func GetUserEmailByCode(c *gin.Context) {
	code := c.Query("code")
	email, err := user.GetEmailByCode(code)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(email))
}

type RegisterReq struct {
	Code     string `json:"code"`
	Nickname string `json:"nickname"`
	Username string `json:"username"`
}

func UserRegister(c *gin.Context) {
	req := &RegisterReq{}
	c.Bind(&req)

	user.Register(c, req.Code, req.Nickname, req.Username)
}

func GetUserModerators(c *gin.Context) {

}
