package stats

import (
	"github.com/prometheus/client_golang/prometheus"
)

//ApiID指标项: 请求数、http code分布、错误统计、耗时统计、QPS
//Label指标项：继承ApiID，请求数top n,错误数top n，耗时top n, qps top n
//Service指标项: 继承Label

var (
	Req = prometheus.NewSummaryVec(prometheus.SummaryOpts{
		Name:       "juz_req_stats",
		Help:       "Request stats",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
	}, []string{"api_id", "service", "app"})
	Limits = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "juz_req_limits",
		Help: "Request blocked",
	}, []string{"api_id", "service", "app"})
	Errors = prometheus.NewCounterVec(prometheus.CounterOpts{
		Name: "juz_req_errors",
		Help: "Request error",
	}, []string{"api_id", "service", "app"})
	Codes = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "juz_req_codes",
			Help: "Reqeust http code",
		},
		[]string{"code", "api_id", "service", "app"},
	)
)

func init() {
	// Metrics have to be registered to be exposed:
	prometheus.MustRegister(Req)
	prometheus.MustRegister(Limits)
	prometheus.MustRegister(Errors)
	prometheus.MustRegister(Codes)
}
