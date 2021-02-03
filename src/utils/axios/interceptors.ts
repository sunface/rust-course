import { KEYS } from './constants'
import { createError, unWrapError } from './createError'
import { getNowMon } from '../date'
import { toQueryStr } from '../toQueryStr'
import { getHost } from '../url'
import { ApiConfig } from './config'
import { getHeaderAuth, getToken, setHeaderAuth } from './getToken'
import { getMetadata, rewriteUrl, setMetadata } from './utils'

import type {
  ApiError,
  ReqOnFulfilledInterceptor,
  ResOnFulfilledInterceptor,
} from './types'

/**
 * 输出调试信息
 */
export const printResUrlTime: ResOnFulfilledInterceptor = res => {
  if (ApiConfig.log) {
    const req = res.config
    if (req) {
      let reqUrl = req.baseURL + req.url
      if (req.params) {
        let queryUrl = toQueryStr(req.params)
        if (reqUrl.includes('?')) {
          queryUrl = '&' + queryUrl
        } else {
          queryUrl = '?' + queryUrl
        }
        reqUrl += queryUrl
      }

      if (typeof window === 'undefined') {
        reqUrl = rewriteUrl(reqUrl)
      }

      const duration = getMetadata(res, 'duration')
      let optionalParams = ["请求耗时" ,reqUrl]
      if (duration) {
        optionalParams = optionalParams.concat(`[duration]: ${duration}ms`)
        setMetadata(res, 'duration', duration)
      }
      console.log(...optionalParams)
    }
  }
  return res
}

export const printResData: ResOnFulfilledInterceptor = res => {
  if (ApiConfig.log) {
    console.log("返回结果",res)
  }
  return res
}

/**
 * 客户端重新抛出被服务端吞掉的错误
 */
export const reThrowError: ResOnFulfilledInterceptor = res => {
  const error = unWrapError(res?.data)
  if (error) {
    return Promise.reject(error)
  }
  return res
}

/**
 * 去掉代理用的 ^/api
 */
export const rewriteApiUrl: ReqOnFulfilledInterceptor = req => {
  req.url = rewriteUrl(req.url, ApiConfig.proxyApi)
  return req
}

/**
 * 计算接口请求时间
 */
export const calcRequestTimeStart: ReqOnFulfilledInterceptor = req => {
  if (ApiConfig.log) {
    setMetadata(req, 'startTime', new Date())
  }
  return req
}

/**
 * 计算接口请求时间
 */
export const calcRequestTimeEnd: ResOnFulfilledInterceptor = res => {
  if (ApiConfig.log) {
    const endTime = new Date()
    const startTime = getMetadata(res, 'startTime')
    setMetadata(res, 'duration', Number(endTime) - Number(startTime))
  }
  return res
}

/**
 * 转发时如果需要，代理验证host
 */
export const changeOrigin: ReqOnFulfilledInterceptor = req => {
  const headers = req.headers ?? {}
  headers.host = getHost(req.baseURL)
  req.headers = headers
  return req
}

/**
 * axios异常全局处理（服务端渲染）
 */
export const handleError = (error: any) => {
  console.log('[error]:', error?.message, error?.request?.res?.responseUrl)
  return {
    data: {
      [KEYS.error]: createError(error),
    },
  }
}

/**
 * 客户端自动携带token
 */
export const autoWithClientToken: ReqOnFulfilledInterceptor = req => {
  const headers = req.headers
  if (headers) {
    const token = getToken()
    if (token) {
      setHeaderAuth(headers, token)
    }
  }
  return req
}

/**
 * 代理服务端如何发送token
 */
export const resolveServerToken: ReqOnFulfilledInterceptor = req => {
  const headers = req.headers
  if (headers) {
    const token = getHeaderAuth(headers)
    if (token) {
      // 例如放到cookie中
      // 不处理就是auth header
    }
  }
  return req
}
