package utils

import (
	"strings"
	"unsafe"

	"github.com/labstack/echo"
)

// Bytes2String see below
func Bytes2String(b []byte) (s string) {
	return *(*string)(unsafe.Pointer(&b))
	// pb := (*reflect.SliceHeader)(unsafe.Pointer(&b))
	// ps := (*reflect.StringHeader)(unsafe.Pointer(&s))
	// ps.Data = pb.Data
	// ps.Len = pb.Len
	// return
}

// String2Bytes zero-coy, string类型转为[]byte
// 注意，这种做法下，一旦string变化，程序立马崩溃且不能recover
// 谨慎，黑科技！！除非性能瓶颈，否则请使用[]byte(s)
func String2Bytes(s string) (b []byte) {
	return *(*[]byte)(unsafe.Pointer(&s))
	// pb := (*reflect.SliceHeader)(unsafe.Pointer(&b))
	// ps := (*reflect.StringHeader)(unsafe.Pointer(&s))
	// pb.Data = ps.Data
	// pb.Len = ps.Len
	// pb.Cap = ps.Len
	// return
}

// ValidNameRune check a rune is valid for a name format
func ValidNameRune(c rune) bool {
	// only a-z A-Z - is valid
	if (c >= 97 && c <= 122) || (c >= 65 && c <= 90) || c == 95 {
		return true
	}
	return false
}

// FormValue get value from http form
func FormValue(c echo.Context, k string) string {
	return strings.TrimSpace(c.FormValue(k))
}
