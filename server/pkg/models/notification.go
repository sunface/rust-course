package models

import "time"

const (
	NotificationComment = 1
	NotificationLike    = 2
	NotificationMention = 3
	NotificationPublish = 4
	NotificationFollow  = 5
	NotificationReply   = 6
)

type Notification struct {
	Type     int         `json:"type"`
	Title    string      `json:"title"`
	SubTitle string      `json:"subTitle"`
	User     *UserSimple `json:"user"`
	Read     bool        `json:"read"`
	StoryID  string      `json:"storyID"`
	Created  time.Time   `json:"created"`
}
