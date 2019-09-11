package internal

import (
	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/post"
	"github.com/thinkindev/im.dev/internal/session"
)

func apiHandler(e *echo.Echo) {
	// sign-in apis
	e.POST("/web/signIn", session.SignIn)
	e.POST("/web/signOut", session.SignOut)
	e.GET("/web/user/get", session.GetUser)

	// article apis
	e.POST("/web/article/saveNew", post.NewArticle, session.CheckSignIn)
	e.POST("/web/post/preview", post.Preview, session.CheckSignIn)
	e.GET("/web/article/detail", post.GetArticleDetail)
	e.GET("/web/article/beforeEdit", post.BeforeEditAr, session.CheckSignIn)
	e.POST("/web/article/saveChanges", post.SaveArticleChanges, session.CheckSignIn)

	// comment apis
	e.POST("/web/comment/create", post.Comment, session.CheckSignIn)
	e.POST("/web/comment/reply", post.CommentReply, session.CheckSignIn)
	e.POST("/web/comment/edit", post.EditComment, session.CheckSignIn)
	e.POST("/web/comment/delete", post.DeleteComment, session.CheckSignIn)
	e.POST("/web/comment/revert", post.RevertComment, session.CheckSignIn)
	e.GET("/web/comment/query", post.QueryComments)
	e.POST("/web/comment/like", post.CommentLike, session.CheckSignIn)
	e.POST("/web/comment/dislike", post.CommentDislike, session.CheckSignIn)
}
