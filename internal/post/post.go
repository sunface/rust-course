package post

import "strings"

// 空格先行分割
//1.数字和英文字母 遇到2类字符或者空格计数一
//2.其余字符计数一

// 这段代码因为考虑各种情况，略复杂，后续我会整理下
// @todo
func countWords(md string) int {
	mds := strings.Split(md, " ")

	count := 0
	//上一个字符是否是特殊字符(非英文字母和数字)
	special := false
	lastCountSpecial := false
	var last rune
	var old rune
	isfirst := false
	for _, words := range mds {
		last = rune(0)
		special = false
		lastCountSpecial = false
		isfirst = true
		for _, r := range words {
			if special {
				//如果上一个字符是特殊字符，那么当前字符无论是什么，都计数+1
				count++
				lastCountSpecial = true
			} else {
				//如果是首字符，+1
				if isfirst {
					count++
				} else {
					//如果上一个字符不是特殊字符，那么当前字符必须是特殊字符才能计数+1，否则认为是连续的
					if !isNumber(r) && !isAlpha(r) {
						count++
					}
				}

				if isNumber(r) || isAlpha(r) {
					lastCountSpecial = false
				}
			}
			//判断当前字符是否是特殊字符
			special = !isNumber(r) && !isAlpha(r)
			old = last
			last = r
			isfirst = false
		}
		//如果当前非特殊字符是最后一个字符，那么计数+1
		if !special && lastCountSpecial && (isNumber(old) || isAlpha(old)) {
			count++
		}

	}

	return count
}

func isNumber(c rune) bool {
	if c >= 48 && c <= 57 {
		return true
	}
	return false
}

func isAlpha(c rune) bool {
	if (c >= 65 && c <= 90) || (c >= 97 && c <= 122) {
		return true
	}
	return false
}
