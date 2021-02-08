package e

type Error struct {
	Status  int
	Message string
}

func New(status int, msg string) *Error {
	return &Error{
		Status:  status,
		Message: msg,
	}
}

const (
	DB                 = "数据库异常"
	Internal           = "服务器内部错误"
	NeedLogin          = "你需要登录才能访问该页面"
	NoEditorPermission = "只有编辑角色才能执行此操作"
	ParamInvalid       = "请求参数不正确"
	NotFound           = "目标不存在"
	NoPermission       = "你没有权限执行此操作"
)
