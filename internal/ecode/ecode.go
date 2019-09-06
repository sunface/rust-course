package ecode

// common
const (
	NotSignIn    = 1001
	NotSignInMsg = "user need sign in"

	ParamInvalid    = 1002
	ParamInvalidMsg = "param invalid"

	CommonErrorMsg = "Oh no, an unexpected error happend"
	DatabaseError  = 1003

	NoPermission    = 1004
	NoPermissionMsg = "You don't have permission"
)

// article
const (
	ArticleNotFound    = 1100
	ArticleNotFoundMsg = "Target article not found"

	PostNotFound    = 1101
	PostNotFoundMsg = "Target post not found"
)
