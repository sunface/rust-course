<template>
  <div class="setting-nav">
      <el-row>
        <el-col :span="20" :offset="2">  
          <div class="header  padding-bottom-10 border-bottom" >
            <h3 class="big-title margin-bottom-30"><i class="el-icon-s-tools margin-right-10"></i>User Settings</h3>
            <span v-for="i in items" :key="i" :class="{'selected': selItem==i,'meta-word':selItem!=i}" class="cursor-pointer item font-weight-500" @click="selectItem(i)">{{names[i]}}</span>
          </div>
          <router-view></router-view>
        </el-col>
      </el-row>
            
  </div>
</template>

<script>
export default {
  data () {
    return {
      items: [],
      level: {},

      path : '',
      selItem : '',


      appNames: []
    }
  },
  watch: {
    $route() {
      this.initItem()
    }
  },
  computed: {
  },
  methods: {
    selectItem(i) {
      this.$router.push('/dev/setting/' + i)
    },
    initItem() {
        this.path = window.location.pathname
        this.items = ['account','profile']
        this.level = {account:2,profile:2}
        this.names = {account: 'Account',profile:'Profile'}
        this.selItem = this.path.split('/')[3]
    }
  },
  mounted() {
      this.initItem()
  }
}

</script>

