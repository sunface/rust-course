<template>
  <div  class="discuss" style="padding:20px">
      <!-- comment editor -->
      <div class="write-comment" style="border-bottom:1px solid #eee">
        <editor placeholder="Add to the discussion" editorHeight="200px"  parent="discuss" :md="tempComment.md" @discussSetMD="discussSetMD" v-if="!commentPreviewd"></editor>
        <render paddingTop="46px" paddingLeft="20px" :content="tempComment.render" style="height:200px;overflow-y:auto;background:white;" v-else></render>
        <span style="position:relative;float:right;margin-top:-190px;z-index:1000;margin-right:20px">
            <span class="bold-meta-word hover-cursor" @click="previewComment" v-if="!commentPreviewd">PREVIEW</span>
             <span class="bold-meta-word hover-cursor" @click="commentPreviewd=false" v-else>MARKDOWN</span>

            <span  class="bold-meta-word hover-cursor margin-left-10" @click="publishComment">PUBLISH</span>
        </span>
      </div>    
     <div class="sorter">SORT BY <span>BEST</span></div>
      <div class="comments" v-if="comments.length>0" style="padding-bottom:30px;">
          <div class="comment margin-top-30" v-for="c in comments" :key="c.id" :style="{'margin-left':c.depth * 23 + 'px'}">  
            <i class="iconfont icon-jiantou_shang hover-cursor upvote" :class="{'vote-highlighted':c.liked==1}" @click="upvoteComment(c)"></i>
            <i class="iconfont icon-jiantou_xia hover-cursor downvote" :class="{'vote-highlighted':c.liked==2}"  @click="downvoteComment(c)"></i>

            <div class="header">
               <router-link class="uname" :to="`/${c.uname}`" v-if="c.status==0">{{c.unickname}}</router-link>
               <span v-else>[deleted]</span>
               <span class="margin-left-5 date-agree">{{c.likes}} agreed &nbsp;·&nbsp; {{c.date}} &nbsp; <i v-if="c.edit_date!=undefined">·&nbsp;edited {{c.edit_date}}</i></span>   
            </div>
            
              <!-- edit reply editor -->
            <div class="write-comment reply-comment  margin-top-10" v-if="currentEditCommentID == c.id">
                <editor  editorHeight="150px"  parent="discuss"  :toolbarsShow="false" :md="tempEditReply.md" @discussSetMD="editReplySetMD"></editor>
            </div>
            <!-- body and footer, hide when editing -->
              <render  :content="c.render" class="body" v-else></render>
              <div class="footer">
                <span v-if="currentEditCommentID != c.id">
                    <span class="hover-cursor" @click="reply(c.id)" v-if="c.status!=1">Reply</span> 
                    <span class="hover-cursor  margin-left-5 margin-right-10" v-if="$store.state.user.id==c.uid && c.status!=1" @click="editReply(c)">Edit</span> 
                    <el-dropdown placement="bottom-start" v-if="$store.state.user.id==c.uid">
                        <span class="el-dropdown-link">
                            <i class="el-icon-more hover-cursor"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item @click.native="deleteComment(c.id)" v-show="c.status!=1"><i class="el-icon-delete" ></i>Delete comment</el-dropdown-item>
                            <el-dropdown-item @click.native="revertComment(c.id)" v-show="c.status==1"><i class="iconfont icon-undo"></i>Revert comment</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                  
                        
                    <span v-if="currentCommentID == c.id" class="float-right">
                        <span  class="hover-cursor" @click="previewReply" v-if="!replyPreviewd">Preview</span>
                        <span class="hover-cursor" @click="replyPreviewd=false" v-else>Markdown</span>

                        <span  class=" hover-cursor margin-left-5" @click="publishReply(c.id)">Publish</span>
                    </span>
                </span>    
                 <span v-else class="float-right">
                    <span  class=" hover-cursor margin-left-5" @click="cancelEditReply">Cancel</span>
                    <span  class=" hover-cursor margin-left-5" @click="publishEditReply(c.id)">Publish</span>
                </span>    
              </div>
               <!-- reply editor -->
               <div class="write-comment reply-comment  margin-top-10" v-if="currentCommentID == c.id">
                    <editor placeholder="Add to the discussion" editorHeight="150px"  parent="discuss"  :toolbarsShow="false" :md="tempReply.md" @discussSetMD="replySetMD" v-if="!replyPreviewd"></editor>
                    <render  :content="tempReply.render" style="height:150px;overflow-y:auto;background:white;" v-else></render>
              </div>
          </div>
      </div>
      <div v-else style="text-align:center;padding-top:40px;padding-bottom:40px;">
          <i class="iconfont icon-comments-alt" style="color:rgba(0, 121, 211, 0.4);font-size: 30px" />
          <div class="meta-word margin-top-20" style="font-size:18px">No Comments Yet</div>
          <div class="meta-word margin-top-15" style="font-size:15px">Be the first to share what you think!</div>
      </div>
  </div>
