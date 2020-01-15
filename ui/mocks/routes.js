const API = '/api'
module.exports = {
    [`${API}` + '/*'] : '/$1' // 路由请求由/mock/*接管
}