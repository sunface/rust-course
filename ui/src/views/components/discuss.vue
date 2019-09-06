<template>
  <div  class="discuss" style="padding:20px">
      <div class="write-comment">
        <editor placeholder="Add to the discussion" editorHeight="200px"  parent="discuss" :md="tempComment.md" @discussSetMD="discussSetMD" v-if="!commentPreviewd"></editor>
        <render  :content="tempComment.render" style="height:300px;overflow-y:auto;background:white;" v-else></render>
        <div class="float-right margin-top-5">
            <el-button size="medium" class="border-ellipse background-grey" @click="previewComment" v-if="!commentPreviewd">PREVIEW</el-button>
             <el-button size="medium" class="border-ellipse background-grey" @click="commentPreviewd=false" v-else>MARKDOWN</el-button>

            <el-button type="primary" size="medium" class="border-ellipse" @click="publishComment">PUBLISH</el-button>
        </div>
      </div>

      <div class="comments">
          <div class="comment margin-top-40" v-for="c in comments" :key="c.id" style="border-left:2px solid #ccc;padding-left:10px;">
              <div><i class="el-icon-caret-top" style="position:absolute;"></i></div>
              <div><i class="el-icon-caret-bottom" style="position:absolute;top:26px;right:25px"></i></div>
            
              <div>{{c.unickname}} {{c.date}}</div>
              <render  :content="c.render"></render>
              <div>reply</div>
           
          </div>
      </div>
  </div>
</template>

<script>
import editor from "./editor"
import render from "./render"
import request from "@/utils/request";
export default {
  props: ['postID','postType'],
  components: {editor,render},
  data() {
    return {
        tempComment: {
            md : '',
            render: ''
        },
        tempCommentRender: '',
        commentPreviewd : false,

        comments: []
    };
  },
  watch: {
  },
  methods: {
      publishComment() {
        this.tempComment.render = this.tempCommentRender
        request({
            url: "/web/post/comment",
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
      }
  },
  mounted() {
    request({
        url: "/web/post/queryComments",
        method: "GET",
        params: {
            post_id: this.postID,
        }
    }).then(res => {
        this.comments = res.data.data 
        console.log(this.comments)
    });
  }
};
</script>

<style lang="less">
</style>