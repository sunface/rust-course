package traffic

import (
	"net"
	"net/rpc"
	"sync"

	"github.com/mafanr/juz/misc"

	"github.com/mafanr/g"

	"go.uber.org/zap"
)

var traffic *Traffic

type Traffic struct {
	Strategies *sync.Map
}

func (t *Traffic) Start() {
	// 初始化mysql连接
	misc.InitMysql()

	// 加载配置数据
	t.Strategies = &sync.Map{}
	t.loadData()

	// 启动rpc服务
	t.startRpcServer()

	traffic = t
}

func (t *Traffic) Shutdown() {
	g.Info("shutdown tfe..")
}

type RateLimiter struct{}

// 请不要修改该函数，用来测试rpc是否存活
func (rl *RateLimiter) Ping(req int, reply *int) error {
	*reply = 1
	return nil
}

func (t *Traffic) startRpcServer() {
	rl := new(RateLimiter)
	server := rpc.NewServer()
	err := server.Register(rl)
	if err != nil {
		g.Fatal("register error", zap.Error(err))
	}

	g.Info("Listen tcp on port", zap.String("port", misc.Conf.Traffic.Port))
	l, err := net.Listen("tcp", ":"+misc.Conf.Traffic.Port)
	if err != nil {
		g.Fatal("listen error", zap.Error(err))
	}

	go func() {
		for {
			conn, err := l.Accept()
			if err != nil {
				g.Error("accept error", zap.Error(err))
				continue
			}
			server.ServeConn(conn)
		}
	}()
}
