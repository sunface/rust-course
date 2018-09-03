package filter

import (
	"fmt"
	"regexp"

	"github.com/mafanr/juz/api/req"
	"github.com/mafanr/juz/misc"
)

/*
对用户请求的参数进行验证
*/

func (f *Filter) verifyParam(r *req.Request) error {
	if r.Api.VerifyOn == misc.PARAM_VERIFY_OFF {
		return nil
	}

	for k, v := range r.Params {
		regI, ok := r.Api.ParamRules.Load(k)
		if !ok {
			continue
		}
		reg := regI.(*regexp.Regexp)
		if !reg.MatchString(v) { // 参数不合法
			return fmt.Errorf("param %s,value %s, verify failed", k, v)
		}
	}

	return nil
}
