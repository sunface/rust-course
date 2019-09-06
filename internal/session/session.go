package session

import (
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/thinkindev/im.dev/internal/ecode"

	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/misc"
)

// Session contains user's info
type Session struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	NickName string `json:"nickname"`
	Avatar   string `json:"avatar"`
	Token    string `json:"token"`
}

var sessions = &sync.Map{}

// SignIn is user's sign-in action
func SignIn(c echo.Context) error {
	ui := &Session{"13269", "sunface", "Sunface", "https://avatars2.githubusercontent.com/u/7036754?s=460&v=4", "sunface" + strconv.FormatInt(time.Now().Unix(), 10)}
	sessions.Store(ui.Token, ui)
	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: ui,
	})
}

// SignOut is user's sign-out action
func SignOut(c echo.Context) error {
	token := c.Request().Header.Get("token")
	sessions.Delete(token)
	return c.JSON(http.StatusOK, misc.HTTPResp{})
}

// CheckSignIn checks whether user has signed in
func CheckSignIn(f echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		token := c.Request().Header.Get("token")
		_, ok := sessions.Load(token)
		if !ok {
			return c.JSON(http.StatusUnauthorized, misc.HTTPResp{
				ErrCode: ecode.NotSignIn,
				Message: ecode.NotSignInMsg,
			})
		}

		return f(c)
	}
}

// Get return the session for given user
func Get(c echo.Context) *Session {
	token := c.Request().Header.Get("token")
	s, ok := sessions.Load(token)
	if !ok {
		return nil
	}
	return s.(*Session)
}
