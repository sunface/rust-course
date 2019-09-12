package user

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/labstack/echo"
	"go.uber.org/zap"

	"github.com/thinkindev/im.dev/internal/ecode"
	"github.com/thinkindev/im.dev/internal/misc"
	"github.com/thinkindev/im.dev/internal/utils"
	"github.com/thinkindev/im.dev/internal/utils/validate"
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

// Card returns user detail card info
func Card(c echo.Context) error {
	uid := c.FormValue("uid")
	if uid == "" {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	user := &User{}
	q := misc.CQL.Query(`SELECT name,nickname,avatar,website,about,location,bg_color,text_color,looking_for_work,education,employer,
	create_date FROM user WHERE id=?`, uid)
	err := q.Scan(&user.Name, &user.NickName,
		&user.Avatar, &user.Website, &user.About, &user.Location, &user.BgColor, &user.TextColor, &user.LookingForWork,
		&user.Education, &user.Employer, &user.createDate)

	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return c.JSON(http.StatusNotFound, misc.HTTPResp{
				ErrCode: ecode.NotFound,
				Message: ecode.NotFoundMsg,
			})
		}
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	user.CreateDate = utils.Time2ReadableString(time.Unix(user.createDate, 0))
	if user.BgColor == "" {
		user.BgColor = "#000"
	}
	if user.TextColor == "" {
		user.TextColor = "#000"
	}
	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: user,
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

// User holds all info of one user
type User struct {
	//----account-----
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email,omitempty"`
	//----profile-----
	NickName       string `json:"nickname"`
	Avatar         string `json:"avatar"`
	Website        string `json:"website"`
	About          string `json:"about"`
	Location       string `json:"location"`
	BgColor        string `json:"bg_color"`
	TextColor      string `json:"text_color"`
	LookingForWork bool   `json:"lfw"`
	Education      string `json:"education"`
	Employer       string `json:"employer"`
	Skills         string `json:"skills"`
	AvailableFor   string `json:"available_for"`
	WorkingExp     string `json:"working_exp"`

	CreateDate string `json:"create_date"`
	EditDate   string `json:"edit_date"`

	createDate int64
	editDate   int64
}

// Profile return user's detail profile
func Profile(c echo.Context) error {
	sess := GetSession(c)
	user := &User{}
	q := misc.CQL.Query(`SELECT id,name,email,nickname,avatar,website,about,location,bg_color,text_color,looking_for_work,education,employer,skills,
	available_for,working_exp,create_date,edit_date FROM user WHERE id=?`, sess.ID)
	err := q.Scan(&user.ID, &user.Name, &user.Email, &user.NickName,
		&user.Avatar, &user.Website, &user.About, &user.Location, &user.BgColor, &user.TextColor, &user.LookingForWork,
		&user.Education, &user.Employer, &user.Skills, &user.AvailableFor, &user.WorkingExp, &user.createDate, &user.editDate)

	if err != nil {
		if err.Error() == misc.CQLNotFound {
			return c.JSON(http.StatusNotFound, misc.HTTPResp{
				ErrCode: ecode.NotFound,
				Message: ecode.NotFoundMsg,
			})
		}
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	user.CreateDate = utils.Time2ReadableString(time.Unix(user.createDate, 0))
	if user.BgColor == "" {
		user.BgColor = "#000"
	}
	if user.TextColor == "" {
		user.TextColor = "#000"
	}
	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: user,
	})
}

// SetProfile set user profile
func SetProfile(c echo.Context) error {
	u := c.FormValue("user")
	user := &User{}
	err := json.Unmarshal([]byte(u), &user)
	if err != nil {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: ecode.ParamInvalidMsg,
		})
	}

	err = validateProfile(user)

	sess := GetSession(c)
	q := misc.CQL.Query(`UPDATE user SET nickname=?,avatar=?,website=?,about=?,location=?,bg_color=?,
	text_color=?,looking_for_work=?,education=?,employer=?,skills=?,available_for=?,working_exp=?,edit_date=? WHERE id=?`, user.NickName,
		user.Avatar, user.Website, user.About, user.Location, user.BgColor, user.TextColor, user.LookingForWork, user.Education, user.Employer,
		user.Skills, user.AvailableFor, user.WorkingExp, time.Now().Unix(), sess.ID)
	err = q.Exec()
	if err != nil {
		misc.Log.Warn("access database error", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, misc.HTTPResp{
			ErrCode: ecode.DatabaseError,
			Message: ecode.CommonErrorMsg,
		})
	}

	if err != nil {
		return c.JSON(http.StatusBadRequest, misc.HTTPResp{
			ErrCode: ecode.ParamInvalid,
			Message: err.Error(),
		})
	}

	return c.JSON(http.StatusOK, misc.HTTPResp{})
}

func validateProfile(user *User) error {
	user.NickName = misc.Sanitizer.Sanitize(strings.TrimSpace(user.NickName))
	if utf8.RuneCountInString(user.NickName) > 30 {
		return errors.New("Display name too long")
	}

	user.About = misc.Sanitizer.Sanitize(strings.TrimSpace(user.About))
	if utf8.RuneCountInString(user.About) > 500 {
		return errors.New("About too long")
	}

	user.Website = misc.Sanitizer.Sanitize(strings.TrimSpace(user.Website))
	if utf8.RuneCountInString(user.Website) > 30 || !validate.IsURL(user.Website) {
		return errors.New("Website invalid or too long")
	}

	user.Location = misc.Sanitizer.Sanitize(strings.TrimSpace(user.Location))
	if utf8.RuneCountInString(user.Location) > 30 {
		return errors.New("About too long")
	}

	user.BgColor = strings.TrimSpace(user.BgColor)
	if !validate.IsColor(user.BgColor) {
		return errors.New("Invalid background color")
	}

	user.TextColor = strings.TrimSpace(user.TextColor)
	if !validate.IsColor(user.TextColor) {
		return errors.New("Invalid text color")
	}

	user.Education = misc.Sanitizer.Sanitize(strings.TrimSpace(user.Education))
	if utf8.RuneCountInString(user.Education) > 500 {
		return errors.New("Education too long")
	}

	user.Employer = misc.Sanitizer.Sanitize(strings.TrimSpace(user.Employer))
	if utf8.RuneCountInString(user.Employer) > 500 {
		return errors.New("Employer too long")
	}

	user.Skills = misc.Sanitizer.Sanitize(strings.TrimSpace(user.Skills))
	if utf8.RuneCountInString(user.Skills) > 500 {
		return errors.New("Skills too long")
	}

	user.AvailableFor = misc.Sanitizer.Sanitize(strings.TrimSpace(user.AvailableFor))
	if utf8.RuneCountInString(user.Employer) > 500 {
		return errors.New("Available for too long")
	}

	user.WorkingExp = misc.Sanitizer.Sanitize(strings.TrimSpace(user.WorkingExp))
	if utf8.RuneCountInString(user.Employer) > 500 {
		return errors.New("Working experience too long")
	}

	return nil
}
