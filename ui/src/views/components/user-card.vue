<template>
  <div  class="user-card padding-10"  :style="{'border': '1px solid ' + user.text_color,'box-shadow':'1px 1px 0px ' +user.text_color }"> 
      <div>  
        <el-avatar
            :src="user.avatar"
            slot="reference"
            class="display-inline-block vertical-align-middle cursor-pointer"
            @click.native="userHome"
          ></el-avatar>
        <router-link  :to="'/' + user.name" class="position-absolute margin-left-10 font-weight-500 cursor-pointer text-decoration-none">{{user.nickname}}</router-link>
        <router-link  :to="'/' + user.name"  class="position-absolute margin-top-25 margin-left-10 font-size-14 cursor-pointer text-decoration-none">@{{user.name}}</router-link >
      </div>
      <div class="margin-top-15 margin-left-10" v-html="user.about" v-if="user.about!='' && user.about!=undefined">
      </div>
       <div class="text-align-center padding-top-10 padding-bottom-10 font-weight-bold border-radius-3 cursor-pointer margin-top-10" :style="{'background-color':user.bg_color,'color':followColor()}">FOLLOW</div>
       
       <div class="margin-top-10 margin-left-10" v-if="user.website!='' && user.website!=undefined">
          <div class="color-regular font-weight-500">website</div>
          <div>{{user.website}}</div>
       </div>

       <div class="margin-top-10 margin-left-10" v-if="user.employer!='' && user.employer!=undefined">
          <div class="color-regular font-weight-500">work</div>
          <div v-html="user.employer"></div>
       </div>

        <div class="margin-top-10 margin-left-10" v-if="user.education!='' && user.education!=undefined">
          <div class="color-regular font-weight-500">education</div>
          <div v-html="user.education"></div>
       </div>
       <el-divider></el-divider>
       <el-row  class="margin-top-10 padding-left-10 padding-right-10">
          <el-col :span="12">
            <div class="color-regular font-weight-500">location</div>
            <div><i class="el-icon-location" :style="{color:user.text_color}"></i><span class="font-size-14">{{user.location}}</span></div>
          </el-col>
          <el-col :span="12">
            <div class="color-regular font-weight-500">joined</div>
            <div><i class="el-icon-date margin-right-5" :style="{color:user.text_color}"></i><span class="font-size-14">{{user.create_date}}</span></div>
          </el-col>
       </el-row>
  </div>
</template>

<script>
import request from "@/utils/request";
export default {
  props: ['user'],
  data() {
    return {
    };
  },
  watch: {
  },
  methods: {
    followColor() {
      if (this.user.bg_color == '#000' && this.user.text_color=='#000') {
        return '#fff'
      }
      return this.user.text_color
    },
    userHome() {
      this.$router.push('/' + this.user.name)
    }
  },
  mounted() {
  }
};
</script>
