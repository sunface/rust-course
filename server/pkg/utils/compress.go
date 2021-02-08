package utils

import "github.com/golang/snappy"

func Compress(s string) []byte {
	encoded := snappy.Encode(nil, []byte(s))
	return encoded
}

func Uncompress(b []byte) ([]byte, error) {
	return snappy.Decode(nil, b)
}
