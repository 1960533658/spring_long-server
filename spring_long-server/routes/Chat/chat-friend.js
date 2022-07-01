const {
  searchFriend,
  addFriend,
  findFriendApply,
  isagreeapply,
  getFriendsList,
  delFriend,
  addOrRearrangeGoodFriendsList,
  getUserApplyList,
} = require("../../controller/Chat/chat-friend");
const router = require("koa-router")();
// 默认路由
router.prefix("/chat");
// 搜索用户
router.get("/search/:key/:id", searchFriend);
// 添加用户
router.post("/addfriend", addFriend);
// 搜索好友申请用户
router.post("/applylist", findFriendApply);
router.get("/getapplylist/:id", getUserApplyList);
//是否同意好友申请
router.post("/isagreeapply", isagreeapply);
// 获取好友泪飙
router.get("/goodFriends/:id", getFriendsList);
// 删除好友
router.post("/delfriend", delFriend);
// 添加或将聊天列表排列到第一个
router.post("/rearrangechatlist", addOrRearrangeGoodFriendsList);
module.exports = router;
