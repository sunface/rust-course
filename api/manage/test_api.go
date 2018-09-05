package manage

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/mafanr/g"
	"github.com/sunface/talent"
	"go.uber.org/zap"
)

type TestApi struct {
	ID         int    `json:"id" db:"id"`
	ApiID      string `json:"api_id" db:"api_id"`
	Params     string `json:"params" db:"params"`
	ModifyDate string `json:"modify_date" db:"modify_date"`
}

/* API调试模块 */
func (m *Manage) APIQueryParam(c echo.Context) error {
	apiID := talent.FormValue(c, "api_id")
	if apiID == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	query := fmt.Sprintf("select params from test_api where api_id='%s'", apiID)
	rows, err := g.DB.Query(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	var params string
	rows.Next()
	rows.Scan(&params)

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   params,
	})
}

func (m *Manage) APISaveParam(c echo.Context) error {
	apiID := talent.FormValue(c, "api_id")
	params := talent.FormValue(c, "params")
	if apiID == "" || params == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	// 判断是否已经存在，若存在则更新
	var temp interface{}
	exist := false
	query := fmt.Sprintf("select id from test_api where api_id='%s'", apiID)
	err := g.DB.Get(&temp, query)
	if err == nil {
		exist = true
	}

	if !exist {
		query = fmt.Sprintf("insert into test_api (api_id,params) values ('%s','%s')", apiID, params)

	} else {
		query = fmt.Sprintf("update test_api set params='%s' where api_id='%s'", params, apiID)
	}

	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
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
