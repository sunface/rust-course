package post

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo"
	"github.com/thinkindev/im.dev/internal/misc"
	"github.com/thinkindev/im.dev/internal/user"
	"github.com/thinkindev/im.dev/internal/utils"
)

// Preview return the new review html of article
func Preview(c echo.Context) error {
	render := c.FormValue("render")

	newr := modify(render)
	return c.JSON(http.StatusOK, misc.HTTPResp{
		Data: newr,
	})
}

/* modify the post content*/

// every user input need to be modified
// @user -> <a href="UserPage">@user</a>
// remove js,iframe such html tags and attributes
func modify(s string) string {
	// The policy can then be used to sanitize lots of input and it is safe to use the policy in multiple goroutines
	render := misc.Sanitizer.Sanitize(s)
	afterRender := make([]rune, 0, len(render))
	idParseFlag := false
	tempName := make([]rune, 0)
	for _, r := range render {
		if r == '@' {
			idParseFlag = true
			afterRender = append(afterRender, r)
			continue
		}
		if idParseFlag {
			if utils.ValidNameRune(r) {
				tempName = append(tempName, r)
			} else {
				// end flag for parse name
				idParseFlag = false

				// check name exist
				if user.CheckUserExist(string(tempName)) {
					// converse @name -> <a href="UserPage">@user</a>
					afterRender = append(afterRender, []rune(fmt.Sprintf("<a href='http://localhost:9532/%s'>%s</a>", string(tempName), string(tempName)))...)
				} else {
					afterRender = append(afterRender, tempName...)
				}

				afterRender = append(afterRender, r)
			}
			continue
		}

		afterRender = append(afterRender, r)
	}
	return string(afterRender)
}
