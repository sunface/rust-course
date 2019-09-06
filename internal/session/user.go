package session

import (
	"net/http"
	"time"

	"github.com/labstack/echo"
	"go.uber.org/zap"

	"github.com/thinkindev/im.dev/internal/ecode"
	"github.com/thinkindev/im.dev/internal/misc"
)

// InitUser insert preserve users
func InitUser() {
	err := misc.CQL.Query(`INSERT INTO user (id,name,nickname,avatar,create_date,edit_date) VALUES (?,?,?,?,?,?)`,
		"13269", "sunface", "Sunface", "https://avatars2.githubusercontent.com/u/7036754?s=460&v=4", time.Now().Unix(), 0).Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err))
	}
}

// CheckUserExist checks user exist by given user id
func CheckUserExist(n string) bool {
	var name string
	err := misc.CQL.Query(`SELECT name FROM user where name=?`, n).Scan(&name)
	if err != nil && err.Error() != misc.CQLNotFound {
		misc.Log.Warn("access database error", zap.Error(err))
		return false
	}

	if name != "" {
		return true
	}

	return false
}

// GetUser returns user detail info
func GetUser(c echo.Context) error {
	uid := c.FormValue("uid")
	sess := GetUserByID(uid)
	if sess == nil {
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: sess,
	})
}

// GetUserByID return the user info by user id
func GetUserByID(uid string) *Session {
	sess := &Session{ID: uid}

	err := misc.CQL.Query(`SELECT name,nickname,avatar FROM user WHERE id=?`, uid).Scan(&sess.Name, &sess.NickName, &sess.Avatar)
	if err != nil && err.Error() != misc.CQLNotFound {
		misc.Log.Warn("access database error", zap.Error(err))
		return nil
	}

	return sess
}