</template>

<script>
import editor from "./editor"
import render from "./render"
import request from "@/utils/request";
export default {
  props: ['postAuthorID','postID','postType'],
  components: {editor,render},
  data() {
    return {
        tempComment: {
            md : '',
            render: ''
        },
        tempCommentRender: '',
        commentPreviewd : false,

        comments: [],
        currentCommentID: '',

        tempReply: {
            md:'',
            render: ''
        },
        replyPreviewd : false,
        tempReplyRender: '',

        currentEditCommentID: '',
        tempEditReply: {
            md: '',
            render: ''
        }
    };
  },
  watch: {
    "$store.state.user.id"() {
       if (this.$store.state.user.id != '') {
           this.initComments()
       } 
    },
  },
  methods: {
       revertComment(id) {
           request({
                url: "/web/comment/revert",
                method: "POST",
                params: {
                    id: id
                }
            }).then(res => {
                for (var i=0;i<this.comments.length;i++) {
                    if (this.comments[i].id == id) {
                       this.comments[i].md = res.data.data.md 
                       this.comments[i].render = res.data.data.render 
                       this.comments[i].uname = res.data.data.uname 
                       this.comments[i].unickname = res.data.data.unickname
                       this.comments[i].status = 0
                    }
                }
            });
       },
       deleteComment(id) {
        this.$confirm('Are you sure you want to delete your comment?', 'Delete comment', {
            confirmButtonText: 'DELETE',
            cancelButtonText: 'Cancel',
            type: 'warning',
            center: true
        }).then(() => {
            request({
                url: "/web/comment/delete",
                method: "POST",
                params: {
                    id: id
                }
            }).then(res => {
                for (var i=0;i<this.comments.length;i++) {
                    if (this.comments[i].id == id) {
                       this.comments[i].status= 1
                       this.comments[i].md = '[Deleted]'
                       this.comments[i].render = '[Deleted]'
                    }
                }
            });
        }).catch(() => {
        });
       },
       upvoteComment(c) {
           request({
            url: "/web/comment/like",
            method: "POST",
            params: {
                id: c.id
            }
        }).then(res => {
            if (c.liked == 0) {
                c.liked = 1
                c.likes++
            } else if (c.liked == 1) {
                c.liked = 0
                c.likes --
            } else {
                c.liked = 1
                c.likes = c.likes + 2
            }
        });
       },
        downvoteComment(c) {
           request({
            url: "/web/comment/dislike",
            method: "POST",
            params: {
                id: c.id
            }
        }).then(res => {
            if (c.liked == 0) {
                c.liked = 2
                c.likes--
            } else if (c.liked == 1) {
                c.liked = 2
                c.likes = c.likes - 2
            } else {
                c.liked = 0
                c.likes ++
            }
        });
       },
       previewReply() {
        this.replyPreviewd = true
        request({
            url: "/web/post/preview",
            method: "POST",
            params: {
                render: this.tempReplyRender
            }
        }).then(res => {
            this.tempReply.render = res.data.data
        });
      },
      editReplySetMD(md,render) {
          this.tempEditReply.md = md
          this.tempEditReply.render = render
      },
      replySetMD(md,render) {
          this.tempReply.md = md 
          this.tempReplyRender = render
      },
      cancelEditReply() {
        for (var i=0;i<this.comments.length;i++) {
            if (this.comments[i].id == this.currentEditCommentID) {
                if (this.comments[i].md != this.tempEditReply.md) {
                     this.$confirm('Are you sure that you want to discard your changes?', 'Cancel Edit', {
                        confirmButtonText: 'Discard',
                        cancelButtonText: 'Keep',
                        type: 'warning',
                        center: true
                    }).then(() => {
                        this.currentEditCommentID = ''
                        this.tempEditReply.md = ''
                    }).catch(() => {
                    });
                } else {
                    this.currentEditCommentID = ''
                    this.tempEditReply.md = ''
                }
                break
            }
        }
      },
      editReply(c) {
          this.currentEditCommentID = c.id
          this.currentCommentID = ''
          this.tempEditReply = {
            md: c.md,
            render: ''
        }
      },
      reply(id) {
          if (id == this.currentCommentID) {
              this.currentCommentID = ''
              return 
          }
          this.currentCommentID = id
          this.currentEditCommentID = ''
      },
      publishEditReply(id) {
          request({
                url: "/web/comment/edit",
                method: "POST",
                params: {
                    id: id,
                    content: JSON.stringify(this.tempEditReply)
                }
            }).then(res => {
                this.currentEditCommentID = ''
                for (var i=0;i<this.comments.length;i++) {
                    if (this.comments[i].id == id) {
                        this.comments[i].md = this.tempEditReply.md
                        this.comments[i].render = this.tempEditReply.render
                    }
                }
                this.tempEditReply =  {
                    md: '',
                    render: ''
                }
            });
      },
      publishReply(id) {
        this.tempReply.render = this.tempReplyRender
        request({
            url: "/web/comment/reply",
            method: "POST",
            params: {
                pid: id,
                post_id: this.postID,
                post_type: this.postType,
                content: JSON.stringify(this.tempReply)
            }
        }).then(res => {
            this.tempReply =  {
                md : '',
                render: ''
            }
            this.tempReplyRender = ''   
            this.replyPreviewd = false
            this.currentCommentID = ''
            var newComments = []
            for (var i=0;i<this.comments.length;i++) {
                newComments.push(this.comments[i])
                if (this.comments[i].id == res.data.data.pid) {
                    res.data.data.depth = this.comments[i].depth + 1
                    newComments.push(res.data.data)
                } 
            }
            this.comments = newComments
        });
      },
      publishComment() {
        this.tempComment.render = this.tempCommentRender
        request({
            url: "/web/comment/create",
            method: "POST",
            params: {
                post_id: this.postID,
                post_type: this.postType,
                content: JSON.stringify(this.tempComment)
            }
        }).then(res => {
            this.tempComment =  {
                md : '',
                render: ''
            }
            this.tempCommentRender = ''   
            this.commentPreviewd = false
            this.comments.unshift(res.data.data)
        });
      },
      previewComment() {
        this.commentPreviewd = true
        request({
            url: "/web/post/preview",
            method: "POST",
            params: {
                render: this.tempCommentRender
            }
        }).then(res => {
            this.tempComment.render = res.data.data
        });
      },
      discussSetMD(md,render) {
          this.tempComment.md = md 
          this.tempCommentRender = render
      },
      initComments() {
        request({
            url: "/web/comment/query",
            method: "GET",
            params: {
                post_id: this.postID,
            }
        }).then(res => {
            this.comments = res.data.data 
        });
      }
  },
  mounted() {
      this.initComments()
  }
};
</script>

