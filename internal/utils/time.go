package utils

import (
	"fmt"
	"strconv"
	"time"
)

// Time2ReadableString converts time to readable string
// 1分钟之内，显示xx秒前
// 1小时之内，显示XX分钟前
// 24小时之内，显示xx小时前
// 昨天 x:x
// 前天 x:x
// 同一年，显示x月xx
// 不同年，显示xx.xx.xx
func Time2ReadableString(t time.Time) string {
	now := time.Now().Local()
	intv := now.Unix() - t.Unix()
	if intv < 60 {
		return strconv.FormatInt(intv, 10) + "seconds ago"
	}

	if intv < 3600 {
		return strconv.FormatInt(intv/60, 10) + "minutes ago"
	}

	if intv < 86400 {
		return strconv.FormatInt(intv/3600, 10) + "hours ago"
	}

	y1, m1, d1 := now.Date()
	y2, m2, d2 := t.Date()
	h, m, _ := t.Clock()
	if (y1 == y2) && (m1 == m2) && (d1-d2 == 1) { // 昨天
		return fmt.Sprintf("yestoday %02d:%02d", h, m)
	}

	if y1 == y2 {
		return fmt.Sprintf("%02d.%02d", m2, d2)
	}

	return t.Format("06.1.2")
}
