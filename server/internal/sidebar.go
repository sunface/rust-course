package internal

import (
	"net/http"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

func SubmitSidebar(c *gin.Context) {
	side := &models.Sidebar{}
	c.Bind(&side)
	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	var err error
	if side.ID == 0 {
		_, err = db.Conn.Exec("INSERT INTO home_sidebar (tag_name,sort,display_count,weight) VALUES (?,?,?,?)",
			side.TagName, side.Sort, side.DisplayCount, side.Weight)
	} else {
		_, err = db.Conn.Exec("UPDATE home_sidebar SET tag_name=?,sort=?,display_count=?,weight=? WHERE id=?", side.TagName, side.Sort, side.DisplayCount, side.Weight, side.ID)
	}

	if err != nil {
		logger.Warn("submit  sidebar error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetSidebars(c *gin.Context) {
	navbars := make(models.Sidebars, 0)

	rows, err := db.Conn.Query("SELECT id,tag_name,sort,display_count,weight FROM home_sidebar")
	if err != nil {
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	for rows.Next() {
		nv := &models.Sidebar{}
		rows.Scan(&nv.ID, &nv.TagName, &nv.Sort, &nv.DisplayCount, &nv.Weight)
		navbars = append(navbars, nv)
	}

	sort.Sort(navbars)

	c.JSON(http.StatusOK, common.RespSuccess(navbars))
}
