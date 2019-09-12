<template>
  <div  class="setting-profile margin-top-20">  
      <el-row v-if="user.id!=undefined">
          <el-col :span="13" class="padding-left-20 padding-right-20">
              <div>
                  <h4>Display name</h4>
                  <div class="meta-word font-size-12">Set a display name. This does not change your username.</div>
                  <el-input size="medium" class="margin-top-5 margin-bottom-5" v-model="user.nickname" :maxlength="30"></el-input>
                   <div class="meta-word font-size-12">{{30-user.nickname.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>About</h4>
                  <div class="meta-word font-size-12">A brief description of yourself shown on your profile.</div>
                  <el-input type="textarea" class="margin-top-5 margin-bottom-5" v-model="user.about" :maxlength="500"></el-input>
                   <div class="meta-word font-size-12">{{500-user.about.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Website url</h4>
                  <el-input size="medium" placeholder="https://yoursite.com" v-model="user.website" :maxlength="30"></el-input>
                  <div class="meta-word font-size-12 margin-top-5">{{30-user.website.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Location </h4>
                  <el-input size="medium" placeholder="Your location" v-model="user.location" :maxlength="30"></el-input>
                  <div class="meta-word font-size-12 margin-top-5">{{30-user.location.length}} Characters</div>
              </div>
              <div class="margin-top-30">
                  <h4>Background color</h4>
                  <el-color-picker class="position-absolute" size="small" v-model="user.bg_color"></el-color-picker>
                  <span class="meta-word font-size-12 margin-left-40">The background color used in your home page</span>
              </div>
              <div class="margin-top-30 margin-bottom-50">
                  <h4>Text color </h4>
                   <el-color-picker  class="position-absolute" size="small" v-model="user.text_color"></el-color-picker>
                   <span class="meta-word font-size-12 margin-left-40">The text color used in your home page</span>
              </div>

               <el-divider content-position="left" >Job/Working</el-divider>
               <div class="margin-top-40">
                  <h4>Education</h4>
                  <div class="meta-word font-size-12">A brief description of your education.</div>
                  <el-input type="textarea" class="margin-top-5 margin-bottom-5" v-model="user.education" :maxlength="500"></el-input>
                   <div class="meta-word font-size-12">{{500-user.education.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Employer</h4>
                  <div class="meta-word font-size-12">e.g : Development Team Leader at &lt;a href="https://google.com"&gt;Google&lt;/a&gt;</div>
                  <el-input type="textarea" class="margin-top-5 margin-bottom-5" v-model="user.employer" :maxlength="500"></el-input>
                   <div class="meta-word font-size-12">{{500-user.employer.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Skills </h4>
                  <div class="meta-word font-size-12">What programming skills do you have? Are your a expert?</div>
                  <el-input type="textarea" class="margin-top-5 margin-bottom-5" v-model="user.skills" :maxlength="500"></el-input>
                   <div class="meta-word font-size-12">{{500-user.skills.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Working Experience</h4>
                  <div class="meta-word font-size-12">Your working experience and the projects you participated</div>
                  <el-input type="textarea" class="margin-top-5 margin-bottom-5" v-model="user.working_exp" :maxlength="500"></el-input>
                   <div class="meta-word font-size-12">{{500-user.working_exp.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Available for</h4>
                  <div class="meta-word font-size-12">What kinds of collaborations or works are you available for?</div>
                  <el-input type="textarea" class="margin-top-5 margin-bottom-5" v-model="user.available_for" :maxlength="500"></el-input>
                   <div class="meta-word font-size-12">{{500-user.available_for.length}} Characters</div>
              </div>
              <div class="margin-top-20">
                  <h4>Looking for work</h4>
                  
                  <el-switch
                    class="position-absolute"
                    v-model="user.lfw"
                    active-color="#13ce66">
                  </el-switch>
                  <span class="meta-word font-size-12 margin-left-50">Are you looking for a work now?</span>
              </div>

              <div class="margin-top-20">
                <el-button type="primary" @click="setProfile">SUBMIT</el-button>
              </div>
          </el-col> 
          <el-col :span="6" :offset="1">
              <UserCard :user="user"></UserCard>
          </el-col>
      </el-row> 
  </div>
</template>

<script>
import request from "@/utils/request";
import UserCard from "../components/user-card";
export default {
  components: {UserCard},
  data() {
    return {
        user: {}
    };
  },
  watch: {
    "$store.state.user.id"() {
       if (this.$store.state.user.id != '') {
           this.init()
       } 
    },
  },
  methods: {
    setProfile() {
        request({
            url: "/user/profile/set",
            method: "POST",
            params: {
                user: JSON.stringify(this.user)
            }
        }).then(res => {
            this.$message.success("Saved")
        });
    },
    init() {
        request({
            url: "/user/profile",
            method: "GET",
            params: {
            }
        }).then(res => {
            this.user = res.data.data
            if (this.user.lfw ==0) {
                this.user.lfw = false
            } else {
                this.user.lfw = true
            }
        });
    }
  },
  mounted() {
    this.init()
  }
};
</script>

