const router = require('koa-router')();
// 默认路由
router.prefix("/chat");
router.get("/list")
module.exports = router;