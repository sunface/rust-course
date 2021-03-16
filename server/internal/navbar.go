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

func GetNavbars(c *gin.Context) {
	navbars := make(models.Navbars, 0)

	rows, err := db.Conn.Query("SELECT id,label,value,weight FROM navbar")
	if err != nil {
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	for rows.Next() {
		nv := &models.Navbar{}
		rows.Scan(&nv.ID, &nv.Label, &nv.Value, &nv.Weight)
		navbars = append(navbars, nv)
	}

	sort.Sort(navbars)

	c.JSON(http.StatusOK, common.RespSuccess(navbars))
}

func SubmitNavbar(c *gin.Context) {
	nav := &models.Navbar{}
	c.Bind(&nav)

	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	var err error
	if nav.ID == 0 {
		_, err = db.Conn.Exec("INSERT INTO navbar (label,value,weight) VALUES (?,?,?)",
			nav.Label, nav.Value, nav.Weight)
	} else {
		_, err = db.Conn.Exec("UPDATE navbar SET label=?,value=?,weight=? WHERE id=?", nav.Label, nav.Value, nav.Weight, nav.ID)
	}

	if err != nil {
		logger.Warn("submit  navbar error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func DeleteNavbar(c *gin.Context) {
	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	id := c.Param("id")
	_, err := db.Conn.Exec("DELETE FROM navbar WHERE id=?", id)
	if err != nil {
		logger.Warn("delete navbar error", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError(e.Internal))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))

}
