package user

import (
	"database/sql"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/org"
	"github.com/imdotdev/im.dev/server/internal/tags"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func GetUsers(q string) ([]*models.User, *e.Error) {
	users := make([]*models.User, 0)
	for _, u := range models.UsersCache {
		if u.Type != models.IDTypeUser {
			continue
		}

		if strings.HasPrefix(strings.ToLower(u.Nickname), strings.ToLower(q)) {
			users = append(users, u)
			continue
		}

		if strings.HasPrefix(strings.ToLower(u.Username), strings.ToLower(q)) {
			users = append(users, u)
			continue
		}
	}

	return users, nil
}

func GetUsersByIDs(ids []string) []*models.User {
	users := make([]*models.User, 0)
	for _, id := range ids {
		u, ok := models.UsersMapCache[id]
		if ok {
			users = append(users, u)
		}
		u.Followed = true
	}

	return users
}

func GetUserDetail(id string, username string) (*models.User, *e.Error) {
	user := &models.User{}
	err := user.Query(id, username, "")
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, e.New(http.StatusNotFound, e.NotFound)
		}
		logger.Warn("query user error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	err = db.Conn.QueryRow("SELECT tagline,cover,location,avail_for,about,website,twitter,github,zhihu,weibo,facebook,stackoverflow from user_profile WHERE id=?", user.ID).Scan(
		&user.Tagline, &user.Cover, &user.Location, &user.AvailFor, &user.About, &user.Website, &user.Twitter,
		&user.Github, &user.Zhihu, &user.Weibo, &user.Facebook, &user.Stackoverflow,
	)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("query user profile error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	if user.Cover == "" {
		user.Cover = models.DefaultCover
	}

	// get user skills
	skills, rawSkills, err := models.GetTargetTags(user.ID)
	if err != nil {
		logger.Warn("get user skills error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}
	user.RawSkills = rawSkills
	user.Skills = skills

	user.Follows = interaction.GetFollows(user.ID)
	if user.Type == models.IDTypeUser {
		user.Followings = interaction.GetFollowings(user.ID, models.IDTypeUser)
	} else {
		user.Followings = org.GetMemberCount(user.ID)
	}

	return user, nil
}

func UpdateUser(u *models.User) *e.Error {
	_, err := db.Conn.Exec("UPDATE user SET nickname=?,avatar=?,email=?,updated=? WHERE id=?", u.Nickname, u.Avatar, u.Email, time.Now(), u.ID)
	if err != nil {
		if e.IsErrUniqueConstraint(err) {
			return e.New(http.StatusConflict, "email已经存在")
		}
		logger.Warn("update user error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	var nid string
	err = db.Conn.QueryRow("SELECT id FROM user_profile WHERE id=?", u.ID).Scan(&nid)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("update user profile error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	now := time.Now()
	if err == sql.ErrNoRows {
		_, err = db.Conn.Exec("INSERT INTO user_profile (id,tagline,cover,location,avail_for,about,website,twitter,github,zhihu,weibo,facebook,stackoverflow,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
			u.ID, u.Tagline, u.Cover, u.Location, u.AvailFor, u.About, u.Website, u.Twitter, u.Github, u.Zhihu, u.Weibo, u.Facebook, u.Stackoverflow, now)
	} else {
		_, err = db.Conn.Exec("UPDATE user_profile SET tagline=?,cover=?,location=?,avail_for=?,about=?,website=?,twitter=?,github=?,zhihu=?,weibo=?,facebook=?,stackoverflow=?,updated=? WHERE id=?",
			u.Tagline, u.Cover, u.Location, u.AvailFor, u.About, u.Website, u.Twitter, u.Github, u.Zhihu, u.Weibo, u.Facebook, u.Stackoverflow, now, u.ID)
	}

	if err != nil {
		logger.Warn("update user profile error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	//update user skills
	err = tags.UpdateTargetTags("", u.ID, u.Skills, u.Created, "")
	if err != nil {
		logger.Warn("upate tags error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func NameExist(name string) (bool, *e.Error) {
	var username string
	err := db.Conn.QueryRow("SELECT username FROM user  WHERE username=?", name).Scan(&username)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("check name exist  error", "error", err)
		return false, e.New(http.StatusInternalServerError, e.Internal)
	}

	if err == sql.ErrNoRows {
		return false, nil
	}

	return true, nil
}

func EmailExist(email string) (bool, *e.Error) {
	var ne string
	err := db.Conn.QueryRow("SELECT email FROM user  WHERE email=?", email).Scan(&ne)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("check email exist  error", "error", err)
		return false, e.New(http.StatusInternalServerError, e.Internal)
	}

	if err == sql.ErrNoRows {
		return false, nil
	}

	return true, nil
}

func GetEmailByCode(code string) (string, *e.Error) {
	var email string
	err := db.Conn.QueryRow("SELECT mail FROM mail_code  WHERE code=?", code).Scan(&email)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("check email exist  error", "error", err)
		return "", e.New(http.StatusInternalServerError, e.Internal)
	}

	if err == sql.ErrNoRows {
		return "", nil
	}

	return email, nil
}

func SubmitUser(user *models.User) *e.Error {
	if user.Nickname == "" {
		user.Nickname = "New user"
	}

	var err error
	now := time.Now()
	if user.ID == "" {
		nameExist, err0 := NameExist(user.Username)
		if err0 != nil {
			return e.New(err0.Status, err0.Message)
		}

		if nameExist {
			return e.New(http.StatusConflict, "username已存在")
		}

		// create user
		emailExist, err0 := EmailExist(user.Email)
		if err0 != nil {
			return e.New(err0.Status, err0.Message)
		}

		if emailExist {
			return e.New(http.StatusConflict, "邮箱地址已存在")
		}

		user.ID = utils.GenID(models.IDTypeUser)
		_, err = db.Conn.Exec("INSERT INTO user (id,type,email,username,nickname,role,created,updated) VALUES (?,?,?,?,?,?,?,?)",
			user.ID, models.IDTypeUser, user.Email, user.Username, user.Nickname, user.Role, now, now)
	} else {
		// update user
		_, err = db.Conn.Exec("UPDATE user SET role=?,updated=? WHERE id=?", user.Role, now, user.ID)
	}

	if err != nil {
		logger.Warn("submit user  error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func Register(c *gin.Context, code string, nickname string, username string) {
	email, err0 := GetEmailByCode(code)
	if err0 != nil {
		c.JSON(err0.Status, common.RespError(err0.Message))
		return
	}

	user := &models.User{Nickname: nickname, Username: username, Email: email}
	err0 = SubmitUser(user)
	if err0 != nil {
		c.JSON(err0.Status, common.RespError(err0.Message))
		return
	}

	user.Query("", "", user.Email)
	// 从mail_code中，删除code
	db.Conn.Exec("DELETE FROM mail_code WHERE code=?", code)
	login(user, c)
}
