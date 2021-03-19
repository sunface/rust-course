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
	NeedLogin          = "你需要登录"
	NoEditorPermission = "只有编辑角色才能执行此操作"
	ParamInvalid       = "请求参数不正确"
	NotFound           = "目标不存在"
	NoPermission       = "你没有权限执行此操作"
	NoAdminPermission  = "你需要管理员权限"
	BadRequest         = "非法操作"
	AlreadyExist       = "目标已经存在"
)
