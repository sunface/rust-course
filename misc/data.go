package misc

import (
	"fmt"
	"sync"

	"github.com/mafanr/g"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type API struct {
	ID int `db:"id" json:"id"`
	// 基本设置
	Service  string  `db:"service" json:"service"`
	APIID    string  `db:"api_id" json:"api_id"`
	PathType int     `db:"path_type" json:"path_type"`
	Desc     *string `db:"description" json:"desc"`

	RouteType  int     `db:"route_type" json:"route_type"`
	RouteAddr  string  `db:"route_addr" json:"route_addr"`
	RouteProto int     `db:"route_proto" json:"route_proto"`
	MockData   *string `db:"mock_data" json:"mock_data"`

	// 通用策略
	RetryStrategy   int `db:"retry_strategy" json:"retry_strategy"`
	BwStrategy      int `db:"bw_strategy" json:"bw_strategy"`
	TrafficStrategy int `db:"traffic_strategy" json:"traffic_strategy"`

	// 流量路由
	TrafficOn    int    `db:"traffic_on" json:"traffic_on"`
	TrafficAPI   string `db:"traffic_api" json:"traffic_api"`
	TrafficRatio int    `db:"traffic_ratio" json:"traffic_ratio"`
	TrafficIPs   string `db:"traffic_ips" json:"traffic_ips"`

	// 参数验证
	VerifyOn   int     `db:"verify_on" json:"verify_on"`
	ParamTable *string `db:"param_rules" json:"param_rules"`

	// 缓存
	CachedTime int `db:"cached_time" json:"cached_time"`

	// 所属应用
	App string `db:"app" json:"app"`

	// API修订的版本号
	ReviseVersion  string `db:"revise_version" json:"revise_version"`
	ReleaseVersion string `db:"release_version" json:"release_version"`

	Status int `db:"status" json:"status"`

	// 日期相关
	CreateDate string `db:"create_date" json:"create_date"`
	ModifyDate string `db:"modify_date" json:"modify_date"`

	ParamRules *sync.Map
}

type Service struct {
	ID         int    `db:"id"`
	Name       string `db:"name"`
	Creator    string `db:"creator"`
	CreateDate string `db:"create_date"`
	ModifyDate string `db:"modify_date"`
}
type BW struct {
	Type int    `json:"type"`
	Key  string `json:"key"`
	Val  string `json:"val"`
}

type ParamRule struct {
	Param     string `json:"param"`
	ParamRule string `json:"rule"`
	TestData  string `json:"test_data"`
}

type Strategy struct {
	ID         int    `db:"id" json:"id"`
	Name       string `db:"name" json:"name"`
	Service    string `db:"service" json:"service"`
	Type       int    `db:"type" json:"type"`
	SubType    int    `db:"sub_type" json:"sub_type"`
	Content    string `db:"content" json:"content"`
	Status     int    `db:"status" json:"status"`
	CreateDate string `db:"create_date" json:"create_date"`
	ModifyDate string `db:"modify_date" json:"modify_date"`

	DetailContent interface{} `json:"-"` // 把content翻译成具体的策略语言
}

type BwStrategy struct {
	Type   int // 黑 or 白
	BwList []*BW
}
type RetryStrategy struct {
	ReqTimeout    int `json:"req_timeout"`
	RetryTimes    int `json:"retry_times"`
	RetryInterval int `json:"retry_interval"`
}

type TrafficStrategy struct {
	// 接口流量
	QPS        int `json:"qps"`
	Concurrent int `json:"concurrent"`

	// 用户流量
	Param string `json:"param"` // 限制参数
	Span  int    `json:"span"`  // 限定时间
	Times int    `json:"times"` // 限定次数

	// 熔断设置
	FuseError        int `json:"fuse_error"`         // 熔断错误率，大于该值时，触发熔断保护
	FuseErrorCount   int `json:"fuse_error_count"`   // 熔断触发的最小请求次数
	FusePercent      int `json:"fuse_percent"`       // 熔断触发后，允许访问的百分比，例如100次请求，只有50次允许通过
	FuseRecover      int `json:"fuse_recover"`       // 熔断错误率小于该值时，取消熔断保护
	FuseRecoverCount int `json:"fuse_recover_count"` // 熔断恢复的最小请求次数
}

var Apis = &sync.Map{}
var Strategies = &sync.Map{}

func InitMysql() {
	var err error

	// 初始化mysql连接
	sqlConn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", Conf.Mysql.Acc, Conf.Mysql.Pw,
		Conf.Mysql.Addr, Conf.Mysql.Port, Conf.Mysql.Database)
	g.DB, err = sqlx.Open("mysql", sqlConn)
	if err != nil {
		g.Fatal("init mysql error", zap.Error(err))
	}

	// 测试db是否正常
	err = g.DB.Ping()
	if err != nil {
		g.Fatal("init mysql, ping error", zap.Error(err))
	}
}
