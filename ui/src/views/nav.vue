<template>
  <div>
        <transition name="fade" >
    <el-row v-show="toTop" :class="{'nav':'true','inTop':inTop,'toTop': toTop}" type="flex" align="middle">
      <el-col
        :xs="{span:4}"
        :sm="{span:7,offset:1}"
        :md="{span: 2,offset:1}"
        :lg="{ span: 2, offset: 2 }"
      >
        <router-link to="/"><img src="../assets/logo.png" class="hover-cursor" style="height:45px" /></router-link>
      </el-col>
      <el-col
        :xs="{span:10,offset:4}"
        :sm="{span:8}"
        :md="{span: 4}"
        :lg="{ span: 6,offset:2}"
        class
      >
        <el-input
          v-model="searchContent"
          prefix-icon="el-icon-search"
          :placeholder="$t('nav.navSearchHolder')"
          size="medium"
        ></el-input>
      </el-col>

      <el-col :span="10">
        <span class="float-right">
         <el-popover placement="bottom" trigger="hover" class="margin-right-20">
            <el-form label-width="100px">
              <el-form-item :label="$t('nav.setLang')">
                <el-radio-group v-model="currentLang" size="medium" @change="changeLang">
                  <el-radio-button label="en">English</el-radio-button>
                  <el-radio-button label="zh">Chinese</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="$t('nav.setTheme')">
                <el-select
                  v-model="currentTheme"
                  placeholder="theme.."
                  size="medium"
                  style="width:150px"
                   :popper-append-to-body="false"
                  @change="changeTheme"
                >
                  <el-option label="Light" value="light"></el-option>
                  <el-option label="Dark" value="dark"></el-option>
                </el-select>
              </el-form-item>

              <el-form-item :label="$t('nav.readingLang')">
                <el-select
                  v-model="currentReadingLang"
                  placeholder="Reading Lang.."
                  size="medium"
                  style="width:200px"
                  multiple
                  :popper-append-to-body="false"
                  @change="changeReadingLang"
                >
                  <el-option  v-for="o in langOptions" :key="o.label" :label="o.label" :value="o.value"></el-option>
                </el-select>
              </el-form-item>
            </el-form>
            <i class="el-icon-more-outline hover-cursor" slot="reference"></i>
          </el-popover>
          <router-link
            v-if="this.$store.state.user.token!=''"
            to="/dev/article/new"
            class="margin-right-20"
            style="text-decoration:none;color:black;background:#66e2d5;padding:2px 12px;border:2px solid #0a0a0a;border-radius:3px;font-weight:bold;font-size:14px"
          >WRITE A POST</router-link>
          <el-button
            v-if="this.$store.state.user.token==''"
            type="primary"
            @click="signInModalVisible=true"
          >{{$t('nav.signIn')}}</el-button>
          <!-- <img v-else :src="this.$store.state.user.avatar" style="height:45px;display:inline-block;vertical-align:middle" /> -->
          <el-popover v-else placement="bottom" trigger="hover" >
            <div class="user-panel font-size-18">
                <div>@{{this.$store.state.user.name}}</div>
                <el-divider></el-divider>
                <div>Dashboard</div>
                <div class="margin-top-5">Write a Post</div>
                <div class="margin-top-5">Reading List</div>
                <div class="margin-top-5">Settings</div>
                <el-divider></el-divider>
                <div>About im.dev</div>
                <el-divider></el-divider>
                <div @click.stop="signOut">Sign Out</div>
            </div>
            <el-avatar
              :src="this.$store.state.user.avatar"
              slot="reference"
              class="middle-inline hover-cursor"
            ></el-avatar>
          </el-popover>
        </span>
      </el-col>
    </el-row>
    </transition>
    <router-view class="main-view" style="padding-top:60px"></router-view>

    <el-dialog class="white-bg-modal sign-in-modal" :visible.sync="signInModalVisible">
      <el-row class="sign-in-panel text-align-center padding-top-20 padding-bottom-20">
        <el-col :span="10" :offset="7">
          <h2 class="padding-top-20">{{$t('nav.signInTitle')}}</h2>
          <p class="padding-top-10">{{$t('nav.whySignIn')}}</p>
          <div class="padding-top-20">
            <el-button type="primary" icon="el-icon-github" @click="signIn">Sign in with Github</el-button>
          </div>
          <p class="padding-top-20">{{$t('nav.signInFooter')}}</p>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template> 
 
