//#region  查询
// 通过 模糊查询 username 判断数据是否存在   fuzzy 模糊查询
const {query} = require("../../db/query");
module.exports.isHasUserFromFuzzy = async (key, id) => {
  return await query(`
    select \`id\`, \`username\`, \`create_time\`, \`birthday\`,\`sex\`,\`sign\`, \`portrait\`
    from  userinformation 
    where username like '%${key}%' and user_id != ${id}`);
};
// WHERE `user`.id=1 AND userinformation.user_id =1;
// 通过 id 查询数据是否存在
module.exports.isHasUserFromId = async (id) => {
  return await query(`select * from user where id = ${id}`);
};

//#endregion

//#region  添加好友
// 通过搜索到的身份信息表的id获取到 user表中的id
module.exports.getFriendList = async (id) => {
  return await query(`select \`id\` from user where id = ${id}`);
};
// 获取自己的好友申请列表
module.exports.getMyApplylist = async (id) => {
  return await query(`select \`apply_list\` from user_friend where id = ${id}`);
};
// 更新自己的好友表好友申请信息
module.exports.updateMyApplyList = async (myId, {myApply, apllyToMe}) => {
  const sql = `update \`user_friend\` 
                set \`apply_list\` = '{"myApply":[${myApply}], "apllyToMe": [${apllyToMe}]}'
                where \`user_id\`=${myId}`;
  return await query(sql);
};
//获取对方身份信息的 apply_list
module.exports.getOtherApplyList = async (id) => {
  return await query(`select \`apply_list\` from user_friend where \`user_id\` = ${id}`);
};
//更新对方的好友表中的好友申请信息
module.exports.updateOtherApplyList = async (id, {myApply, apllyToMe}) => {
  return await query(`
    update \`user_friend\`
    set \`apply_list\` = '{"myApply":[${myApply}], "apllyToMe": [${apllyToMe}]}'
    where \`user_id\`=${id}
  `);
};
//#endregion

//#region  搜索获取到的好友数据
module.exports.findMyApply = async (myApply) => {
  return await query(`
    select *
    from \`userinformation\`
    where \`user_id\` in (${myApply})
  `);
};
// 获取向我发起好友申请的资料
module.exports.findApplyToMe = async (applyToMe) => {
  console.log(applyToMe);
  return await query(`
    select *
    from \`userinformation\`
    where \`user_id\` in (${applyToMe})
  `);
};
//#endregion

//#region  是否同意好友申请
module.exports.isAgreeApply = async ({id, myId}) => {
  return await query(`
    select \`id\`, \`apply_list\`, \`user_id\`
    from \`user_friend\` 
    where apply_list like '%${id}%' and user_id = "${myId}" or user_id = '${id}';
  `);
};
//#endregion

//#region  获取自己的 apply_list
module.exports.getMainApplyList = async (myId) => {
  return await query(`
    select \`apply_list\`
    from \`user_friend\`
    where user_id = ${myId}
  `);
};
//#endregion

//#region  同意好友申请后为自己和对方的好友管血列表添加数据
// 获取自己和对方的好友列表
module.exports.getGoodFriednList = async (id) => {
  return await query(`
    select good_friends
    from user_friend_list
    where user_id=${id}
  `);
};
module.exports.updateUserFriendList = async (id, data) => {
  return await query(`
    update \`user_friend_list\`
    set \`good_friends\` = "[${data}]"
    where user_id=${id}
  `);
};
//#endregion

//#region  通过好友列表获取好友信息
module.exports.getgoodFriendInformation = async (friendStr) => {
  console.log(friendStr);
  return await query(`
    select * 
    from userinformation
    where find_in_set(id, "${friendStr}")
  `);
};
//#endregion

//#region  删除好友
module.exports.getBothGoodFriends = async (id, myId) => {
  return await query(`
    select *
    from \`user_friend_list\`
    where user_id=${id} or user_id=${myId}
  `);
};
//#endregion

//#region  获取自己的好友聊天列表数据
module.exports.getMyFirendList = async (myId) => {
  return await query(`
    select user_chat_list
    from \`user_chat\`
    where user_id=${myId}
  `)
}
//#endregion

//#region  将修改好的数据添加到数据库
module.exports.updateMyFriendListData = async (myId, data) => {
  return await query(`
  update \`user_chat\`
    set \`user_chat_list\` = "[${data}]"
    where user_id=${myId}
  `)
}
//#endregion
