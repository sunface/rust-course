package internal

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/api"
	"github.com/imdotdev/im.dev/server/internal/session"
	"github.com/imdotdev/im.dev/server/internal/storage"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/log"
)

type Server struct {
}

// New ...
func New() *Server {
	return &Server{}
}

var logger = log.RootLogger.New("logger", "server")

// Start ...1=
func (s *Server) Start() error {
	err := storage.Init()
	if err != nil {
		return err
	}

	if config.Data.Common.IsProd {
		gin.SetMode((gin.ReleaseMode))
	} else {
		gin.SetMode(gin.DebugMode)
	}

	go func() {
		router := gin.New()
		router.Use(Cors())

		r := router.Group("/api")
		{
			r.POST("/login", session.Login)
			r.POST("/logout", session.Logout)
			r.GET("/uiconfig", GetUIConfig)

		}

		r.GET("/post/:id", api.GetPost)

		r.POST("/story/like/:id", api.LikeStory, IsLogin())
		r.GET("/story/comments/:id", api.GetStoryComments)
		r.POST("/story/comment", api.SubmitComment, IsLogin())
		r.DELETE("/comment/:id", api.DeleteComment, IsLogin())

		r.GET("/editor/posts", api.GetEditorPosts, IsLogin())
		r.POST("/editor/post", api.SubmitPost, IsLogin())
		r.DELETE("/editor/post/:id", api.DeletePost, IsLogin())
		r.GET("/editor/post/:id", api.GetEditorPost, IsLogin())

		r.POST("/admin/tag", api.SubmitTag, IsLogin())
		r.DELETE("/admin/tag/:id", api.DeleteTag, IsLogin())

		r.GET("/tags", api.GetTags)
		r.GET("/tag/:name", api.GetTag)

		err := router.Run(config.Data.Server.Addr)
		if err != nil {
			logger.Crit("start backend server error", "error", err)
			panic(err)
		}
	}()
	return nil
}

// Close ...
func (s *Server) Close() error {
	return nil
}

// Cors is a gin middleware for cross domain.
func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Headers", "Content-Type,AccessToken,X-CSRF-Token, Authorization,X-Token,*")
		c.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		//放行所有OPTIONS方法
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}

		// 处理请求
		c.Next()
	}
}

// Auth is a gin middleware for user auth
func IsLogin() gin.HandlerFunc {
	return func(c *gin.Context) {
		user := session.CurrentUser(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, common.RespError(e.NeedLogin))
			c.Abort()
			return
		}
		c.Next()
	}
}
