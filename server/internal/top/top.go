package top

import (
	"context"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/imdotdev/im.dev/server/pkg/db"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/imdotdev/im.dev/server/pkg/models"
)

var logger = log.RootLogger.New("logger", "hot")

type HotData struct {
	Key  string
	Data *redis.Z
}

const GlobalPrefix = "im.dev-global-"
const TagFormat = "im.dev-tag-%s-%s"
const (
	TopRecent = models.FilterRecent
	TopWeek   = models.FilterWeek
	TopMonth  = models.FilterMonth
	TopYear   = models.FilterYear
)

// 更新文章的HOT列表
// 时间维度：yestoday, week, month, year,infinity
// 范围维度： 全局、Tag
func Update(storyID string, count int) {
	var created time.Time
	err := db.Conn.QueryRow("SELECT created FROM story WHERE id=?", storyID).Scan(&created)
	if err != nil {
		logger.Warn("select story created error", "error", err)
		return
	}

	tillNow := time.Now().Sub(created).Hours()
	hots := make([]*HotData, 0)

	if tillNow >= 365*24 {
		return
	}

	ts, _, err := models.GetTargetTags(storyID)
	if err != nil {
		logger.Warn("get tags error", "error", err)
		return
	}

	if tillNow < 365*24 {
		hots = append(hots, &HotData{GlobalPrefix + TopYear, &redis.Z{float64(count), storyID}})
		for _, tag := range ts {
			hots = append(hots, &HotData{fmt.Sprintf(TagFormat, tag, TopYear), &redis.Z{float64(count), storyID}})
		}
	}

	if tillNow < 30*24 {
		hots = append(hots, &HotData{GlobalPrefix + TopMonth, &redis.Z{float64(count), storyID}})
		for _, tag := range ts {
			hots = append(hots, &HotData{fmt.Sprintf(TagFormat, tag, TopMonth), &redis.Z{float64(count), storyID}})
		}
	}

	if tillNow < 7*24 {
		hots = append(hots, &HotData{GlobalPrefix + TopWeek, &redis.Z{float64(count), storyID}})
		for _, tag := range ts {
			hots = append(hots, &HotData{fmt.Sprintf(TagFormat, tag, TopWeek), &redis.Z{float64(count), storyID}})
		}
	}

	if tillNow < 2*24 {
		hots = append(hots, &HotData{GlobalPrefix + TopRecent, &redis.Z{float64(count), storyID}})
		for _, tag := range ts {
			hots = append(hots, &HotData{fmt.Sprintf(TagFormat, tag, TopRecent), &redis.Z{float64(count), storyID}})
		}
	}

	ctx := context.Background()
	for _, hot := range hots {
		if count > 0 {
			err = db.Redis.ZAdd(ctx, hot.Key, hot.Data).Err()
		} else {
			err = db.Redis.ZRem(ctx, hot.Key, hot.Data.Member).Err()
		}

		if err != nil {
			logger.Warn("update hot error", "error", err, "key", hot.Key, "score", hot.Data.Score)
			continue
		}
	}
}

func GetTopList(key string, start, end int64) []string {
	ids := make([]string, 0)
	ctx := context.Background()
	fmt.Println(start, end)
	keys, err := db.Redis.ZRevRange(ctx, key, start, end-1).Result()
	if err != nil {
		logger.Warn("scan top list error", "error", err, "key", key)
		return ids
	}

	fmt.Println(keys)
	for _, key := range keys {
		ids = append(ids, key)
	}

	return ids
}
