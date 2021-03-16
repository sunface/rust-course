package models

import (
	"time"

	"github.com/imdotdev/im.dev/server/pkg/db"
)

type User struct {
	ID       string   `json:"id"`
	Type     string   `json:"type"`
	Username string   `json:"username"`
	Nickname string   `json:"nickname"`
	Avatar   string   `json:"avatar"`
	Email    string   `json:"email,omitempty"`
	Role     RoleType `json:"role,omitempty"`

	Tagline   string   `json:"tagline,omitempty"`
	Cover     string   `json:"cover,omitempty"`
	Location  string   `json:"location,omitempty"`
	AvailFor  string   `json:"availFor,omitempty"`
	About     string   `json:"about,omitempty"`
	RawSkills []*Tag   `json:"rawSkills,omitempty"`
	Skills    []string `json:"skills,omitempty"`

	Website       string `json:"website,omitempty"`
	Twitter       string `json:"twitter,omitempty"`
	Github        string `json:"github,omitempty"`
	Zhihu         string `json:"zhihu,omitempty"`
	Weibo         string `json:"weibo,omitempty"`
	Facebook      string `json:"facebook,omitempty"`
	Stackoverflow string `json:"stackoverflow,omitempty"`

	Follows    int  `json:"follows"`
	Followings int  `json:"followings"`
	Followed   bool `json:"followed"`

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
	err := db.Conn.QueryRow(`SELECT id,type,username,role,nickname,email,avatar,last_seen_at,created FROM user WHERE id=? or username=? or email=?`,
		id, username, email).Scan(&user.ID, &user.Type, &user.Username, &user.Role, &user.Nickname, &user.Email, &user.Avatar, &user.LastSeenAt, &user.Created)

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
