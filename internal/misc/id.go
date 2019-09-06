package misc

import (
	"fmt"

	"github.com/sony/sonyflake"
)

// IDGen generate ditrubuted unique id
var IDGen *sonyflake.Sonyflake

func init() {
	var st sonyflake.Settings
	IDGen = sonyflake.NewSonyflake(st)
}

// GenID return a hex number string
func GenID() string {
	id, _ := IDGen.NextID()
	return fmt.Sprintf("%x", id)
}
