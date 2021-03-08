import { extend } from 'lodash'
import queryString from 'query-string'



export const getHost = (url: string) => {
    const urlMatched = url.match(/https?:\/\/([^/]+)\//i)
    let domain = ''
    if (url && urlMatched && urlMatched[1]) {
      domain = urlMatched[1]
    }
    return domain
  }
  export const clearApiVersion = (api: string) => api && api.replace(/\/v\d$/, '')
  

  export const addParamToUrl = (param: any) => {
    const currentQuery = getUrlParams()
    extend(currentQuery, param)
    const params = queryString.stringify(currentQuery)
    updateUrl(params)
}

export const setParamToUrl = (params) => {
    updateUrl(queryString.stringify(params))
}

export const removeParamFromUrl = (paramKeys: string[]) => {
    const currentQuery = getUrlParams()
    paramKeys.forEach((key) => delete currentQuery[key])

    const params = queryString.stringify(currentQuery)

    updateUrl(params)
}

export const getUrlParams = ():any => {
    return  queryString.parseUrl(window?.location.href).query
}

export const updateUrl = (params: string) => {
    let url = window.location.origin + window.location.pathname
    if (params != '') {
        url = url + '?' + params 
    }
    window.history.pushState({},null,url);
}