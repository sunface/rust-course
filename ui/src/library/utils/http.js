/* eslint-disable */
// 该模块用来请求API网关
import axios from 'axios'
import { message } from 'antd';
import { getToken } from './auth'
import storage from '../../library/utils/localStorage'
import { logout } from '../../library/utils/account';

// create an axios instance
const service = axios.create({
  baseURL: "http://localhost:9085", // api的base_url
  timeout: 120000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // 设置token
    config.headers['X-Token'] = getToken()
    return config
  }, 
  error => {
    // Do something with request error
    Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    // 1054 == need re-login
    if (response.data.err_code == 1054) {
      message.error(response.data.message)
      setTimeout(function() {
        logout()
      },500)
      return response
    }

    // 错误码不为0，代表发生了错误1
    if (response.data.err_code != 0) {
      if (response.data.message != '') {
        message.error(response.data.message+' : '+ response.data.err_code)
      }
      return Promise.reject(response.data.message+' : '+ response.data.err_code)
    }
    return response
  },
  error => {
    message.error(error.message)
    return Promise.reject(error)
  })

export default service
