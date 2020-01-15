import Vue from 'vue'
import Vuex from 'vuex'
import misc from './modules/misc'
import user from './modules/user'
import post from './modules/post'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    misc,
    user,
    post
  },
  getters
})

export default store
 