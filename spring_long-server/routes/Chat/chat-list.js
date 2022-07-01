const {getChatList, getChatRoomRecoreds} = require("../../controller/Chat/chat-list");
const router = require('koa-router')();
// 默认路由
router.prefix("/chat");
router.get("/list/:id", getChatList)
router.get("/chatroomrecords/:chatRoom", getChatRoomRecoreds)
module.exports = router;
