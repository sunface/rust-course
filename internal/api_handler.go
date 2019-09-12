package internal

import (
	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/post"
	"github.com/thinkindev/im.dev/internal/user"
)

func apiHandler(e *echo.Echo) {
	// sign-in apis
	e.POST("/web/signIn", user.SignIn)
	e.POST("/web/signOut", user.SignOut)
	e.GET("/web/user/card", user.Card)

	// article apis
	e.POST("/web/article/saveNew", post.NewArticle, user.CheckSignIn)
	e.POST("/web/post/preview", post.Preview, user.CheckSignIn)
	e.GET("/web/article/detail", post.GetArticleDetail)
	e.GET("/web/article/beforeEdit", post.BeforeEditAr, user.CheckSignIn)
	e.POST("/web/article/saveChanges", post.SaveArticleChanges, user.CheckSignIn)

	// comment apis
	e.POST("/web/comment/create", post.Comment, user.CheckSignIn)
	e.POST("/web/comment/reply", post.CommentReply, user.CheckSignIn)
	e.POST("/web/comment/edit", post.EditComment, user.CheckSignIn)
	e.POST("/web/comment/delete", post.DeleteComment, user.CheckSignIn)
	e.POST("/web/comment/revert", post.RevertComment, user.CheckSignIn)
	e.GET("/web/comment/query", post.QueryComments)
	e.POST("/web/comment/like", post.CommentLike, user.CheckSignIn)
	e.POST("/web/comment/dislike", post.CommentDislike, user.CheckSignIn)

	// user
	e.GET("/user/profile", user.Profile, user.CheckSignIn)
	e.POST("/user/profile/set", user.SetProfile, user.CheckSignIn)
}
