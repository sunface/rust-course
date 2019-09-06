/* eslint-disable */
import { getToken, setToken, removeToken } from '@/utils/auth'
import request from '@/utils/request'
import Cookies from 'js-cookie'
const user = {
  state: {
    id: Cookies.get('imdev-userid') || '',
    name: Cookies.get('imdev-name') || '',
    nickname: Cookies.get('imdev-nickname') || '',
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
    SET_NICKNAME: (state, name) => {
      Cookies.set('imdev-nickname', name)
      state.nickname = name
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
        commit('SET_NICKNAME', userInfo.nickname)
        commit('SET_AVATAR', userInfo.avatar)
        resolve()
      })
    },
    ClearUserInfo({ commit,state},userInfo) {
        removeToken()
        commit('SET_TOKEN', '')
        commit('SET_USERID', '')
        commit('SET_NAME', '')
        commit('SET_NICKNAME', '')
        commit('SET_AVATAR', '')
    },
    // 登出
    SignOut({ commit, state }) {
      return request({
        url: '/web/signOut',
        method: 'post',
        params:{
        }
      }).then(res => {   
        removeToken()
        commit('SET_TOKEN', '')
        commit('SET_USERID', '')
        commit('SET_NAME', '')
        commit('SET_NICKNAME', '')
        commit('SET_AVATAR', '')
      })
    }   
  }
}

export default user
