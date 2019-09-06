import Cookies from 'js-cookie'

const post = {
  state: {
    contentToBottm: 0
  },
  mutations: {
    SET_ContentToBottm: (state, _) => {
      state.contentToBottm++ 
    },
  },
  actions: {
    setContentToBottm({ commit }, val) {
      commit('SET_ContentToBottm', val)
    },
  }
}

export default post
