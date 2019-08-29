/* eslint-disable */
import { getToken, setToken, removeToken } from '@/utils/auth'
import request from '@/utils/request'
import Cookies from 'js-cookie'
const user = {
  state: {
    id: Cookies.get('imdev-userid') || '',
    name: Cookies.get('imdev-name') || '',
    avatar: Cookies.get('imdev-avatar') || '',
    token: getToken() || ''
  },

  mutations: {
    SET_USERID: (state,userID) => {
      Cookies.set('imdev-userid', userID)
      state.id = userID
    },
    SET_NAME: (state, name) => {
      Cookies.set('imdev-name', name)
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      Cookies.set('imdev-avatar', avatar)
      state.avatar = avatar
    },
    SET_TOKEN: (state, token) => {
      state.token = token
      setToken(token)
    }
  },

  actions: {
    setToken({ commit }, token) {
        commit('SET_TOKEN', token)
    },
    // SSO登陆成功，保存信息
    SetUserInfo({ commit,state},userInfo) {
      return new Promise(resolve => {
        setToken(userInfo.token)
        commit('SET_TOKEN', userInfo.token)
        commit('SET_USERID', userInfo.id)
        commit('SET_NAME', userInfo.name)
        commit('SET_AVATAR', userInfo.avatar)
        resolve()
      })
    },
    // 登出
    SignOut({ commit, state }) {
      return request({
        url: '/web/signOut',
        method: 'post',
        params:{
        }
      }).then(res => {   
        commit('SET_TOKEN', '')
        removeToken()
      })
    }   
  }
}

export default user
