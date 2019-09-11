/* eslint-disable */
// 该模块用来请求API网关
import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'
import store from '@/store'


// create an axios instance
const service = axios.create({
  baseURL: process.env.WEB_ADDR, // api的base_url
  timeout: 10000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // 设置token
    config.headers['token'] = getToken()
    return config
  }, 
  error => {
    // Do something with request error
    Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    return response
  },
  error => {
    var response = error.response
    if (response == undefined) {
      Message.error({
        message: error.message,
        duration: 3000,
        customClass: 'network-error'
      })
      return Promise.reject(error)
    }
    if (response.data.err_code == 1001) {
      store.dispatch("setNeedSignin", 1)
      store.dispatch("ClearUserInfo")
      return Promise.reject(response.data.message+' : '+ response.data.err_code)
    }

    if (response.data.err_code != 0) {
      Message(
        {
          showClose: true,
          message: response.data.message+' : '+ response.data.err_code,
          type: 'error'
        }
      )
      return Promise.reject(response.data.message+' : '+ response.data.err_code)
    }

    Message.error(error.message)
    return Promise.reject(error)
  })

export default service
