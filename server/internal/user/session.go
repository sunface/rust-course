package user

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "user")

type Session struct {
	Token      string       `json:"token"`
	User       *models.User `json:"user"`
	CreateTime time.Time    `json:"createTime"`
}

func Login(c *gin.Context) {
	user := &models.User{}
	c.Bind(&user)
	err := user.Query("", "", user.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, common.RespError("邮箱不存在"))
			return
		}
		logger.Error("login error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespInternalError())
		return
	}

	// delete old session
	token := getToken(c)
	deleteSession(token)

	token = strconv.FormatInt(time.Now().UnixNano(), 10)
	session := &Session{
		Token:      token,
		User:       user,
		CreateTime: time.Now(),
	}

	err = storeSession(session)
	if err != nil {
		c.JSON(500, common.RespInternalError())
		return
	}

	_, err = db.Conn.Exec(`UPDATE user SET last_seen_at=? WHERE id=?`, time.Now(), user.ID)
	if err != nil {
		logger.Warn("set last login date error", "error", err)
	}

	c.JSON(http.StatusOK, common.RespSuccess(session))
}

// Logout ...
func Logout(c *gin.Context) {
	token := getToken(c)
	// 删除用户的session
	deleteSession(token)

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func getToken(c *gin.Context) string {
	return c.Request.Header.Get("X-Token")
}

func deleteSession(sid string) {
	q := `DELETE FROM sessions  WHERE sid=?`
	_, err := db.Conn.Exec(q, sid)
	if err != nil {
		logger.Warn("delete session error", "error", err)
	}
}

func storeSession(s *Session) error {
	q := `insert into  sessions (user_id,sid) VALUES (?,?)`
	_, err := db.Conn.Exec(q, s.User.ID, s.Token)
	if err != nil {
		logger.Warn("store session error", "error", err)
		return err
	}
	return nil
}

func CurrentUser(c *gin.Context) *models.User {
	token := getToken(c)
	createTime, _ := strconv.ParseInt(token, 10, 64)
	if createTime != 0 {
		// check whether token is expired
		if (time.Now().Unix() - createTime/1e9) > config.Data.User.SessionExpire {
			return nil
		}
	}

	sess := loadSession(token)
	if sess == nil {
		// 用户未登陆或者session失效
		return nil
	}

	return sess.User
}

func GetSession(c *gin.Context) *Session {
	token := getToken(c)
	createTime, _ := strconv.ParseInt(token, 10, 64)
	if createTime != 0 {
		// check whether token is expired
		if (time.Now().Unix() - createTime/1e9) > config.Data.User.SessionExpire {
			return nil
		}
	}

	sess := loadSession(token)
	if sess == nil {
		// 用户未登陆或者session失效
		return nil
	}

	return sess
}

func loadSession(sid string) *Session {
	var userid string
	q := `SELECT user_id FROM sessions WHERE sid=?`
	err := db.Conn.QueryRow(q, sid).Scan(&userid)
	if err != nil {
		if err != sql.ErrNoRows {
			logger.Warn("query session error", "error", err)
		}
		return nil
	}

	user := &models.User{}
	err = user.Query(userid, "", "")
	if err != nil {
		logger.Warn("query user error", "error", err)
		return nil
	}

	return &Session{
		Token: sid,
		User:  user,
	}
}
