const { query } = require("../../db/query");
//#region  使用获取到的好友聊天列表数据 获取到用户的 用户名称与头像
module.exports.getChatListInformation = async (chatListStr) => {
  if (!chatListStr) chatListStr = "''";
  return await query(`
    select id,username,portrait,user_id
    from userinformation
    where find_in_set(id, "${chatListStr}")
    order by field(user_id, ${chatListStr})
  `);
};
//#endregion
