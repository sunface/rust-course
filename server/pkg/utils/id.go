package utils

import "github.com/lithammer/shortuuid/v3"

func GenStoryID(storyType string) string {
	u := shortuuid.New()
	return storyType + u
}
