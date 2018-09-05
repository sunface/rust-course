package misc

const TEST_API_NAME = "devops.test.get.v1"

// 默认请求策略
const (
	REQ_TIMEOUT    = 15
	RETRY_TIMES    = 0
	RETRY_INTERVAL = 5
)

const (
	PRIVILEGE_SUPER_ADMIN = 0
	PRIVILEGE_ADMIN       = 1
	PRIVILEGE_NORMAL      = 2
	PRIVILEGE_VIEWER      = 3
)

// 通用的
const (
	ON  = 1
	OFF = 0
)

// 以下值绝对不可更改，前端也在使用
const (
	STRATEGY_NO_LIMIT = 0

	BW_OFF     = 0
	BLACK_LIST = 1
	WHITE_LIST = 2

	IP_TYPE    = 1
	PARAM_TYPE = 2

	TRAFFIC_ON  = 1
	TRAFFIC_OFF = 0

	PARAM_VERIFY_ON  = 1
	PARAM_VERIFY_OFF = 0

	API_RELEASED = 1
	API_OFFLINE  = 0

	STRATEGY_ALL     = -1
	STRATEGY_EMPTY   = 0
	STRATEGY_BWLIST  = 1
	STRATEGY_RETRY   = 2
	STRATEGY_TRAFFIC = 3

	STRATEGY_ON  = 1
	STRATEGY_OFF = 0

	ADDR_URL  = 1
	ADDR_ETCD = 2
)

// redis后缀
const (
	TRAFFIC_CONCURRENT = ".cr"
)
