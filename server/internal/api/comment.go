package api

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imdotdev/im.dev/server/internal/interaction"
	"github.com/imdotdev/im.dev/server/internal/story"
	"github.com/imdotdev/im.dev/server/internal/user"
	"github.com/imdotdev/im.dev/server/pkg/common"
	"github.com/imdotdev/im.dev/server/pkg/e"
	"github.com/imdotdev/im.dev/server/pkg/models"
	"github.com/imdotdev/im.dev/server/pkg/utils"
)

func SubmitComment(c *gin.Context) {
	comment := &models.Comment{}
	c.Bind(&comment)

	comment.Md = strings.TrimSpace(comment.Md)
	if comment.Md == "" {
		c.JSON(http.StatusBadRequest, "评论内容不能为空")
		return
	}

	// check story exist
	exist := models.IdExist(comment.TargetID)
	if !exist {
		c.JSON(http.StatusNotFound, common.RespError(e.NotFound))
		return
	}

	var err *e.Error
	if comment.ID == "" { //add comment
		user := user.CurrentUser(c)
		comment.CreatorID = user.ID
		comment.ID = utils.GenID(models.IDTypeComment)
		err = story.AddComment(comment)
	} else { // update comment
		err = story.EditComment(comment)
	}

	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}

func GetStoryComments(c *gin.Context) {
	storyID := c.Param("id")
	sorter := c.Query("sorter")

	if !models.ValidSearchFilter(sorter) {
		c.JSON(http.StatusBadRequest, e.ParamInvalid)
		return
	}
	comments, err := story.GetComments(storyID, sorter)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	user := user.CurrentUser(c)
	for _, comment := range comments {
		if user != nil {
			comment.Liked = interaction.GetLiked(comment.ID, user.ID)
		}

		replies, err := story.GetComments(comment.ID, sorter)
		if err != nil {
			continue
		}

		comment.Replies = replies
		for _, reply := range replies {
			if user != nil {
				reply.Liked = interaction.GetLiked(reply.ID, user.ID)
			}
		}
	}

	c.JSON(http.StatusOK, common.RespSuccess(comments))
}

func DeleteStoryComment(c *gin.Context) {
	id := c.Param("id")
	//only admin and owner can delete comment
	comment, err := story.GetComment(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	user := user.CurrentUser(c)
	canDel := false
	if user.Role.IsAdmin() {
		canDel = true
	} else {
		if user.ID == comment.CreatorID {
			canDel = true
		}
	}

	if !canDel {
		c.JSON(http.StatusForbidden, common.RespError(e.NoPermission))
		return
	}

	err = story.DeleteComment(id)
	if err != nil {
		c.JSON(err.Status, common.RespError(err.Message))
		return
	}

	c.JSON(http.StatusOK, common.RespSuccess(nil))
}
