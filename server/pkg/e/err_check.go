package e

import "strings"

func IsErrUniqueConstraint(err error) bool {
	if strings.Contains(err.Error(), "UNIQUE") {
		return true
	}

	return false
}
