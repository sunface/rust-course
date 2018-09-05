package manage

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
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

/*---------------------API相关-----------------------------*/
func (m *Manage) QueryAPI(c echo.Context) error {
	service := talent.FormValue(c, "service")
	q := talent.FormValue(c, "q")
	pageS := talent.FormValue(c, "page")
	if service == "" || pageS == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	page, _ := strconv.Atoi(pageS)
	if page <= 0 {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}
	role := talent.FormValue(c, "app_priv")
	if !m.canView(role) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	apis := make([]*misc.API, 0)
	var query string
	if q == "" {
		query = fmt.Sprintf("select * from api_define where service='%s' order by modify_date desc limit %d offset %d", service, g.PER_PAGE, g.PER_PAGE*(page-1))
	} else {
		query = fmt.Sprintf("select * from api_define where service='%s' and ", service) + "api_id like '%" + q + "%' " + fmt.Sprintf(" order by modify_date desc limit %d offset %d", g.PER_PAGE, g.PER_PAGE*(page-1))
	}

	err := g.DB.Select(&apis, query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	for _, api := range apis {
		if api.ParamTable != nil {
			d, _ := g.B64.DecodeString(*api.ParamTable)
			d1 := talent.Bytes2String(d)
			api.ParamTable = &d1
		}
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   apis,
	})
}

func (m *Manage) CountAPI(c echo.Context) error {
	service := talent.FormValue(c, "service")
	q := talent.FormValue(c, "q")
	if service == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	var query string
	if q == "" {
		query = fmt.Sprintf("select count(1) from api_release where service='%s'", service)
	} else {
		query = fmt.Sprintf("select count(1) from api_release where service='%s' and api_id like '%%", service) + q + "%'"
	}

	rows, err := g.DB.Query(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	var total int
	rows.Next()
	rows.Scan(&total)

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   total,
	})
}

func (m *Manage) DefineAPI(c echo.Context) error {
	api, ecode, emsg := m.parseAPI(c)
	if ecode != 0 {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: ecode,
			Message: emsg,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	action := talent.FormValue(c, "action")
	now := time.Now()
	date := talent.Time2StringSecond(now)

	pr := g.B64.EncodeToString(talent.String2Bytes(*api.ParamTable))
	if action == "create" {
		query := fmt.Sprintf(`insert into api_define (api_id,path_type,service,description,route_type,backend_addr,backend_type,bw_strategy,retry_strategy,traffic_strategy,mock_data,traffic_on,traffic_api,traffic_ratio,traffic_ips,verify_on,param_rules,cached_time,revise_version,create_date,app,addr_type,backend_uri) 
		values ('%s','%d','%s','%s','%d','%s','%d','%d','%d','%d','%s','%d','%s','%d','%s','%d','%s','%d','%s', '%s','%s','%d','%s')`,
			api.APIID, api.PathType, api.Service, *api.Desc, api.RouteType, api.BackendAddr, api.BackendType, api.BwStrategy, api.RetryStrategy, api.TrafficStrategy, *api.MockData, api.TrafficOn, api.TrafficAPI, api.TrafficRatio, api.TrafficIPs, api.VerifyOn, pr, api.CachedTime, talent.Time2Version(now), date, api.App, api.AddrType, api.BackendURI)
		_, err := g.DB.Exec(query)
		if err != nil {
			if strings.Contains(err.Error(), g.DUP_KEY_ERR) {
				return c.JSON(http.StatusConflict, g.Result{
					Status:  http.StatusConflict,
					ErrCode: g.AlreadyExistC,
					Message: g.AlreadyExistE,
				})
			}
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}
		// 初始化api发布表，并设置为未发布状态
		// 这里把不能再修改的值进行初始化
		query = fmt.Sprintf(`insert into api_release (api_id,path_type,service,backend_addr,status,create_date) values ('%s','%d','%s','%s','%d','%s')`,
			api.APIID, api.PathType, api.Service, api.BackendAddr, misc.API_OFFLINE, date)
		_, err = g.DB.Exec(query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}
		audit.Log(c.FormValue("username"), api.Service, audit.TypeApi, api.APIID, audit.OpCreate, c.FormValue("api"), "")
	} else {
		query := fmt.Sprintf("update api_define set description='%s',route_type='%d',backend_addr='%s',backend_type='%d',bw_strategy='%d',retry_strategy='%d',traffic_strategy='%d',mock_data='%s',traffic_on='%d',traffic_api='%s',traffic_ratio='%d',traffic_ips='%s',verify_on='%d',param_rules='%s',cached_time='%d',app='%s',addr_type='%d',backend_uri='%s' where api_id='%s'",
			*api.Desc, api.RouteType, api.BackendAddr, api.BackendType, api.BwStrategy, api.RetryStrategy, api.TrafficStrategy, *api.MockData, api.TrafficOn, api.TrafficAPI, api.TrafficRatio, api.TrafficIPs, api.VerifyOn, pr, api.CachedTime, api.App, api.AddrType, api.BackendURI, api.APIID)
		res, err := g.DB.Exec(query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}

		n, _ := res.RowsAffected()
		if n == 0 {
			return c.JSON(http.StatusOK, g.Result{
				Status:  http.StatusOK,
				ErrCode: g.NoUpdateHappenedC,
				Message: g.NoUpdateHappenedE,
			})
		}

		query = fmt.Sprintf("update api_define set revise_version='%s' where api_id='%s'", talent.Time2Version(now), api.APIID)
		g.DB.Exec(query)
		audit.Log(c.FormValue("username"), api.Service, audit.TypeApi, api.APIID, audit.OpEdit, c.FormValue("api"), "")
	}

	// 查询并返回最新的api
	api1 := misc.API{}
	g.DB.Get(&api1, fmt.Sprintf("select * from api_define where api_id='%s'", api.APIID))

	if api1.ParamTable != nil {
		d, _ := g.B64.DecodeString(*api1.ParamTable)
		d1 := talent.Bytes2String(d)
		api1.ParamTable = &d1
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
		Data:   api1,
	})
}

