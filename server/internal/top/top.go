package top

import (
	"context"
	"fmt"
	"strconv"
	"strings"
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
		if count > 1 {
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

func RemoveGlobalTop(storyID string) {
	hots := make([]string, 0)

	hots = append(hots, GlobalPrefix+TopYear)
	hots = append(hots, GlobalPrefix+TopMonth)
	hots = append(hots, GlobalPrefix+TopWeek)
	hots = append(hots, GlobalPrefix+TopRecent)

	ctx := context.Background()
	for _, hot := range hots {
		err := db.Redis.ZRem(ctx, hot, storyID).Err()
		if err != nil {
			logger.Warn("update hot error", "error", err, "key", hot, "storyID", storyID)
			continue
		}
	}
}

func RemoveTagTop(storyID string) {
	ts, _, err := models.GetTargetTags(storyID)
	if err != nil {
		logger.Warn("get tags error", "error", err)
		return
	}

	hots := make([]string, 0)

	for _, tag := range ts {
		hots = append(hots, fmt.Sprintf(TagFormat, tag, TopYear))
		hots = append(hots, fmt.Sprintf(TagFormat, tag, TopMonth))
		hots = append(hots, fmt.Sprintf(TagFormat, tag, TopWeek))
		hots = append(hots, fmt.Sprintf(TagFormat, tag, TopRecent))
	}

	ctx := context.Background()
	for _, hot := range hots {
		err = db.Redis.ZRem(ctx, hot, storyID).Err()
		if err != nil {
			logger.Warn("update hot error", "error", err, "key", hot, "storyID", storyID)
			continue
		}
	}
}

func GetTopList(key string, start, end int64) []string {
	ids := make([]string, 0)
	ctx := context.Background()
	keys, err := db.Redis.ZRevRange(ctx, key, start, end-1).Result()
	if err != nil {
		logger.Warn("scan top list error", "error", err, "key", key)
		return ids
	}

	for _, key := range keys {
		ids = append(ids, key)
	}

	return ids
}

func Init() {
	// 检查是否凌晨
	for {
		now := time.Now()
		if now.Local().Hour() == 0 {
			break
		}

		time.Sleep(1 * time.Hour)
	}

	// 从凌晨开始，每隔24小时检查一次
	for {

		ctx := context.Background()
		keys := []string{GlobalPrefix + TopYear, GlobalPrefix + TopMonth, GlobalPrefix + TopWeek, GlobalPrefix + TopRecent}
		tags, _ := models.GetTags()
		for _, tag := range tags {
			keys = append(keys, fmt.Sprintf(TagFormat, tag, TopYear))
			keys = append(keys, fmt.Sprintf(TagFormat, tag, TopMonth))
			keys = append(keys, fmt.Sprintf(TagFormat, tag, TopWeek))
			keys = append(keys, fmt.Sprintf(TagFormat, tag, TopRecent))
		}

		now := time.Now()
		for _, k := range keys {
			var maxDuration float64
			if strings.HasSuffix(k, TopYear) {
				maxDuration = 365 * 24
			}
			if strings.HasSuffix(k, TopMonth) {
				maxDuration = 30 * 24
			}
			if strings.HasSuffix(k, TopWeek) {
				maxDuration = 7 * 24
			}
			if strings.HasSuffix(k, TopRecent) {
				maxDuration = 2 * 24
			}

			iter := db.Redis.ZScan(ctx, k, 0, "", 0).Iterator()
			for iter.Next(ctx) {
				id := iter.Val()
				_, err := strconv.Atoi(id)
				if err == nil {
					//若是数字，则是score，跳过
					continue
				}

				created := models.GetStoryCreated(id)
				if now.Sub(created).Hours() > maxDuration {
					err = db.Redis.ZRem(ctx, k, id).Err()
					if err != nil {
						logger.Warn("delete top error", "error", err, "key", k, "storyID", id)
					}
				}
			}
		}
		time.Sleep(24 * time.Hour)
	}
}

func RemoveTag(tagID string) error {
	hots := make([]string, 0)

	hots = append(hots, fmt.Sprintf(TagFormat, tagID, TopYear))
	hots = append(hots, fmt.Sprintf(TagFormat, tagID, TopMonth))
	hots = append(hots, fmt.Sprintf(TagFormat, tagID, TopWeek))
	hots = append(hots, fmt.Sprintf(TagFormat, tagID, TopRecent))

	ctx := context.Background()
	for _, hot := range hots {
		err := db.Redis.Del(ctx, hot).Err()
		if err != nil {
			logger.Warn("delete top error", "error", err, "key", hot, "tag_id", tagID)
			return err
		}
	}

	return nil
}
