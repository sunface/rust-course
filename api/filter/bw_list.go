package filter

import (
	"fmt"

	"github.com/mafanr/juz/api/req"
	"github.com/mafanr/juz/misc"
)

/*
黑白名单
*/

func (f *Filter) checkBW(r *req.Request) error {
	if r.BwStrategy == nil || r.BwStrategy.Type == 0 {
		return nil
	}

	inList := false
	var k, v string
	for _, bw := range r.BwStrategy.BwList {
		if bw.Type == misc.IP_TYPE {
			// IP类型
			if bw.Val == r.ClientIP {
				inList = true
				k = bw.Key
				v = bw.Val
				break
			}
		} else {
			// 参数类型
			v, ok := r.Params[bw.Key]
			if ok && v == bw.Val {
				inList = true
				k = bw.Key
				v = bw.Val
				break
			}
		}
	}

	if r.BwStrategy.Type == misc.BLACK_LIST {
		if inList { // 在黑名单上
			return fmt.Errorf("Black list：%s, user %s is blocked", k, v)
		}
		return nil
	}
	if inList { // 在白名单上
		return nil
	}
	return fmt.Errorf("White list: %s, user %s is blocked", k, v)

}
