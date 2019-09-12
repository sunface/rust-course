<template>
  <div class="global-nav">
    <transition name="fade">
      <el-row
        v-show="toTop"
        :class="{'nav':'true','inTop':inTop,'toTop': toTop}"
        type="flex"
        align="middle"
      >
        <el-col
          :xs="{span:4}"
          :sm="{span:7,offset:1}"
          :md="{span: 2,offset:1}"
          :lg="{ span: 2, offset: 1 }"
        >
          <router-link to="/">
            <img src="../assets/logo.png" class="cursor-pointer height-45" />
          </router-link>
        </el-col>
        <el-col
          :xs="{span:10,offset:4}"
          :sm="{span:8}"
          :md="{span: 4}"
          :lg="{ span: 7,offset:2}"
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
              <el-form label-width="110px">
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
                    class="width-150"
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
                    class="width-200"
                    multiple
                    :popper-append-to-body="false"
                    @change="changeReadingLang"
                  >
                    <el-option
                      v-for="o in langOptions"
                      :key="o.label"
                      :label="o.label"
                      :value="o.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-form>
              <i class="el-icon-more-outline cursor-pointer" slot="reference"></i>
            </el-popover>
            <router-link
              v-if="this.$store.state.user.token!=''"
              to="/dev/article/new"
              class="margin-right-20 write-post"
            >WRITE A POST</router-link>
            <el-button
              v-if="this.$store.state.user.token==''"
              type="primary"
              @click="signInModalVisible=true"
            >{{$t('nav.signIn')}}</el-button>
            <el-popover v-else placement="bottom" trigger="hover" class="user-menu">
              <div class="user-panel font-size-18">
                <div><router-link class="margin-top-5 text-decoration-none color-regular" to="/dev/setting">@{{this.$store.state.user.name}}</router-link></div>
                <el-divider></el-divider>
                <div class="margin-top-5"><router-link class=" text-decoration-none color-regular" to="/dev/setting">Dashboard</router-link></div>
                <div class="margin-top-5"><router-link class=" text-decoration-none color-regular" to="/dev/setting">Write A Post</router-link></div>
                <div class="margin-top-5"><router-link class=" text-decoration-none color-regular" to="/dev/setting">Reading List</router-link></div>
                <div class="margin-top-5"><router-link class=" text-decoration-none color-regular" to="/dev/setting">Settings</router-link></div>
                <el-divider></el-divider>
                 <div><router-link class="text-decoration-none color-regular" to="/dev/setting">About im.dev</router-link></div>
                <el-divider></el-divider>
                <div class="cursor-pointer" @click.stop="signOut">Sign Out</div>
              </div>
              <el-avatar
                :src="this.$store.state.user.avatar"
                slot="reference"
                class="display-inline-block vertical-align-middle cursor-pointer"
              ></el-avatar>
            </el-popover>
          </span>
        </el-col>
      </el-row>
    </transition>
    <router-view class="main-view padding-top-60"></router-view>

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
import langOptions from "@/utils/data";
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
      toTop: true,
      topCount: 0,
      inTop: true,
      langOptions: langOptions
    };
  },
  watch: {
    "$store.state.misc.needSignin"() {
      this.signInModalVisible = true;
    },
    "$store.state.misc.navFixed"() {
      if (this.$store.state.misc.navFixed) {
        window.removeEventListener("scroll", this.handleScroll);
        this.inTop = true;
        this.toTop = true;
      } else {
        window.addEventListener("scroll", this.handleScroll);
      }
    }
  },
  computed: {},
  methods: {
    signOut() {
      this.$store.dispatch("SignOut");
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
        require("!style-loader!css-loader!less-loader!../theme/light/style.less");
        require("!style-loader!css-loader!less-loader!../theme/light/eleui-style.less");
      } else {
        require("!style-loader!css-loader!less-loader!../theme/dark/style.less");
      }
    },
    handleScroll: function(e) {
      var y = window.scrollY;
      if (y < 1) {
        if (!this.inTop) {
          this.inTop = true;
        }
      } else {
        if (this.inTop) {
          this.inTop = false;
        }
      }
      if (y - this.scrollTop < 0) {
        if (!this.toTop) {
          // 非连续向上滚动两次，展示导航栏\
          this.topCount = this.topCount + 1;
          if (this.topCount >= 9) {
            this.toTop = true;
            this.topCount = 0;
          }
        }
      } else {
        if (window.scrollY < 30) {
          return;
        }
        this.toTop = false;
        this.topCount = 0;
      }
      this.scrollTop = y;
    }
  },
  mounted() {
    this.loadTheme();
    // window.addEventListener('scroll', this.handleScroll);
  }
};
</script>

