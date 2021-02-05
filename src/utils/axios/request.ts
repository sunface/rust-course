import axios, { AxiosRequestConfig } from 'axios'

import { getHost } from '../url'
import { ApiConfig } from './config'
import {
  autoWithClientToken,
  calcRequestTimeEnd,
  calcRequestTimeStart,
  handleError,
  printResData,
  printResUrlTime,
  reThrowError,
  rewriteApiUrl,
} from './interceptors'

const JSONbigString = require('json-bigint')({ storeAsString: true })
import type { OutgoingHttpHeaders } from 'http'

import { createStandaloneToast } from "@chakra-ui/react"
import { logout } from 'utils/session'
import { getToken } from './getToken'
const toast = createStandaloneToast()

axios.defaults.transformResponse = [
  text => {
      return JSONbigString.parse(text)
  },
]

/**
 * 用于客户端请求(Ajax)使用的axios实例
 * > 请求proxy
 */
const requestApiConfig: AxiosRequestConfig = {
  baseURL: ApiConfig.target + ApiConfig.proxyApi,
  timeout: ApiConfig.timeout,
//   withCredentials: true,
}

const requestApi = axios.create(requestApiConfig)

// 自动携带token
requestApi.interceptors.request.use(autoWithClientToken)
// 开始计算请求时间
requestApi.interceptors.request.use(calcRequestTimeStart)

// 结束计算请求时间
requestApi.interceptors.response.use(calcRequestTimeEnd)

// 打印请求url
requestApi.interceptors.response.use(printResUrlTime)

// 打印返回值信息
requestApi.interceptors.response.use(printResData)

// 对返回信息进行处理
requestApi.interceptors.response.use(
 response => {
      return response.data
  },
  error => {
    let message = "error msg missing"
    let status = 200
    if (error.response && error.response.data)  {
        message = error.response.data.message
        status = error.response.status
    } else {
        message = error.text ?? error.message
    }

    if (status === 401) {
       if (getToken()) {
        // 当前登录状态已经过期，进行登出操作
        logout()
       }
    }

    toast({
        title: `请求错误`,
        description: message,
        status: "error",
        duration: 2000,
        isClosable: true,
    })  

    // 这么写是为了保证请求调用方在await中等待的都是正确的返回数据，就不用对数据进行二次错误判断
    throw(error.message)
    // return error.response
  }
)
// 抛出被服务端吞掉的错误
requestApi.interceptors.response.use(reThrowError)

/**
 * 工厂函数
 * 用于服务端请求使用的axios实例
 * 代理服务端无状态,所以使用函数式,保证每个请求都是新的实例
 */
const createRequestRoot = (headers?: OutgoingHttpHeaders) => {
  let baseURL = ApiConfig.target
  if (ApiConfig.changeOrigin) {
    headers.host = getHost(ApiConfig.target)
    if (ApiConfig.useProxyOrigin) {
      baseURL += ApiConfig.proxyApi
    }
  }
  const requestRoot = axios.create({
    baseURL,
    timeout: ApiConfig.timeout,
    headers,
  })

  // 转发到target前，去除^/api前缀
  requestRoot.interceptors.request.use(rewriteApiUrl)
  // 开始计算请求时间
  requestRoot.interceptors.request.use(calcRequestTimeStart)

  // 结束计算请求时间
  requestRoot.interceptors.response.use(calcRequestTimeEnd)

  // 打印请求url， 捕获异常
  requestRoot.interceptors.response.use(printResUrlTime, handleError)

  return requestRoot
}

const createPureRequest = (config?: AxiosRequestConfig) => {
  const request = axios.create(config)

  request.interceptors.request.use(calcRequestTimeStart)
  request.interceptors.request.use(rewriteApiUrl)

  request.interceptors.response.use(calcRequestTimeEnd)
  request.interceptors.response.use(printResUrlTime, handleError)

  return request
}

export { requestApi, createRequestRoot, createPureRequest }
