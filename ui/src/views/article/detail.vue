<template>
  <div class="article-detail">
    <el-row :gutter="20">
      <el-col
        :xs="{span:1,offset:0}"
        :sm="{span:1,offset:0}"
        :md="{span: 1,offset:2}"
        :lg="{ span: 1, offset: 2 }"
      >
        <div class="squares position-fixed z-index-100 margin-top-100">
          <div class="square font-hover-primary">
            <button id="clap" :class="{clap:true, liked: arliked}" @click="arLike">
              <span>
                <svg
                  id="clap--icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="-549 338 100.1 125"
                >
                  <path
                    d="M-471.2 366.8c1.2 1.1 1.9 2.6 2.3 4.1.4-.3.8-.5 1.2-.7 1-1.9.7-4.3-1-5.9-2-1.9-5.2-1.9-7.2.1l-.2.2c1.8.1 3.6.9 4.9 2.2zm-28.8 14c.4.9.7 1.9.8 3.1l16.5-16.9c.6-.6 1.4-1.1 2.1-1.5 1-1.9.7-4.4-.9-6-2-1.9-5.2-1.9-7.2.1l-15.5 15.9c2.3 2.2 3.1 3 4.2 5.3zm-38.9 39.7c-.1-8.9 3.2-17.2 9.4-23.6l18.6-19c.7-2 .5-4.1-.1-5.3-.8-1.8-1.3-2.3-3.6-4.5l-20.9 21.4c-10.6 10.8-11.2 27.6-2.3 39.3-.6-2.6-1-5.4-1.1-8.3z"
                  />
                  <path
                    d="M-527.2 399.1l20.9-21.4c2.2 2.2 2.7 2.6 3.5 4.5.8 1.8 1 5.4-1.6 8l-11.8 12.2c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l34-35c1.9-2 5.2-2.1 7.2-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l28.5-29.3c2-2 5.2-2 7.1-.1 2 1.9 2 5.1.1 7.1l-28.5 29.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.4 1.7 0l24.7-25.3c1.9-2 5.1-2.1 7.1-.1 2 1.9 2 5.2.1 7.2l-24.7 25.3c-.5.5-.4 1.2 0 1.7.5.5 1.2.5 1.7 0l14.6-15c2-2 5.2-2 7.2-.1 2 2 2.1 5.2.1 7.2l-27.6 28.4c-11.6 11.9-30.6 12.2-42.5.6-12-11.7-12.2-30.8-.6-42.7m18.1-48.4l-.7 4.9-2.2-4.4m7.6.9l-3.7 3.4 1.2-4.8m5.5 4.7l-4.8 1.6 3.1-3.9"
                  />
                </svg>
              </span>
            </button>
          </div>
          <div v-show="arDetail.uid==this.$store.state.user.id" class="square cursor-pointer margin-top-20">
            <a>
              <el-tooltip content="编辑文章" placement="right">
                <router-link :to="'/'+this.authorInfo.name + '/' + this.arID + '/edit'"><i class="el-icon-edit cursor-pointer"></i></router-link>
              </el-tooltip>
            </a>
          </div>

          <div class="square font-hover-primary padding-top-10">
            <el-tooltip content="加入书签" placement="right">
               <i class="el-icon-star-off cursor-pointer"></i>
            </el-tooltip>
          </div>

            <div class="square font-hover-primary padding-top-10" >
            <el-tooltip content="Discuss" placement="right">
               <a href="#discuss"><i class="el-icon-s-comment cursor-pointer"></i></a>
            </el-tooltip>
          </div>
        </div>
      </el-col>
      <el-col
        :xs="{span:22,offset:2}"
        :sm="{span:17,offset:3}"
        :md="{span: 13,offset:5}"
        :lg="{ span: 13, offset: 5 }"
      >
        <h1 class=" margin-top-30">{{arDetail.title}}</h1>
        <render :content="arDetail.render" style="min-height:400px"></render>
      </el-col>
      <el-col :span="1" >
         <UserCard class="user-card z-index-100 position-fixed margin-top-40 max-width-300" :user="authorInfo"></UserCard>
      </el-col>
    </el-row>
    
    <el-row class="discuss margin-top-40">
        <el-col
        :xs="{span:22,offset:2}"
        :sm="{span:17,offset:3}"
        :md="{span: 13,offset:5}"
        :lg="{ span: 13, offset: 5 }"
      >
         <discuss id="discuss" :postID="this.arID" postType="1" :postAuthorID="authorInfo.id"></discuss>

      </el-col>
    </el-row>
  </div>
</template>

<script>
import request from "@/utils/request";
import render from "../components/render";
import discuss from "../components/discuss";
import UserCard from "../components/user-card";

export default {
  components: { render,discuss,UserCard},
  data() {
    return {
      arID: "", // unique article id
      arDetail: {},
      bookmarked: false,
      arliked: false,
      authorInfo : {},
    };
  },
  watch: {
    $route() {
      // 当路由变化时，调用此函数
    },
  },
  computed: {},
  methods: {
      arLike() {
          this.arliked = !this.arliked
      }
  },
  beforeDestroy() {
    this.$store.dispatch("setNavFixed", true)
  },
  created() {
    this.$store.dispatch("setNavFixed", false)
    this.arID = this.$route.params.arID;
    request({
      url: "/web/article/detail",
      method: "GET",
      params: {
        article_id: this.arID
      }
    }).then(res0 => {
      request({
        url: "/web/user/card",
        method: "GET",
        params: {
            uid: res0.data.data.uid
        }
        }).then(res => {
            this.arDetail = res0.data.data;
            this.authorInfo = res.data.data
        });
    });
  },
  mounted() {
  },
};
</script>
