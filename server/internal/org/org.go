package org

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

var logger = log.RootLogger.New("logger", "org")

func GetOrgByUserID(userID string) ([]*models.User, *e.Error) {
	orgs := make([]*models.User, 0)

	rows, err := db.Conn.Query("SELECT org_id,role FROM org_member WHERE user_id=?", userID)
	if err != nil {
		logger.Warn("get user orgs  error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	for rows.Next() {
		var oid, role string
		rows.Scan(&oid, &role)

		org, ok := models.UsersMapCache[oid]
		if ok {
			org.Role = models.RoleType(role)
			orgs = append(orgs, org)
		}
	}

	return orgs, nil
}

func Create(o *models.User, userID string) *e.Error {
	o.ID = utils.GenID(models.IDTypeOrg)

	tx, err := db.Conn.Begin()
	if err != nil {
		logger.Warn("start sql transaction error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	now := time.Now()
	_, err = tx.Exec("INSERT INTO user (id,type,username,nickname,created,updated) VALUES (?,?,?,?,?,?)", o.ID, models.IDTypeOrg, o.Username, o.Nickname, now, now)
	if err != nil {
		logger.Warn("add org error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	_, err = tx.Exec("INSERT INTO org_member (org_id,user_id,role,created) VALUES (?,?,?,?)", o.ID, userID, models.ROLE_SUPER_ADMIN, now)
	if err != nil {
		logger.Warn("add org member error", "error", err)
		tx.Rollback()
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	tx.Commit()

	return nil
}

func GetMembers(user *models.User, orgID string) ([]*models.User, *e.Error) {
	rows, err := db.Conn.Query("SELECT user_id,role from org_member where org_id=?", orgID)
	if err != nil {
		logger.Warn("get org members error", "error", err)
		return nil, e.New(http.StatusInternalServerError, e.Internal)
	}

	users := make([]*models.User, 0)
	for rows.Next() {
		var id, role string
		rows.Scan(&id, &role)

		u, ok := models.UsersMapCache[id]
		if ok {
			if user != nil {
				u.Followed = interaction.GetFollowed(u.ID, user.ID)
				u.Follows = interaction.GetFollows(u.ID)
			}
			u.Role = models.RoleType(role)
			users = append(users, u)
		}
	}

	return users, nil
}

func GetMemberCount(orgID string) int {
	var count int
	err := db.Conn.QueryRow("SELECT count(*) FROM org_member WHERE org_id=?", orgID).Scan(&count)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("get org member count error", "error", err)
	}

	return count
}

func IsOrgAdmin(userID string, orgID string) bool {
	var role models.RoleType
	err := db.Conn.QueryRow("SELECT role FROM org_member WHERE org_id=? and user_id=?", orgID, userID).Scan(&role)
	if err != nil {
		logger.Warn("check is org admin error", "error", err)
		return false
	}

	return role.IsAdmin()
}

func UserInOrg(userID string, orgID string) bool {
	var role models.RoleType
	err := db.Conn.QueryRow("SELECT role FROM org_member WHERE org_id=? and user_id=?", orgID, userID).Scan(&role)
	if err != nil && err != sql.ErrNoRows {
		logger.Warn("check is org admin error", "error", err)
		return false
	}

	if err == sql.ErrNoRows {
		return false
	}

	return true
}

func Join(secret string, userID string) *e.Error {
	var orgID string
	err := db.Conn.QueryRow("SELECT user_id FROM user_secret WHERE secret=?", secret).Scan(&orgID)
	if err != nil {
		if err == sql.ErrNoRows {
			return e.New(http.StatusNotFound, "无效的secret")
		}
		logger.Warn("join org error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	if !models.IdExist(orgID) {
		return e.New(http.StatusNotFound, "组织不存在")
	}

	_, err = db.Conn.Exec("INSERT INTO org_member (org_id,user_id,role,created) VALUES (?,?,?,?)", orgID, userID, models.ROLE_NORMAL, time.Now())
	if err != nil {
		logger.Warn("join org error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func UpdateMember(orgID, memberID string, role models.RoleType) *e.Error {
	_, err := db.Conn.Exec("UPDATE org_member SET role=? WHERE org_id=? and user_id=?", role, orgID, memberID)
	if err != nil {
		logger.Warn("update org member error", "error", err)
		return e.New(http.StatusInternalServerError, e.Internal)
	}

	return nil
}

func GetMemberRole(orgID string, memberID string) (models.RoleType, error) {
	var role models.RoleType
	err := db.Conn.QueryRow("SELECT role FROM org_member WHERE org_id=? and user_id=?", orgID, memberID).Scan(&role)
	if err != nil {
		return role, err
	}

	return role, nil
}
