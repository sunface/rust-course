package internal

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/imdotdev/im.dev/server/internal/api"
	"github.com/imdotdev/im.dev/server/internal/cache"
	"github.com/imdotdev/im.dev/server/internal/email"
	"github.com/imdotdev/im.dev/server/internal/storage"
	"github.com/imdotdev/im.dev/server/internal/top"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/db"
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

	err = initRedis()
	if err != nil {
		return err
	}

	// init online dynamic config
	err = initDynamicConfig()
	if err != nil {
		return err
	}

	// if config.Data.Common.IsProd {
	gin.SetMode((gin.ReleaseMode))
	// } else {
	// 	gin.SetMode(gin.DebugMode)
	// }

	email.Init()

	go cache.Init()
	go top.Init()

	go func() {
		router := gin.New()
		router.Use(Cors())

		r := router.Group("/api")

		//story apis
		r.GET("/story/post/:id", api.GetStory)
		r.GET("/story/id/:type", IsLogin(), InvasionCheck(), api.GenStoryID)
		r.GET("/story/comments/:id", api.GetStoryComments)
		r.POST("/story/comment", IsLogin(), api.SubmitComment)
		r.DELETE("/story/comment/:id", IsLogin(), api.DeleteStoryComment)

		r.GET("/story/posts/editor", IsLogin(), api.GetEditorPosts)
		r.GET("/story/posts/org/:id", IsLogin(), api.GetOrgPosts)
		r.GET("/story/posts/drafts", IsLogin(), api.GetEditorDrafts)
		r.GET("/story/posts/home", api.GetHomePosts)
		r.GET("/story/posts/dashboard", IsLogin(), api.GetDashboardPosts)
		r.POST("/story", IsLogin(), api.SubmitStory)
		r.POST("/story/pin/:storyID", IsLogin(), api.PinStory)
		r.POST("/story/series", api.GetSeries)
		r.POST("/story/series/post/:id", IsLogin(), api.SubmitSeriesPost)
		r.GET("/story/series/post/:id", api.GetSeriesPost)
		r.GET("/story/series/posts/:id", api.GetSeriesPosts)
		r.GET("/story/series/byPostID/:id", api.GetPostSeries)
		r.DELETE("/story/series/post/:id", IsLogin(), api.DeleteSeriesPost)
		r.POST("/story/post/draft", IsLogin(), api.SubmitPostDraft)
		r.DELETE("/story/post/:id", IsLogin(), api.DeletePost)
		r.POST("/story/bookmark/:storyID", IsLogin(), api.Bookmark)
		r.GET("/story/bookmark/posts", IsLogin(), api.GetBookmarkPosts)

		// tag apis
		r.POST("/tag", IsLogin(), api.SubmitTag)
		r.DELETE("/tag/:id", IsLogin(), api.DeleteTag)
		r.GET("/tag/all", api.GetTags)
		r.POST("tag/ids", api.GetTagsByIDs) // 根据对象ID列表获取关联的标签
		r.GET("/tag/posts/:id", api.GetTagPosts)
		r.GET("/tag/info/:name", api.GetTag)
		r.GET("/tag/user/:userID", api.GetUserTags) // 获取用户博客用到的标签列表
		// user apis
		r.GET("/user/all", api.GetUsers)
		r.POST("/user/ids", api.GetUsersByIDs)
		r.GET("/user/self", IsLogin(), api.GetUserSelf)
		r.GET("/user/info/:username", api.GetUser)
		r.POST("/user/update", IsLogin(), api.UpdateUser)
		r.GET("/user/posts/:userID", api.GetUserPosts)
		r.GET("/user/session", api.GetSession)
		r.POST("/user/login", user.Login)
		r.POST("/user/login/email", user.LoginEmail)
		r.POST("/user/login/code", user.LoginCode)
		r.POST("/user/logout", user.Logout)
		r.POST("/user/navbar", IsLogin(), api.SubmitUserNavbar)
		r.GET("/user/navbars/:userID", api.GetUserNavbars)
		r.DELETE("/user/navbar/:id", IsLogin(), api.DeleteUserNavbar)
		r.GET("/user/name/exist/:name", api.UserNameExist)
		r.GET("/user/email/exist/:email", api.UserEmailExist)
		r.GET("/user/email/byCode", api.GetUserEmailByCode)
		r.POST("/user/register", api.UserRegister)
		// interaction apis
		r.POST("/interaction/like/:id", IsLogin(), api.Like)
		r.POST("/interaction/follow/:id", IsLogin(), api.Follow)
		r.POST("/interaction/following/weight", IsLogin(), api.SetFollowingWeight)
		r.GET("/interaction/followed/:id", api.Followed)
		r.GET("/interaction/following/:userID", api.GetFollowing)
		r.GET("/interaction/followers/:userID", api.GetFollowers)

		// search apis
		r.GET("/search/posts", api.SearchPosts)
		r.GET("/search/users", api.SearchUsers)

		// org apis
		r.POST("/org/create", IsLogin(), api.CreateOrg)
		r.POST("/org/update", IsLogin(), api.UpdateOrg)
		r.GET("/org/byUserID/:userID", api.GetOrgByUserID)
		r.GET("/org/members/:id", api.GetOrgMembers)
		r.POST("/org/secret/:id", IsLogin(), api.GenOrgSecret)
		r.GET("/org/secret/:id", IsLogin(), api.GetOrgSecret)
		r.POST("/org/join", IsLogin(), api.JoinOrg)
		r.POST("/org/member/role", IsLogin(), api.UpdateOrgMember)
		r.POST("/org/transfer", IsLogin(), api.TransferOrg)
		r.DELETE("/org/member/:orgID/:memberID", IsLogin(), api.DeleteOrgMember)
		r.POST("/org/leave/:orgID", IsLogin(), api.LeaveOrg)
		r.DELETE("/org/post/:orgID/:postID", api.DeleteOrgPost)
		r.POST("/org/pin/story/:id", IsLogin(), api.PinOrgStory)
		r.POST("/org/navbar/:orgID", IsLogin(), api.SubmitOrgNavbar)
		r.DELETE("/org/navbar/:id", IsLogin(), api.DeleteOrgNavbar)

		// admin apis
		r.POST("/admin/user", IsLogin(), api.AdminSubmitUser)
		r.GET("/admin/user/all", IsLogin(), api.AdminGetUsers)
		r.GET("/admin/config", IsLogin(), api.AdminConfig)
		// notification apis
		r.GET("/notifications/list/:type", IsLogin(), api.GetNotifications)
		r.GET("/notifications/unread", IsLogin(), api.GetUnread)
		r.POST("/notifications/unread", IsLogin(), api.ResetUnread)
		// other apis
		r.GET("/config", GetConfig)
		r.POST("/config", IsLogin(), UpdateConfig)
		r.GET("/navbars", GetNavbars)
		r.POST("/navbar", IsLogin(), SubmitNavbar)
		r.DELETE("/navbar/:id", IsLogin(), DeleteNavbar)

		r.GET("/sidebars", GetSidebars)
		r.POST("/sidebar", IsLogin(), SubmitSidebar)

		r.POST("/report", IsLogin(), api.SubmitReport)
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
		user := user.CurrentUser(c)
		if user == nil {
			c.JSON(http.StatusUnauthorized, common.RespError(e.NeedLogin))
			c.Abort()
			return
		}
		c.Next()
	}
}

func InvasionCheck() gin.HandlerFunc {
	return func(c *gin.Context) {
		//@todo
		c.Next()
	}
}

func initRedis() error {
	// init redis client
	db.Redis = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	ctx := context.Background()
	err := db.Redis.Set(ctx, "test_redis", "alive", 10*time.Second).Err()
	if err != nil {
		return err
	}

	return nil
}

func initDynamicConfig() error {
	var data []byte
	err := db.Conn.QueryRow("SELECT data FROM config WHERE id=?", 1).Scan(&data)
	if err != nil {
		return err
	}
	d := &config.DynamicConfig{}
	json.Unmarshal(data, &d)

	config.Dynamic = d

	return nil
}
