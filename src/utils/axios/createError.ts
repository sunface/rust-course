import { AxiosError } from 'axios'

import { ApiError } from './types'
import { KEYS } from './constants'

export const createError = (error: any) => {
  const axiosError: AxiosError = error
  const axiosResponse = axiosError?.response
  if (axiosResponse) {
    const { status, statusText = '', data } = axiosResponse
    const apiError: ApiError = { status, statusText, data }
    return apiError
  } else {
    const { code: statusText = '', message: data } = axiosError
    const apiError: ApiError = { statusText, data }
    return apiError
  }
}

export const createWrapperError = (error: any = {}) => ({
  [KEYS.error]: error,
})

export const isObject = (data: any) => typeof data === 'object'

export const TestError = (data: any) =>
  data && isObject(data) && KEYS.error in data

export const unWrapError = (error: any) => error && error[KEYS.error]
