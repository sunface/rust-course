package user

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/asaskevich/govalidator"
	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/email"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/matcornic/hermes/v2"
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

func LoginEmail(c *gin.Context) {
	user := &models.User{}
	c.Bind(&user)

	if !govalidator.IsEmail(user.Email) {
		c.JSON(http.StatusBadRequest, common.RespError("邮件格式不合法"))
		return
	}

	fmt.Println(user.Email)

	e := hermes.Email{
		Body: hermes.Body{
			Title: "Hello there",
			Name:  "",
			Intros: []string{
				fmt.Sprintf("Welcome to %s! We're very excited to have you on board.", config.Data.Common.AppName),
			},
			Actions: []hermes.Action{
				{
					Instructions: "To get started, please click here:",
					Button: hermes.Button{
						Color: "#22BC66", // Optional action button color
						Text:  "Confirm your account",
						Link:  config.Data.UI.Domain,
					},
				},
			},
			Outros: []string{
				"Need help, or have questions? Just reply to this email, we'd love to help.",
			},
		},
	}

	emailBody, err := email.H.GenerateHTML(e)

	emailMsg := &email.EmailMessage{
		To:      []string{user.Email},
		From:    fmt.Sprintf("%s <%s>", config.Dynamic.SMTP.FromName, config.Dynamic.SMTP.FromAddress),
		Subject: fmt.Sprintf("Sign in to %s", config.Data.Common.AppName),
		Body:    emailBody,
	}

	err = email.Send(emailMsg)
	if err != nil {
		logger.Warn("send login email error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}
	// err := user.Query("", "", user.Email)
	// if err != nil {
	// 	if err == sql.ErrNoRows {
	// 		c.JSON(http.StatusNotFound, common.RespError("邮箱不存在"))
	// 		return
	// 	}
	// 	logger.Error("login error", "error", err)
	// 	c.JSON(http.StatusInternalServerError, common.RespInternalError())
	// 	return
	// }

	// // delete old session
	// token := getToken(c)
	// deleteSession(token)

	// token = strconv.FormatInt(time.Now().UnixNano(), 10)
	// session := &Session{
	// 	Token:      token,
	// 	User:       user,
	// 	CreateTime: time.Now(),
	// }

	// err = storeSession(session)
	// if err != nil {
	// 	c.JSON(500, common.RespInternalError())
	// 	return
	// }

	// _, err = db.Conn.Exec(`UPDATE user SET last_seen_at=? WHERE id=?`, time.Now(), user.ID)
	// if err != nil {
	// 	logger.Warn("set last login date error", "error", err)
	// }

	c.JSON(http.StatusOK, common.RespSuccess(nil))
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
