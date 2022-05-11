const router = require("koa-router")();
const {regist, login, getMain} = require("../controller/user");
// 默认路由
router.prefix("/user");
// 注册
router.post("/regist", regist);
// 登录
router.post("/login", login);
// 获取自己的数据
router.post("/main", getMain);
module.exports = router;
