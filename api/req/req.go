package req

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"github.com/labstack/echo"
)

type Request struct {
	Rid      int64
	Method   string
	Params   map[string]string
	Cookies  []*http.Cookie
	Api      *misc.API
	DebugOn  bool
	ClientIP string

	BwStrategy      *misc.BwStrategy
	RetryStrategy   *misc.RetryStrategy
	TrafficStrategy *misc.TrafficStrategy
}

func (r *Request) String() string {
	return fmt.Sprintf("method: %s,params: %v, api: %v, client_ip: %s", r.Method, r.Params, *r.Api, r.ClientIP)
}

func Parse(c echo.Context) (*Request, error) {
	r := &Request{
		Rid:    c.Get("rid").(int64),
		Params: make(map[string]string),
	}

	// 解析参数
	ps, _ := c.FormParams()
	for k, v := range ps {
		// debug参数不透传
		if k == g.DEBUG_PARAM {
			if v[0] == "true" {
				r.DebugOn = true
			}
		} else {
			r.Params[k] = v[0]
		}
	}

	// 解析cookie
	r.Cookies = c.Cookies()

	r.ClientIP = c.RealIP()

	r.Method = c.Request().Method

	var apiName string
	var version string

	// 判断是路径映射还是api映射
	uri := c.Request().URL.Path
	if uri == "/service/api" {
		apiName = r.Params["service_id"]
		if apiName == "" {
			//新网关使用以下参数'api_name'
			apiName = r.Params["api_name"]
			if apiName == "" {
				return r, errors.New("api_name not founded")
			}
		}
	} else {
		apiName = uri
	}

	version = r.Params["api_version"]
	if version == "" {
		// 如果没有传version，就默认为版本1
		version = "1"
	}

	apiID := apiName + ".v" + version
	// 获取api信息
	apiI, ok := misc.Apis.Load(apiID)
	if !ok {
		return r, errors.New("api id not exist")
	}
	r.Api = apiI.(*misc.API)

	// 生成策略
	strategy(r)

	return r, nil
}

func strategy(r *Request) {
	// 设置策略停用时的默认值
	r.BwStrategy = &misc.BwStrategy{
		Type: 0,
	}
	if r.Api.BwStrategy != 0 {
		s1, ok := misc.Strategies.Load(r.Api.BwStrategy)
		if ok {
			s := s1.(*misc.Strategy)
			if s.Status == misc.STRATEGY_ON {
				r.BwStrategy = s.DetailContent.(*misc.BwStrategy)
			}
		}
	}

	// 设置策略停用时的默认值
	r.RetryStrategy = &misc.RetryStrategy{
		ReqTimeout:    misc.REQ_TIMEOUT,
		RetryTimes:    misc.RETRY_TIMES,
		RetryInterval: misc.RETRY_INTERVAL,
	}
	if r.Api.RetryStrategy != 0 {
		s1, ok := misc.Strategies.Load(r.Api.RetryStrategy)
		if ok {
			s := s1.(*misc.Strategy)
			if s.Status == misc.STRATEGY_ON {
				r.RetryStrategy = s.DetailContent.(*misc.RetryStrategy)
			}
		}
	}

	// 设置策略停用时的默认值
	r.TrafficStrategy = &misc.TrafficStrategy{
		QPS:        misc.STRATEGY_NO_LIMIT,
		Concurrent: misc.STRATEGY_NO_LIMIT,
		Param:      "",
	}

	if r.Api.TrafficStrategy != 0 {
		s1, ok := misc.Strategies.Load(r.Api.TrafficStrategy)
		if ok {
			s := s1.(*misc.Strategy)
			if s.Status == misc.STRATEGY_ON {
				r.TrafficStrategy = s.DetailContent.(*misc.TrafficStrategy)
			}
		}
	}
}
