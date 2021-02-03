package models

import (
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
)

type User struct {
	ID         int       `json:"id"`
	Username   string    `json:"username"`
	Nickname   string    `json:"nickname"`
	Avatar     string    `json:"avatar"`
	Email      string    `json:"email"`
	Role       RoleType  `json:"role"`
	LastSeenAt time.Time `json:"lastSeenAt,omitempty"`
	Created    time.Time `json:"created"`
}

const DefaultAvatar = "https://placekitten.com/100/100"

func (user *User) Query(id int64, username string, email string) error {
	err := db.Conn.QueryRow(`SELECT id,username,role,nickname,email,avatar,last_seen_at,created FROM user WHERE id=? or username=? or email=?`,
		id, username, email).Scan(&user.ID, &user.Username, &user.Role, &user.Nickname, &user.Email, &user.Avatar, &user.LastSeenAt, &user.Created)

	if user.Avatar == "" {
		user.Avatar = DefaultAvatar
	}

	return err
}
