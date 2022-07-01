const { getTokenFromHeaders } = require("../../utils/getTokenFromHeaders");
const { jwtToken } = require("../../utils/token");
const { getMyFirendList } = require("../../model/Chat/chat-friend");
const { getChatListInformation } = require("../../model/Chat/chat-list");
const { getUserChatMsgRecords } = require("../../model/Chat/chat-records");

//#region  获取聊天列表
module.exports.getChatList = async (ctx) => {
  // 获取token
  const token = getTokenFromHeaders(ctx);
  const jwtVerfify = jwtToken.decrypt(token);
  if (jwtVerfify.decoded) {
    // 解构传递的自己的 Id
    const { id: myId } = ctx.params;
    // 获取自己的id
    const getMyFriendListResult = await getMyFirendList(myId);
    let { user_chat_list } = getMyFriendListResult[0];
    console.log(user_chat_list);
    user_chat_list = JSON.parse(user_chat_list);
    // 根据好友数据列表排序向 数据库排序获取
    const chatListResult = await getChatListInformation(
      user_chat_list.toString()
    );
    ctx.body = {
      status: 200,
      chatList: chatListResult,
      msg: "获取好友列表功能完成",
    };
  } else {
    ctx.body = {
      status: 100,
      tokenVerify: false,
      msg: "token验证过期或不存在请重新登录",
    };
  }
};
//#endregion

//#region  获取聊天记录
module.exports.getChatRoomRecoreds = async (ctx) => {
  const token = getTokenFromHeaders(ctx);
  const jwtVerfify = jwtToken.decrypt(token);
  if (jwtVerfify.decoded) {
    const { chatRoom } = ctx.params;
    const getChatRecordsResult = await getUserChatMsgRecords(chatRoom);
    // console.log(getChatRecordsResult);
    // return;
    if (getChatRecordsResult.length === 0) {
      ctx.body = {
        status: 200,
        chatRoom,
        data: {},
        msg: "获取聊天记录功能成功",
      };
      return;
    }
    let { id, chat_room_name, chat_records } = getChatRecordsResult[0];
    chat_records = JSON.parse(chat_records);
    ctx.body = {
      status: 200,
      chatRoom,
      data: {
        id,
        chat_room_name,
        chat_records,
      },
      msg: "获取聊天记录功能成功",
    };
  } else {
    ctx.body = {
      status: 200,
      msg: "token验证未通过，请重新登录",
    };
  }
};
//#endregion
