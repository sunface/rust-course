import axios from 'axios'
import {message} from 'antd'
import QS from 'qs'
import {AxiosResponse} from 'axios'

type tCodeMessage = {
    [key:number]:string
}

const codeMessage:tCodeMessage = {
    200:'服务器成功返回请求的数据',
    202:'一个请求已经进入后台排队（异步任务）。',
    204:'删除数据成功。',
    400:'发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401:'用户没有权限（令牌、用户名、密码错误）。',
    403:'用户得到授权，但是访问是被禁止的。',
    404:'发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406:'请求的格式不可得。',
    410:'请求的资源被永久删除，且不会再得到的。',
    422:'当创建一个对象时，发生一个验证错误。',
    500:'服务器发生错误，请检查服务器。',
    502:'网关错误。',
    503:'服务不可用，服务器暂时过载或维护。',
    504:'网关超时。'
}

// 全局的默认值
if (process.env.NODE_ENV === 'production') {
    axios.defaults.baseURL = 'https://www.baidu.com'
}else{
    axios.defaults.baseURL = 'http://localhost:3023'
    //axios.defaults.baseURL = 'http://rap2api.taobao.org/app/mock/242047'
}

// 请求超时时间
axios.defaults.timeout = 10000

// post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

// 请求拦截器
axios.interceptors.request.use(    
    config => {
        // 每次发送请求之前判断是否存在token，如果存在，则统一在http请求的header都加上token，不用每次请求都手动添加了
        // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
        const token = '1'     
        token && (config.headers.Authorization = token)    
        return config   
    },    
    error => {        
        return error
    }
)

// 响应拦截器
axios.interceptors.response.use(    
    response => {        
        if (response.status === 200) {            
            return response      
        } else {            
            return response       
        }    
    },
    // 服务器状态码不是200的情况    
    error => {        
        if (error.response.status) {            
            switch (error.response.status) {                
                // 401: 未登录                
                // 未登录则跳转登录页面，并携带当前页面的路径                
                // 在登录成功后返回当前页面，这一步需要在登录页操作。                
                case 401: 
                    message.error(`${codeMessage[error.response.status]}`)                   
                    // router.replace({                        
                    //     path: '/login',                        
                    //     query: { redirect: router.currentRoute.fullPath } 
                    // });
                    break
                // 403 token过期                
                // 登录过期对用户进行提示                
                // 清除本地token和清空vuex中token对象                
                // 跳转登录页面                
                case 403:                     
                    message.error(`${codeMessage[error.response.status]}`)                    
                    // 清除token                    
                    // localStorage.removeItem('token');                    
                    // store.commit('loginSuccess', null);                    
                    // // 跳转登录页面，并将要浏览的页面fullPath传过去，登录成功后跳转需要访问的页面
                    // setTimeout(() => {                        
                    //     router.replace({                            
                    //         path: '/login',                            
                    //         query: { 
                    //             redirect: router.currentRoute.fullPath 
                    //         }                        
                    //     });                    
                    // }, 1000);                    
                    break 
                // 404请求不存在                
                case 404:
                    message.error(`${codeMessage[error.response.status]}`)                          
                    // Toast({                        
                    //     message: '网络请求不存在',                        
                    //     duration: 1500,                        
                    //     forbidClick: true                    
                    // });                    
                    break                
                // 其他错误，直接抛出错误提示                
                default:
                    message.warning(`${codeMessage[error.response.status]}`)                   
                    // Toast({                        
                    //     message: error.response.data.message,                        
                    //     duration: 1500,                        
                    //     forbidClick: true                    
                    // });            
            }            
            return error.response        
        }       
    }
)

/** 
 * get方法，对应get请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 * @param {Function} successBack [请求时成功回调方法]
 * @param {Function} errorBack [请求时失败回调方法] 
 * @param {Function} finallyBack [无论有无异常都会执行回调方法] 
 */
export async function get(url:string, params:AxiosResponse, successBack = function(res:any){}, errorBack = function(err:any){}, finallyBack = function(){}){  
    try {
        const res = await axios.get(url, params)
        successBack(res.data)
    } catch(err) {
        errorBack(err)
    } finally {
        finallyBack()
    }
}

/** 
 * post方法，对应post请求 
 * @param {String} url [请求的url地址] 
 * @param {Object} params [请求时携带的参数] 
 * @param {Function} successBack [请求时成功回调方法]
 * @param {Function} errorBack [请求时失败回调方法] 
 * @param {Function} finallyBack [无论有无异常都会执行回调方法] 
 */
export async function post(url:string, params:AxiosResponse, successBack = function(res:any){}, errorBack = function(err:any){}, finallyBack = function(){}) {    
    try {
        const res = await axios.post(url, QS.stringify(params))
        successBack(res.data)
    } catch(err) {
        errorBack(err)
    } finally {
        finallyBack()
    }
}