<style lang="less">
.discuss {
    .v-note-wrapper {
        min-height: 150px !important;
        .v-note-op.shadow {
            box-shadow: none;
            border-bottom: 1px solid #efefef
        }
        textarea {
            font-size:13px !important;
        }
    }
    .reply-comment {
         .v-note-wrapper {
        border:1px solid #eee
         }
    }
 
}
</style>

<style lang="less" scoped>
.sorter {
    color:rgb(124,124,124);
    font-weight:700;
    font-size:12px;
    margin-top:30px;
    padding-bottom:5px
}
.comments {
    background:white;
    padding:5px 25px;
    margin-top:0px;
    .comment {
        i.vote-highlighted {
            color: rgb(255, 69, 0);
        }
        .upvote {
            position:absolute;
            margin-left:-21px;
            margin-top:-2px;
            color: rgb(135, 138, 140);
            font-size:10px;
        }
        .downvote {
            position:absolute;
            margin-left:-21px;
            margin-top:9px;
            color:rgb(135, 138, 140);
             font-size:10px;
        }
        .header {
            font-size:12px;
            color:rgb(124,124,124);
            .uname {
                color:rgb(0, 121, 211);
                text-decoration:none;
            }
        }
        .body {
            font-size:14px;
            margin-top:7px
        }
        .footer {
            color:rgb(135, 138, 140);
            font-weight:700;
            font-size:12px;
            margin-top:10px
        }
    }
}
</style>