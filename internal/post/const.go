package post

const (
	// PostDraft means the post is in draft phase
	PostDraft = 1
	// PostPublished means the post already published
	PostPublished = 2
	// PostDelete means the post has been deleted
	PostDelete = 3
)

const (
	// ArticleType means the post is an ariticle
	ArticleType = 1
)

const (
	// OpCommentLike means a user like a comment
	OpCommentLike = 1
	// OpCommentDislike means a user dislike a comment
	OpCommentDislike = 2

	// OpPostLike means a user like a post
	OpPostLike = 1
	// OpPostDislike means a user dislike a post
	OpPostDislike = 2
)

const (
	// OpUpdate is the update operation
	OpUpdate = 1
	// OpDelete is the delete operation
	OpDelete = 2
)

const (
	// StatusNormal means post is in normal status
	StatusNormal = 0
	// StatusDeleted means post is deleted
	StatusDeleted = 1
)
