package api

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/mafanr/juz/api/filter"
	"github.com/mafanr/juz/api/manage"
	"github.com/mafanr/juz/api/req"
	"github.com/mafanr/juz/api/stats"
	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"go.uber.org/zap"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/sunface/talent"

	"github.com/labstack/echo"
	"github.com/valyala/fasthttp"
)

/* 请求路由模块，所有进入的请求都在这里被处理和路由*/
const (
	SYNC     = 1
	REDIRECT = 2
	ASYNC    = 9
)

type router struct {
	apiServer *ApiServer
	*filter.Filter
}

/*----------------------请求路由---------------------*/
func (router *router) route(c echo.Context) error {
	// 解析请求
	r, err := req.Parse(c)
	if err != nil {
		c.Set("api_id", "error_api_id")
		c.Set("service", "error_service")
		c.Set("app", "error_app")
		c.Set("error_msg", err)
		return c.JSON(http.StatusBadRequest, g.Result{r.Rid, http.StatusBadRequest, g.ParamInvalidC, err.Error(), nil})
	}
	c.Set("api_id", r.Api.APIID)
	c.Set("service", r.Api.Service)
	c.Set("app", r.Api.App)

	g.Debug(r.DebugOn, "request content", zap.Int64("rid", r.Rid), zap.String("req", r.String()))

	// 判断api是否发布
	if r.Api.Status != misc.API_RELEASED {
		return c.JSON(http.StatusBadRequest, g.Result{r.Rid, http.StatusBadRequest, manage.APIOfflineC, manage.APIOfflineE, nil})
	}

	// 在请求路由之前进行过滤
	res := router.BeforeRoute(r)
	if res.Status != 0 {
		c.Set("error_msg", errors.New(res.Emsg))
		return c.JSON(res.Status, g.Result{r.Rid, res.Status, res.Ecode, res.Emsg, nil})
	}

	// 开始请求
	var code int
	var body []byte

	switch r.Api.RouteType {
	case SYNC: // 同步请求
		code, body, err = router.sync(r)
	case REDIRECT: //重定向
		return router.redirect(c, r)
	}

	// 请求失败，通知客户端
	if err != nil {
		c.Set("error_msg", err)
		return c.JSON(code, g.Result{r.Rid, code, g.ReqFailedC, err.Error(), nil})
	}

	g.Debug(r.DebugOn, "response body", zap.Int64("rid", r.Rid), zap.Int("code", code), zap.String("body", talent.Bytes2String(body)))

	// 成功时，把请求id放在header中返回，避免污染返回结果
	c.Response().Header().Add("rid", strconv.FormatInt(r.Rid, 10))

	// 返回给客户端成功的结果
	return c.String(code, talent.Bytes2String(body))
}

func (rt *router) redirect(c echo.Context, r *req.Request) error {
	// 组装参数
	url := r.Api.BackendAddr + "?" + c.QueryString()
	return c.Redirect(http.StatusMovedPermanently, url)
}

func (rt *router) sync(r *req.Request) (int, []byte, error) {
	args := &fasthttp.Args{}
	for k, v := range r.Params {
		args.Set(k, v)
	}

	req := &fasthttp.Request{}
	resp := &fasthttp.Response{}

	// 放入自定义cookie信息
	for _, ck := range r.Cookies {
		req.Header.SetCookie(ck.Name, ck.Value)
	}

	// 请求头部加入request id，方便后续业务进行跟踪
	req.Header.Set("rid", strconv.FormatInt(r.Rid, 10))

	req.Header.SetMethod(r.Api.Method)

	// 写入客户端真实ip
	req.Header.Set("X-Forwarded-For", r.ClientIP)

	var url string
	// 获取url
	if r.Api.AddrType == misc.ADDR_URL { // direct url
		url = r.Api.BackendAddr
	} else { // get url from etcd
		s := g.GetServer(r.Api.BackendAddr)
		if s == nil {
			return http.StatusServiceUnavailable, nil, errors.New("no server available")
		}
		url = "http://" + s.IP + r.Api.BackendURI
	}
	switch r.Api.Method {
	case "GET":
		// 拼接url
		url = url + "?" + args.String()
	default:
		args.WriteTo(req.BodyWriter())
	}
	req.SetRequestURI(url)

	// 超时重试
	retrys := 0
	var err error

	for {
		res := rt.Filter.BeforeCall(r)
		if res.Status != 0 {
			return res.Status, nil, errors.New(res.Emsg)
		}

		err = g.Cli.DoTimeout(req, resp, time.Duration(r.RetryStrategy.ReqTimeout)*time.Second)
		// time.Sleep(10 * time.Second)
		rt.Filter.AfterCall(r)
		if err == nil {
			// 统计请求code
			stats.Codes.With(prometheus.Labels{
				"code":    strconv.Itoa(resp.StatusCode()),
				"api_id":  r.Api.APIID,
				"service": r.Api.Service,
				"app":     r.Api.App,
			}).Inc()
			break
		}
		// 统计请求错误
		stats.Errors.With(prometheus.Labels{
			"api_id":  r.Api.APIID,
			"service": r.Api.Service,
			"app":     r.Api.App,
		}).Inc()
		// 发生错误,进行重试
		if retrys >= r.RetryStrategy.RetryTimes {
			break
		}
		time.Sleep(time.Duration(r.RetryStrategy.RetryInterval) * time.Second)
		retrys++
	}

	return resp.StatusCode(), resp.Body(), err
}
