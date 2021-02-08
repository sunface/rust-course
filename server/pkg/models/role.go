package models

type RoleType string

const (
	ROLE_NORMAL      = "Normal"
	ROLE_EDITOR      = "Editor"
	ROLE_CREATOR     = "Creator"
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

func (r RoleType) IsCreator() bool {
	return r == ROLE_CREATOR || r == ROLE_EDITOR || r == ROLE_SUPER_ADMIN
}
