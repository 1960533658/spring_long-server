const { query } = require("../../db/query");
//#region  根据房间名获取消息记录
module.exports.getUserChatMsgRecords = async (chatRoom) => {
  return await query(`
    select *
    from user_chat_records
    where chat_room_name = "${chatRoom}"
  `);
};
//#endregion
//#region  添加用户聊天室
module.exports.addChatRoom = async (chatRoom, id1, id2) => {
  return await query(`
  insert into user_chat_records (\`chat_room_name\`, \`user_id1\`,\`user_id2\`)
  values ('${chatRoom}', '${id1}', '${id2}')
  `);
};
//#endregion
//#region 存储消息记录
module.exports.saveUserChatMsg = async (chatRoom, chat_records) => {
  // 将对象传换成JSON数据格式
  chat_records = JSON.stringify(chat_records);
  return await query(`
  update \`user_chat_records\` 
  set \`chat_records\` = '${chat_records}'
  where \`chat_room_name\`= "${chatRoom}"
  `);
};
//#endregion
