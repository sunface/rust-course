package utils

import (
	"encoding/base64"
	"strings"

	"github.com/gosimple/slug"
)

func Slugify(raw string) string {
	s := slug.Make(strings.ToLower(raw))
	if s == "" {
		// If the raw name is only characters outside of the
		// sluggable characters, the slug creation will return an
		// empty string which will mess up URLs. This failsafe picks
		// that up and creates the slug as a base64 identifier instead.
		s = base64.RawURLEncoding.EncodeToString([]byte(raw))
		if slug.MaxLength != 0 && len(s) > slug.MaxLength {
			s = s[:slug.MaxLength]
		}
	}
	return s
}