// API下线10分钟后，方可删除
func (m *Manage) DeleteAPI(c echo.Context) error {
	service := talent.FormValue(c, "service")
	apiID := talent.FormValue(c, "api_id")
	userID := talent.FormValue(c, "username")
	if apiID == "" || userID == "" || service == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	// 查询API的发布状态，只有下线10分钟后，才能删除
	query := fmt.Sprintf("select status,modify_date from api_release where api_id='%s'", apiID)
	rows, err := g.DB.Query(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	if !rows.Next() {
		return c.JSON(http.StatusNotFound, g.Result{
			Status:  http.StatusNotFound,
			ErrCode: APIOfflineC,
			Message: APIOfflineE,
		})
	}
	var status int
	var ud string
	rows.Scan(&status, &ud)
	// 已经发布的不能删除
	if status == misc.API_RELEASED {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: ApiStillReleasedC,
			Message: ApiStillReleasedE,
		})
	}

	// 下线不到30秒，不能删除
	t, _ := talent.StringToTime(ud)
	if time.Now().Sub(t) < 30*time.Second {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: ApiInactiveNotLongEnoughC,
			Message: ApiInactiveNotLongEnoughE,
		})
	}

	// 将api发布表的状态设置为已删除
	query = fmt.Sprintf("delete from api_release where api_id='%s'", apiID)
	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	// 查询api定义,为了记录审计日志
	api := misc.API{}
	query = fmt.Sprintf("select * from api_define where api_id='%s'", apiID)
	err = g.DB.Get(&api, query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
	}
	if api.ParamTable != nil {
		d, _ := g.B64.DecodeString(*api.ParamTable)
		d1 := talent.Bytes2String(d)
		api.ParamTable = &d1
	}

	b, _ := json.Marshal(api)

	// 从api定义表删除
	query = fmt.Sprintf("delete from api_define where api_id='%s'", apiID)
	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	audit.Log(userID, service, audit.TypeApi, apiID, audit.OpDelete, talent.Bytes2String(b), "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func (m *Manage) parseAPI(c echo.Context) (*misc.API, int, string) {
	apiR := c.FormValue("api")

	api := &misc.API{}
	err := json.Unmarshal([]byte(apiR), &api)
	if err != nil {
		g.Info("parse api", zap.Error(err), zap.String("api", string(apiR)))
		return nil, g.ParamInvalidC, g.ParamInvalidE
	}

	if api.Service == "" {
		return nil, ServiceEmptyC, ServiceEmptyE
	}

	if api.PathType != misc.OFF && api.PathType != misc.ON {
		return nil, ApiPathTypeInvalidC, ApiPathTypeInvalidE
	}

	if api.PathType == misc.OFF {
		// 非路径格式，api名组成形式
		if !talent.OnlyAlphaNumAndDot(api.APIID) {
			return nil, ApiOnlyAlphaNumAndDotC, ApiOnlyAlphaNumAndDotE
		}
		// 检查api id的前缀
		if !strings.HasPrefix(api.APIID, api.Service+".") {
			return nil, ApiWithServicePrefixC, ApiWithServicePrefixE
		}
	} else {
		// @todo,检查路径形式的参数是否合法，/a/b/c
		//路径不能为保留的
		if !talent.OnlyAlphaNumAndUri(api.APIID) {
			return nil, ApiOnlyAlphaNumAndUriC, ApiOnlyAlphaNumAndUriE
		}

		name := api.APIID[:len(api.APIID)-3]
		if name == "/service/api" || name == "/notify" {
			return nil, ApiReservePathC, ApiReservePathE
		}
	}

	// 检查api id的后缀
	if api.APIID[len(api.APIID)-2] != 'v' || api.APIID[len(api.APIID)-3] != '.' {
		return nil, ApiWithServiceSuffixC, ApiWithServiceSuffixE
	}

	if api.BackendAddr == "" {
		return nil, BackendAddrEmptyC, BackendAddrEmptyE
	}

	if api.AddrType == misc.ADDR_URL {
		if strings.TrimSpace(api.BackendAddr) == "http://" || strings.TrimSpace(api.BackendAddr) == "https://" {
			return nil, BackendAddrEmptyC, BackendAddrEmptyE
		}

		if !strings.HasPrefix(api.BackendAddr, "http") {
			return nil, BackendAddrWithHTTPPrefixC, BackendAddrWithHTTPPrefixE
		}
	} else {
		if !talent.OnlyAlphaNumAndUri(api.BackendURI) {
			return nil, UriAlphaNumAndUriC, UriAlphaNumAndUriE
		}
	}

	if (api.BackendType != 1) && (api.BackendType != 2) {
		return nil, BackendTypeInvalidC, BackendTypeInvalidE
	}

	if api.TrafficAPI != "" {
		_, ok := misc.Apis.Load(api.TrafficAPI)
		if !ok {
			return nil, ApiNotExistC, ApiNotExistE
		}
	}

	if api.TrafficRatio < 0 || api.TrafficRatio > 100 {
		return nil, TrafficRatioInvalidC, TrafficRatioInvalidE
	}

	if (api.TrafficOn != 0) && (api.TrafficOn != 1) {
		api.TrafficOn = 0
	}

	if (api.VerifyOn != 0) && (api.VerifyOn != 1) {
		api.VerifyOn = 0
	}

	if (api.CachedTime < 0) || (api.CachedTime > 30) {
		api.CachedTime = 0
	}

	return api, 0, ""
}

