package strategy

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/mafanr/juz/api/manage/audit"
	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"github.com/labstack/echo"
	"github.com/sunface/talent"
	"go.uber.org/zap"
)

func parse(c echo.Context) (*misc.Strategy, int, string) {
	str := c.FormValue("strategy")
	if str == "" {
		return nil, g.ParamEmptyC, g.ParamEmptyE
	}

	st := &misc.Strategy{}
	err := json.Unmarshal([]byte(str), &st)
	if err != nil {
		return nil, g.ParamInvalidC, g.ParamInvalidE
	}

	if st.Name == "" || st.Service == "" {
		return nil, g.ParamInvalidC, g.ParamInvalidE
	}
	return st, 0, ""
}

func Create(c echo.Context) error {
	st, ecode, emsg := parse(c)
	if ecode != 0 {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: ecode,
			Message: emsg,
		})
	}

	if !canOperate(c, st.Service) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	query := fmt.Sprintf("insert into strategy (name,service,type,sub_type,content,create_date) values ('%s','%s','%d','%d','%s','%s')",
		st.Name, st.Service, st.Type, st.SubType, st.Content, talent.Time2StringSecond(time.Now()))
	res, err := g.DB.Exec(query)
	if err != nil {
		if strings.Contains(err.Error(), g.DUP_KEY_ERR) {
			return c.JSON(http.StatusConflict, g.Result{
				Status:  http.StatusConflict,
				ErrCode: g.AlreadyExistC,
				Message: "Strategy name already exist",
			})
		}
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	id, _ := res.LastInsertId()
	audit.Log(c.FormValue("username"), st.Service, audit.TypeStrategy, fmt.Sprintf("%d:%s", id, st.Name), audit.OpCreate, c.FormValue("strategy"), "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func Update(c echo.Context) error {
	st, ecode, emsg := parse(c)
	if ecode != 0 {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: ecode,
			Message: emsg,
		})
	}

	if !canOperate(c, st.Service) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	query := fmt.Sprintf("update strategy set name='%s',sub_type='%d',content='%s' where id ='%d'",
		st.Name, st.SubType, st.Content, st.ID)
	_, err := g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	audit.Log(c.FormValue("username"), st.Service, audit.TypeStrategy, fmt.Sprintf("%d:%s", st.ID, st.Name), audit.OpEdit, c.FormValue("strategy"), "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func Load(c echo.Context) error {
	service := c.FormValue("service")
	tp := c.FormValue("type")
	if service == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	ss := make([]*misc.Strategy, 0)
	var query string
	if tp == "0" {
		query = fmt.Sprintf("select * from strategy where service ='%s' order by modify_date desc", service)
	} else {
		query = fmt.Sprintf("select * from strategy where service ='%s' and type='%s' order by modify_date desc", service, tp)
	}

	err := g.DB.Select(&ss, query)
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
		Data:   ss,
	})
}

func Delete(c echo.Context) error {
	service := c.FormValue("service")
	id := c.FormValue("id")
	name := c.FormValue("name")
	tp, _ := strconv.Atoi(c.FormValue("type"))
	if service == "" || id == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	if !canOperate(c, service) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	var query string
	switch tp {
	case misc.STRATEGY_BWLIST:
		query = fmt.Sprintf("update api_define set bw_strategy='%d' where bw_strategy='%s'", 0, id)
	case misc.STRATEGY_RETRY:
		query = fmt.Sprintf("update api_define set retry_strategy='%d' where retry_strategy='%s'", 0, id)
	case misc.STRATEGY_TRAFFIC:
		query = fmt.Sprintf("update api_define set traffic_strategy='%d' where traffic_strategy='%s'", 0, id)
	default:
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}
	_, err := g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	switch tp {
	case misc.STRATEGY_BWLIST:
		query = fmt.Sprintf("update api_release set bw_strategy='%d' where bw_strategy='%s'", 0, id)
	case misc.STRATEGY_RETRY:
		query = fmt.Sprintf("update api_release set retry_strategy='%d' where retry_strategy='%s'", 0, id)
	case misc.STRATEGY_TRAFFIC:
		query = fmt.Sprintf("update api_release set traffic_strategy='%d' where traffic_strategy='%s'", 0, id)
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

	query = fmt.Sprintf("delete from strategy where id='%s'", id)
	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	audit.Log(c.FormValue("username"), service, audit.TypeStrategy, fmt.Sprintf("%s:%s", id, name), audit.OpDelete, "", "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func Change(c echo.Context) error {
	status, _ := strconv.Atoi(c.FormValue("status"))
	id := c.FormValue("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	newS := 0
	op := 0
	switch status {
	case misc.STRATEGY_ON:
		newS = misc.STRATEGY_OFF
		op = audit.OpOffline
	case misc.STRATEGY_OFF:
		newS = misc.STRATEGY_ON
		op = audit.OpRelease
	default:
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}

	query := fmt.Sprintf("update strategy set status='%d' where id='%s'", newS, id)
	_, err := g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	// 查询发布的strategy内容
	s := misc.Strategy{}
	g.DB.Get(&s, fmt.Sprintf("select * from strategy where id='%s'", id))
	d, _ := json.Marshal(s)
	audit.Log(c.FormValue("username"), s.Service, audit.TypeStrategy, fmt.Sprintf("%s:%s", id, s.Name), op, talent.Bytes2String(d), "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func Query(c echo.Context) error {
	id := c.FormValue("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	s := misc.Strategy{}
	g.DB.Get(&s, fmt.Sprintf("select * from strategy where id='%s'", id))

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   s,
	})
}

func canOperate(c echo.Context, service string) bool {
	role := c.FormValue("app_priv")
	userID := c.FormValue("username")

	if role == g.ROLE_NORMAL {
		// 验证是否是service创建者
		var temp interface{}
		query := fmt.Sprintf("select id from service where name ='%s' and creator='%s'", service, userID)
		err := g.DB.Get(&temp, query)
		if err == nil {
			// 是创建者
			return true
		}

		// 验证是否是管理员
		query = fmt.Sprintf("select privilege from privilege where user_id='%s' and service='%s'", userID, service)
		rows, err := g.DB.Query(query)
		if !rows.Next() {
			// 不存在该用户的权限
			return false
		}

		var priv int
		rows.Scan(&priv)
		if priv == misc.PRIVILEGE_ADMIN {
			// 是管理员
			return true
		}

		return false
	} else { //是应用级别的管理员
		return true
	}
}
