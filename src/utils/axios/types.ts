import type {
    AxiosInterceptorManager,
    AxiosRequestConfig,
    AxiosResponse,
  } from 'axios'
  
  export interface APIResponse<T = any> {
    status: 'success' | 'failed' | 'failure' | 'pending'
    data: T
  }
  
  type AxiosInterceptor<T, U extends 'OnFulfilled' | 'OnRejected'> = {
    OnFulfilled: Parameters<AxiosInterceptorManager<T>['use']>[0]
    OnRejected: Parameters<AxiosInterceptorManager<T>['use']>[1]
  }[U]
  
  export type ResOnFulfilledInterceptor = AxiosInterceptor<
    AxiosResponse,
    'OnFulfilled'
  >
  export type ResOnRejectedInterceptor = AxiosInterceptor<
    AxiosResponse,
    'OnRejected'
  >
  export type ReqOnFulfilledInterceptor = AxiosInterceptor<
    AxiosRequestConfig,
    'OnFulfilled'
  >
  export type ReqOnRejectedInterceptor = AxiosInterceptor<
    AxiosRequestConfig,
    'OnRejected'
  >
  
  export type ApiError = {
    status?: number
    statusText?: string
    message?: string
    data?: any
  }
  