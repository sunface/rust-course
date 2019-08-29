package internal

import (
	"time"

	"go.uber.org/zap"

	"github.com/gocql/gocql"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"github.com/thinkindev/im.dev/internal/misc"
)

// Start web server for im.dev ui
func Start(confPath string) {
	// init config
	misc.InitConf(confPath)

	// init logger
	misc.InitLog(misc.Conf.LogLevel)

	misc.Log.Info("config init ok", zap.Any("config", misc.Conf))

	err := connectDatabase()
	if err != nil {
		if err != nil {
			misc.Log.Fatal("connect to cql cluster error", zap.String("error", err.Error()))
		}
	}

	e := echo.New()
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{Level: 5}))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowHeaders:     append([]string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, "token"}),
		AllowCredentials: true,
	}))

	// route the request to corresponding api
	apiHandler(e)

	// start dashboard api server
	e.Logger.Fatal(e.Start(misc.Conf.ListenAddr))
}

const (
	// ConnectTimeout specify the timeout interval for connecting to cassandra
	ConnectTimeout = 30
	// ReconnectInterval specify the reconnect interval for connecting to cassandra
	ReconnectInterval = 500
)

// connect to cassandra/scyllaDB cluster
func connectDatabase() error {
	c := gocql.NewCluster(misc.Conf.CQL.Cluster...)
	c.Timeout = ConnectTimeout * time.Second
	c.ReconnectInterval = ReconnectInterval * time.Millisecond

	c.Keyspace = misc.Conf.CQL.Keyspace
	c.NumConns = misc.Conf.CQL.ConnectionNum

	session, err := c.CreateSession()
	if err != nil {
		return err
	}

	misc.CQL = session
	return nil
}
