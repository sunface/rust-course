package api

import (
	"net/http"
	"net/rpc"
	"time"

	"github.com/mafanr/juz/api/filter"
	"github.com/mafanr/juz/api/manage"
	"github.com/mafanr/juz/api/stats"
	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	_ "github.com/go-sql-driver/mysql"
	"github.com/labstack/echo"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
)

type ApiServer struct {
	manage *manage.Manage
	router *router
}

func (p *ApiServer) Start() {
	g.Info("start tfe..")

	// 获取所有内部服务节点信息
	g.ETCD.QueryAll(misc.Conf.Etcd.Addrs)

	// 初始化mysql连接
	misc.InitMysql()

	// 从mysql中加载所有的api信息到内存中
	p.loadData()

	p.manage = &manage.Manage{}
	go p.manage.Start()

	p.router = &router{p, &filter.Filter{}}

	// 连接到traffic rpc服务
	p.initTraffic()

	// 启动proxy http服务
	go p.listen()

	// 启动metrics收集
	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":6062", nil)
}

func (o *ApiServer) Shutdown() {
	g.Info("shutdown tfe..")
}

func (p *ApiServer) listen() {
	e := echo.New()

	// 回调相关
	//同步回调接口
	e.Any("/*", p.router.route, timing)

	e.Logger.Fatal(e.Start(":" + misc.Conf.Api.Port))
}

func timing(f echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ts := time.Now()
		rid := (ts.UnixNano()/10)*10 + misc.Conf.Api.ServerID
		g.Info("New request accepted", zap.Int64("rid", rid), zap.String("ip", c.RealIP()))
		c.Set("rid", rid)
		defer func() {
			// 统计请求指标
			apiID := c.Get("api_id").(string)
			service := c.Get("service").(string)
			label := c.Get("app").(string)
			stats.Req.With(prometheus.Labels{
				"api_id":  apiID,
				"service": service,
				"app":     label,
			}).Observe(float64(time.Now().Sub(ts).Nanoseconds() / 1e6))

			err := c.Get("error_msg")
			if err == nil {
				g.Info("Request success", zap.Int64("rid", rid))
			} else {
				g.Info("Request failed", zap.Int64("rid", rid), zap.Error(err.(error)))
			}
		}()

		return f(c)
	}
}

func (as *ApiServer) initTraffic() {
	r, err := rpc.Dial("tcp", misc.Conf.Traffic.Host+":"+misc.Conf.Traffic.Port)
	if err != nil {
		g.Fatal("connect to raffic error", zap.Error(err))
	}
	as.router.Filter.Rpc = r

	// 定时检测rpc连接的存活性
	go func() {
		for {
			var res int
			err := as.router.Filter.Rpc.Call("RateLimiter.Ping", 1, &res)
			if err != nil || res != 1 {
				g.Warn("rpc ping failed", zap.Error(err))
				r, err := rpc.Dial("tcp", misc.Conf.Traffic.Host+":"+misc.Conf.Traffic.Port)
				if err != nil {
					g.Warn("re-connect to traffic error", zap.Error(err))
					time.Sleep(2 * time.Second)
					continue
				}
				as.router.Filter.Rpc = r
				g.Info("re-connect to traffic ok")
			}

			time.Sleep(3 * time.Second)
		}
	}()
}