func (m *Manage) APIRelease(c echo.Context) error {
	apiID := c.FormValue("api_id")
	userID := c.FormValue("username")

	if apiID == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	// 查询最新的api定义
	api := misc.API{}
	query := fmt.Sprintf("select * from api_define where api_id='%s'", apiID)
	err := g.DB.Get(&api, query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	// 更新release
	query = fmt.Sprintf("update api_release set description='%s',route_type='%d',backend_addr='%s',backend_type='%d',mock_data='%s',retry_strategy='%d',bw_strategy='%d',traffic_strategy='%d',traffic_on='%d',traffic_api='%s',traffic_ratio='%d',traffic_ips='%s',verify_on='%d',param_rules='%s', cached_time='%d',status='%d',app='%s',addr_type='%d',backend_uri='%s' where api_id='%s'",
		*api.Desc, api.RouteType, api.BackendAddr, api.BackendType, *api.MockData, api.RetryStrategy, api.BwStrategy, api.TrafficStrategy, api.TrafficOn, api.TrafficAPI, api.TrafficRatio, api.TrafficIPs, api.VerifyOn, *api.ParamTable, api.CachedTime, misc.API_RELEASED, api.App, api.AddrType, api.BackendURI, api.APIID)

	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	query = fmt.Sprintf("update api_define set release_version='%s' where api_id='%s'", api.ReviseVersion, api.APIID)
	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	if api.ParamTable != nil {
		d, _ := g.B64.DecodeString(*api.ParamTable)
		d1 := talent.Bytes2String(d)
		api.ParamTable = &d1
	}
	b, _ := json.Marshal(api)
	audit.Log(userID, api.Service, audit.TypeApi, api.APIID, audit.OpRelease, talent.Bytes2String(b), "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func (m *Manage) APIOffline(c echo.Context) error {
	apiID := c.FormValue("api_id")
	userID := c.FormValue("username")

	if apiID == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	query := fmt.Sprintf("update api_release set status='%d' where api_id='%s'",
		misc.API_OFFLINE, apiID)
	_, err := g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	// 更新api_define表的发布时间
	query = fmt.Sprintf("update api_define set release_version='%s' where api_id='%s'", "", apiID)
	_, err = g.DB.Exec(query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
		return c.JSON(http.StatusInternalServerError, g.Result{
			Status:  http.StatusInternalServerError,
			ErrCode: g.DatabaseC,
			Message: g.DatabaseE,
		})
	}

	// 查询已发布的api定义
	api := misc.API{}
	query = fmt.Sprintf("select * from api_release where api_id='%s'", apiID)
	err = g.DB.Get(&api, query)
	if err != nil {
		g.Info("access database error", zap.Error(err), zap.String("query", query))
	}
	if api.ParamTable != nil {
		d, _ := g.B64.DecodeString(*api.ParamTable)
		d1 := talent.Bytes2String(d)
		api.ParamTable = &d1
	}

	b, _ := json.Marshal(api)
	audit.Log(userID, api.Service, audit.TypeApi, api.APIID, audit.OpOffline, talent.Bytes2String(b), "")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

// 请求参数验证
func (m *Manage) VerifyParamRule(c echo.Context) error {
	param := strings.TrimSpace(c.FormValue("param"))
	rule := strings.TrimSpace(c.FormValue("rule"))
	testData := strings.TrimSpace(c.FormValue("test_data"))
	if param == "" || rule == "" || testData == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	// 验证正则是否合法
	r, err := regexp.Compile(rule)
	if err != nil {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: InvalidVerifyTableC,
			Message: InvalidVerifyTableE,
		})
	}
	// 验证测试数据跟正则是否匹配
	if !r.Match([]byte(testData)) {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: InvalidVerifyRuleC,
			Message: InvalidVerifyRuleE,
		})
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

//批量设置策略
func (m *Manage) APIBatchStrategy(c echo.Context) error {
	apiIDS := strings.TrimSpace(c.FormValue("api_ids"))
	bw := strings.TrimSpace(c.FormValue("batch_bw"))
	retry := strings.TrimSpace(c.FormValue("batch_retry"))
	traffic := strings.TrimSpace(c.FormValue("batch_traffic"))
	service := c.FormValue("service")
	if apiIDS == "" || (bw == "" && retry == "" && traffic == "") || service == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	var apiIds []string
	err := json.Unmarshal([]byte(apiIDS), &apiIds)
	if err != nil {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	now := time.Now()
	for _, apiID := range apiIds {
		var query = "update api_define set"
		if bw != "" {
			query = fmt.Sprintf("%s bw_strategy='%s', ", query, bw)
		}
		if retry != "" {
			query = fmt.Sprintf("%s retry_strategy='%s', ", query, retry)
		}
		if traffic != "" {
			query = fmt.Sprintf("%s traffic_strategy='%s'", query, traffic)
		}

		query = fmt.Sprintf("%s  where api_id = '%s'", query, apiID)
		res, err := g.DB.Exec(query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}

		n, _ := res.RowsAffected()
		if n == 0 {
			continue
		}
		// 更新版本号
		query = fmt.Sprintf("update api_define set revise_version='%s' where api_id='%s'", talent.Time2Version(now), apiID)
		g.DB.Exec(query)
	}

	userID := c.FormValue("username")
	audit.Log(userID, service, audit.TypeBatch, fmt.Sprintf("bw: %s,retry: %s", bw, retry), audit.OpCreate, apiIDS, "批量添加策略")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

// 批量删除策略
func (m *Manage) APIBatchDelStrategy(c echo.Context) error {
	apiIDS := strings.TrimSpace(c.FormValue("api_ids"))
	service := c.FormValue("service")
	if apiIDS == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	var apiIds []string
	err := json.Unmarshal([]byte(apiIDS), &apiIds)
	if err != nil {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	tp, _ := strconv.Atoi(c.FormValue("type"))

	now := time.Now()
	for _, apiID := range apiIds {
		var query string
		switch tp {
		case misc.STRATEGY_BWLIST:
			query = fmt.Sprintf("update api_define set bw_strategy='%d' where api_id = '%s'", misc.STRATEGY_EMPTY, apiID)
		case misc.STRATEGY_RETRY:
			query = fmt.Sprintf("update api_define set retry_strategy='%d' where api_id = '%s'", misc.STRATEGY_EMPTY, apiID)
		case misc.STRATEGY_TRAFFIC:
			query = fmt.Sprintf("update api_define set traffic_strategy='%d' where api_id = '%s'", misc.STRATEGY_EMPTY, apiID)
		default:
			return c.JSON(http.StatusBadRequest, g.Result{
				Status:  http.StatusBadRequest,
				ErrCode: g.ParamInvalidC,
				Message: g.ParamInvalidE,
			})
		}

		res, err := g.DB.Exec(query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}

		n, _ := res.RowsAffected()
		if n == 0 {
			continue
		}
		// 更新版本号
		query = fmt.Sprintf("update api_define set revise_version='%s' where api_id='%s'", talent.Time2Version(now), apiID)
		g.DB.Exec(query)
	}

	userID := c.FormValue("username")
	var msg string
	switch tp {
	case misc.STRATEGY_BWLIST:
		msg = "White/Black List"
	case misc.STRATEGY_RETRY:
		msg = "Timeout/Retry"
	case misc.STRATEGY_TRAFFIC:
		msg = "Traffic Control"
	}
	audit.Log(userID, service, audit.TypeBatch, msg, audit.OpDelete, apiIDS, "Batch delete strategy")

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}

func (m *Manage) APIBatchRelease(c echo.Context) error {
	apiIDS := strings.TrimSpace(c.FormValue("api_ids"))
	if apiIDS == "" {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamEmptyC,
			Message: g.ParamEmptyE,
		})
	}

	var apiIds []string
	err := json.Unmarshal([]byte(apiIDS), &apiIds)
	if err != nil {
		return c.JSON(http.StatusBadRequest, g.Result{
			Status:  http.StatusBadRequest,
			ErrCode: g.ParamInvalidC,
			Message: g.ParamInvalidE,
		})
	}

	//必须是该service的管理员或者创建者
	if !m.canOperate(talent.FormValue(c, "app_priv")) {
		return c.JSON(http.StatusForbidden, g.Result{
			Status:  http.StatusForbidden,
			ErrCode: g.ForbiddenC,
			Message: g.ForbiddenE,
		})
	}

	for _, apiID := range apiIds {
		// 查询最新的api定义
		api := misc.API{}
		query := fmt.Sprintf("select * from api_define where api_id='%s'", apiID)
		err := g.DB.Get(&api, query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}

		// 更新release
		query = fmt.Sprintf("update api_release set description='%s',route_type='%d',backend_addr='%s',backend_type='%d',mock_data='%s',retry_strategy='%d',bw_strategy='%d',traffic_on='%d',traffic_api='%s',traffic_ratio='%d',traffic_ips='%s',verify_on='%d',param_rules='%s', cached_time='%d',status='%d',app='%s',addr_type='%d',backend_uri='%s' where api_id='%s'",
			*api.Desc, api.RouteType, api.BackendAddr, api.BackendType, *api.MockData, api.RetryStrategy, api.BwStrategy, api.TrafficOn, api.TrafficAPI, api.TrafficRatio, api.TrafficIPs, api.VerifyOn, *api.ParamTable, api.CachedTime, misc.API_RELEASED, api.App, api.AddrType, api.BackendURI, api.APIID)

		_, err = g.DB.Exec(query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}

		query = fmt.Sprintf("update api_define set release_version='%s' where api_id='%s'", api.ReviseVersion, api.APIID)
		_, err = g.DB.Exec(query)
		if err != nil {
			g.Info("access database error", zap.Error(err), zap.String("query", query))
			return c.JSON(http.StatusInternalServerError, g.Result{
				Status:  http.StatusInternalServerError,
				ErrCode: g.DatabaseC,
				Message: g.DatabaseE,
			})
		}

		userID := c.FormValue("username")
		if api.ParamTable != nil {
			d, _ := g.B64.DecodeString(*api.ParamTable)
			d1 := talent.Bytes2String(d)
			api.ParamTable = &d1
		}
		b, _ := json.Marshal(api)
		audit.Log(userID, api.Service, audit.TypeApi, api.APIID, audit.OpRelease, talent.Bytes2String(b), "")
	}

	return c.JSON(http.StatusOK, g.Result{
		Status: http.StatusOK,
	})
}
