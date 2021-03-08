package models

import (
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
)

type User struct {
	ID       string   `json:"id"`
	Username string   `json:"username"`
	Nickname string   `json:"nickname"`
	Avatar   string   `json:"avatar"`
	Email    string   `json:"email"`
	Role     RoleType `json:"role"`

	Tagline   string   `json:"tagline"`
	Cover     string   `json:"cover"`
	Location  string   `json:"location"`
	AvailFor  string   `json:"availFor"`
	About     string   `json:"about"`
	RawSkills []*Tag   `json:"rawSkills"`
	Skills    []string `json:"skills"`

	Website       string `json:"website"`
	Twitter       string `json:"twitter"`
	Github        string `json:"github"`
	Zhihu         string `json:"zhihu"`
	Weibo         string `json:"weibo"`
	Facebook      string `json:"facebook"`
	Stackoverflow string `json:"stackoverflow"`

	Follows  int  `json:"follows"`
	Followed bool `json:"followed"`

	LastSeenAt time.Time `json:"lastSeenAt,omitempty"`
	Created    time.Time `json:"created"`
}

type Users []*User

func (ar Users) Len() int      { return len(ar) }
func (ar Users) Swap(i, j int) { ar[i], ar[j] = ar[j], ar[i] }
func (ar Users) Less(i, j int) bool {
	return ar[i].Follows > ar[j].Follows
}

func (user *User) Query(id string, username string, email string) error {
	err := db.Conn.QueryRow(`SELECT id,username,role,nickname,email,avatar,last_seen_at,created FROM user WHERE id=? or username=? or email=?`,
		id, username, email).Scan(&user.ID, &user.Username, &user.Role, &user.Nickname, &user.Email, &user.Avatar, &user.LastSeenAt, &user.Created)

	if user.Avatar == "" {
		user.Avatar = DefaultAvatar
	}

	return err
}

type UserSimple struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar"`
}

func (user *UserSimple) Query() error {
	err := db.Conn.QueryRow(`SELECT id,username,nickname,avatar FROM user WHERE id=?`, user.ID).Scan(
		&user.ID, &user.Username, &user.Nickname, &user.Avatar,
	)

	if user.Avatar == "" {
		user.Avatar = DefaultAvatar
	}

	return err
}
