import axios from 'axios'

if (process.env.NODE_ENV === 'production') {
    axios.defaults.baseURL = 'https://www.baidu.com'
}else{
    axios.defaults.baseURL = 'https://www.production.com'
}   

let loadingInstance = null //这里是loading
//使用create方法创建axios实例
export const Service = axios.create({
    timeout: 7000, // 请求超时时间
    method: 'post',
    headers: {
        'Content-Type': 'application/json;charset=UTF-8'
    }
})
// 添加请求拦截器
Service.interceptors.request.use(config => {
    return config
})
// 添加响应拦截器
Service.interceptors.response.use(response => {
    loadingInstance.close()
    // console.log(response)
    return response.data
}, error => {
    return Promise.reject(error)
})