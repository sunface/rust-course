package utils

import "github.com/lithammer/shortuuid/v3"

func GenID(idType string) string {
	u := shortuuid.New()
	return idType + u
}