<script>
import request from "@/utils/request";
import langOptions from "@/utils/data"
export default {
  name: "Nav",
  data() {
    return {
      theme: this.$store.state.misc.theme,
      searchContent: "",

      signInModalVisible: false,

      currentLang: this.$store.state.misc.lang,
      currentReadingLang: this.$store.state.misc.readingLang,
      currentTheme: this.$store.state.misc.theme,

      // nav fixed to top
      scrollTop: 0,
      toTop : true,
      topCount : 0,
      inTop : true,
      langOptions: langOptions
    };
  },
  watch: {
    "$store.state.misc.needSignin"() {
        this.signInModalVisible = true    
    },
    "$store.state.misc.navFixed"() {
       if (this.$store.state.misc.navFixed) {
          window.removeEventListener('scroll', this.handleScroll);
          this.inTop = true
          this.toTop = true 
       } else {
          window.addEventListener('scroll', this.handleScroll);
       }
    },
  },
  computed: {},
  methods: {
    signOut() {
        this.$store.dispatch('SignOut')
    },
    signIn() {
      request({
        url: "/web/signIn",
        method: "POST",
        params: {}
      }).then(res => {
        this.$store.dispatch("SetUserInfo", res.data.data).then(() => {
          this.signInModalVisible = false;
        });
      });
    },
    changeReadingLang(val) {
        this.$store.dispatch("setReadingLang", val);
         window.location.reload();
    },
    changeLang(val) {
      this.$store.dispatch("setLang", val);
      this.$i18n.locale = val;
       window.location.reload();
    },
    changeTheme(val) {
      this.$store.dispatch("setTheme", val);
      window.location.reload();
    },
    loadTheme() {
      // 全局范围加载通用样式，每个vue page里无需重复引入
      if (this.theme == "light") {
        require("!style-loader!css-loader!less-loader!../theme/light/layout.less");
        require("!style-loader!css-loader!less-loader!../theme/light/style.less");
      } else {
        require("!style-loader!css-loader!less-loader!../theme/dark/layout.less");
        require("!style-loader!css-loader!less-loader!../theme/dark/style.less");
      }
    },
    handleScroll: function(e) {
        var y = window.scrollY 
        if (y <1) {
            if (!this.inTop){
                this.inTop = true
            }
            
        } else {
            if (this.inTop) {
                this.inTop = false
            }       
        }
        if (y- this.scrollTop < 0) {
            if (!this.toTop) {
                // 非连续向上滚动两次，展示导航栏\
                this.topCount = this.topCount + 1
                if (this.topCount >= 9) {
                    this.toTop = true
                    this.topCount = 0
                }

            }
        } else {
            if (window.scrollY < 30) {
                return 
            }
            this.toTop = false
            this.topCount = 0
        }
        this.scrollTop = y
        
    }
  },
  mounted() {
    this.loadTheme();
    // window.addEventListener('scroll', this.handleScroll);
  }
};
</script>

 
 <style lang="less">
@import "../theme/light/var.less";
.sign-in-modal {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 0 0;
    padding-bottom: 40px;
  }
  .sign-in-panel {
    height: 100%;
    background: url(../assets/login.png) no-repeat;
    background-size: 100%;
  }
}
.user-panel {
    .el-divider {
        margin: 13px 0;
    }
    div {
        cursor:pointer;
        padding-left:10px
    }
}
.fade-enter-active, .fade-leave-active {
  transition: all .6s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
//   opacity: 0;
   transform: translateY(-50px);
}

 .fade-leave-active ,.fade-enter-active{
  transition: all .4s;
}
</style>

<style lang="less" scoped>
.nav {
   top: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0);
    position: fixed; 
   
    // box-shadow: rgba(0, 0, 0, 0.0470588) 0px 4px 12px 0px;
    padding-top:8px;
    padding-bottom:4px;
}
 .nav.toTop {
    position: fixed;
   box-shadow: rgba(0, 0, 0, 0.0470588) 0px 4px 12px 0px;
    background-color: white;
        z-index: 999;
    // transition:transform 300ms ease;
    //     transform: translateY(100px)
  }
.nav.inTop {
    box-shadow: rgba(0, 0, 0, 0.0470588) 0px 4px 12px 0px;;
    z-index: 1;
}
</style>