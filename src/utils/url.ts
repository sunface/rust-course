export const getHost = (url: string) => {
    const urlMatched = url.match(/https?:\/\/([^/]+)\//i)
    let domain = ''
    if (url && urlMatched && urlMatched[1]) {
      domain = urlMatched[1]
    }
    return domain
  }
  export const clearApiVersion = (api: string) => api && api.replace(/\/v\d$/, '')
  