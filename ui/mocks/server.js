const jsonServer = require('json-server')
let Mock  = require('mockjs')
let Random = Mock.Random
const server = jsonServer.create()
const middlewares = jsonServer.defaults()
const rules = require('./routes') 
const {HOST, PORT, DB_FILE, API} = require('./config.js')
const DB = require(DB_FILE)
const router = jsonServer.router(DB()) // 将所创建的数据对象传入，以之生成相应的路由
server.use(jsonServer.bodyParser)
server.use(middlewares)

server.post(`${API}/reg`, ({body:{username='', password=''}}, res) => {
    (username !== 'admin' && password) ?
        res.jsonp({
            'err': 0,
            'msg': '注册成功',
            'data': {
                username,
                password
            }
        }) :
        res.jsonp({
            'err': 1,
            'msg': '注册失败'
        })
})
// 响应/mock/login,进行登录验证操作
server.post(`${API}/login`, ({body:{username='', password=''}}, res) => {
    (username === 'admin' && password === '123456') ?
        setTimeout(() => {  // 由于本地请求速度较快，不方便loading动效显示利用延时器，模拟真实服务器请求速度
            res.jsonp({
                'err': 0,
                'msg': '登录成功',
                'data': {
                    'token': '123',
                    'address': '打破',
                    'email': 'louis.lyr@outlook.com',
                    'tel': '15185724613',
                    'avatar': '' // Random.image('200x200', Random.color(), Random.word(2, 6))
                }
            })
        }, 2000) :
        setTimeout(() => {  // 由于本地请求速度较快，不方便loading动效显示利用延时器，模拟真实服务器请求速度
            res.jsonp({
                'err': 1,
                'msg': '登录失败'
            })
        }, 2000)
})

// 自定义返回内容
router.render = (req, res) => {
    let status = ''
    let len = Object.keys(res.locals.data).length // 判断是否获取到mockJS模拟的数据
    if (res.req.originalMethod === 'DELETE') {
        status = len === 0
    } else {
        status = !!len
    }
    
    setTimeout(() => {  // 由于本地请求速度较快，不方便loading动效显示利用延时器，模拟真实服务器请求速度
        res.jsonp({  // 使用res.jsonp()方法将mockJS模拟生成的数据进行自定义包装后输出
            err: status ? 0 : 1,
            msg: '操作' + (status ? '成功' : '失败'),
            data: res.locals.data
        })
    }, 2000)
}

// router.render = (req, res) => {
//     console.log(req)
//     res.status(500).jsonp({
//         error: 'error message here'
//     })
// }

server.use(jsonServer.rewriter(rules)) // 根据需要重写路由匹配规则
server.use(router) // 安装路由

server.listen({
    host: HOST,
    port: PORT
}, function() {
    console.log(`JSON Server is running in http://${HOST}:${PORT}`)
})