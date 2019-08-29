package internal

import (
	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/session"
)

func apiHandler(e *echo.Echo) {
	// sign-in apis
	e.POST("/web/signIn", session.SignIn)
	e.POST("/web/signOut", session.SignOut)
}
