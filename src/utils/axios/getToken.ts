import { KEYS } from './constants'

export const getToken = () => {
  return localStorage.getItem(KEYS.token)
}

export const saveToken = (token) => {
  return localStorage.setItem(KEYS.token,token)
}

export const removeToken = () => {
    return localStorage.removeItem(KEYS.token)
}

export const getHeaderAuth = (headers: any) => {
  return headers?.[KEYS.token] ?? headers?.[KEYS.token.toLowerCase()]
}

export const setHeaderAuth = (headers: any, token: string) => {
  if (headers) {
    headers[KEYS.token] = token
  }
  return headers
}
