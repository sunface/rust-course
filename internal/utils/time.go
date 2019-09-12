package utils

import (
	"fmt"
	"strconv"
	"time"
)

func Time2ReadableString(t time.Time) string {
	now := time.Now().Local()
	intv := now.Unix() - t.Unix()
	if intv < 60 {
		return strconv.FormatInt(intv, 10) + " seconds ago"
	}

	if intv < 3600 {
		return strconv.FormatInt(intv/60, 10) + " minutes ago"
	}

	if intv < 86400 {
		return strconv.FormatInt(intv/3600, 10) + " hours ago"
	}

	y1, m1, d1 := now.Date()
	y2, m2, d2 := t.Date()
	h, m, _ := t.Clock()
	if (y1 == y2) && (m1 == m2) && (d1-d2 == 1) { // 昨天
		return fmt.Sprintf("yestoday %02d:%02d", h, m)
	}

	return Time2EnglishString(t)
}

func Time2String(t time.Time) string {
	return t.Format("2006-01-02 15:04:05.999")
}

var months = map[int]string{
	1:  "Jan",
	2:  "Feb",
	3:  "Mar",
	4:  "Apr",
	5:  "May",
	6:  "Jun",
	7:  "Jul",
	8:  "Aug",
	9:  "Sep",
	10: "Oct",
	11: "Nov",
	12: "Dec",
}

func Time2EnglishString(t time.Time) string {
	now := time.Now()
	// 检查是否是同一年
	y, m, d := t.Date()
	if now.Year() == y {
		return fmt.Sprintf("%s %d", months[int(m)], d)
	}

	return fmt.Sprintf("%s %d,%d", months[int(m)], d, y)
}
