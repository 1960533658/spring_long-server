const router = require('koa-router')()
const { regist, login } = require('../controller/user') 
// 默认路由
router.prefix('/user')
// 注册
router.post('/regist', regist)
// 登录
router.post('/login',login)
module.exports = router