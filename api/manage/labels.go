package manage

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/mafanr/g"

	"github.com/labstack/echo"
	"go.uber.org/zap"
)

func (m *Manage) QueryLabels(c echo.Context) error {
	service := c.FormValue("service")
	if service == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	query := fmt.Sprintf("select name from labels where service='%s'", service)
	rows, err := g.DB.Query(query)
	if err != nil {
		g.L.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	labels := make([]string, 0)
	for rows.Next() {
		var l string
		rows.Scan(&l)
		labels = append(labels, l)
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   labels,
	})
}

func (m *Manage) CreateLabel(c echo.Context) error {
	service := c.FormValue("service")
	name := c.FormValue("name")
	if service == "" || name == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	query := fmt.Sprintf("insert into labels (service,name) values ('%s','%s')", service, name)
	_, err := g.DB.Exec(query)
	if err != nil {
		if strings.Contains(err.Error(), g.DUP_KEY_ERR) {
			return c.JSON(http.StatusConflict, g.Result{
				Status:  http.StatusConflict,
				ErrCode: g.AlreadyExistC,
				Message: g.AlreadyExistE,
			})
		}
		g.L.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}
