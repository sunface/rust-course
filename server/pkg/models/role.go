package models

type RoleType string

const (
	ROLE_NORMAL      = "Normal"
	ROLE_EDITOR      = "Editor"
	ROLE_ADMIN       = "Admin"
	ROLE_SUPER_ADMIN = "SuperAdmin"
)

func (r RoleType) IsValid() bool {
	return r == ROLE_NORMAL || r == ROLE_EDITOR || r == ROLE_ADMIN || r == ROLE_SUPER_ADMIN
}

func (r RoleType) IsAdmin() bool {
	return r == ROLE_ADMIN || r == ROLE_SUPER_ADMIN
}

func (r RoleType) IsEditor() bool {
	return r == ROLE_ADMIN || r == ROLE_EDITOR || r == ROLE_SUPER_ADMIN
}

func IsAdmin(r RoleType) bool {
	return r.IsAdmin()
}

func RoleSortWeight(role RoleType) int {
	switch role {
	case ROLE_NORMAL:
		return 0
	case ROLE_EDITOR:
		return 1
	case ROLE_ADMIN:
		return 2
	case ROLE_SUPER_ADMIN:
		return 3
	default:
		return 0
	}
}
