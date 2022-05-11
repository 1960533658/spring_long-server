const {
  searchFriend,
  addFriend,
  findFriendApply,
  isagreeapply,
  getFriendsList, delFriend
} = require("../../controller/Chat/chat-friend");
const router = require('koa-router')();
// 默认路由
router.prefix("/chat");
// 搜索用户
router.get("/search/:key/:id", searchFriend)
// 添加用户
router.post("/addfriend", addFriend)
// 搜索好友申请用户
router.post("/applylist", findFriendApply)
//是否同意好友申请
router.post("/isagreeapply", isagreeapply)
// 获取好友泪飙
router.get("/goodFriends/:id", getFriendsList)
// 删除好友
router.post("/delfriend", delFriend)
module.exports = router;
