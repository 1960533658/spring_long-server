const {query} = require('../db/query');

//#region  注册-model
module.exports.regist = async (username, password, mobile) => {
  return await query(`insert into user (username, password, mobile, create_time)
values ('${username}', '${password}', '${mobile}', now());`)
}
//#endregion


//#region  查询用户名是否已存在-model
module.exports.isHasUsername = async (username) => {
  return await query(`select * from user where username = '${username}';`)
}
//#endregion
//#region  注册成功 向 userinformation 添加初始数据
module.exports.registInsertInformation = async (id, username, sign = "就这？", portrait = "XXX") => {
  return await query(`insert into userinformation (\`username\`,\`sign\`,\`portrait\`,\`user_id\`,\`create_time\`)
                          values ('${username}', '${sign}', '${portrait}', '${id}', now())`)
}
//#endregion
//#region  注册——向user_friend 添加初始数据
module.exports.registInsert_userfriend = async (uid, username) => {
  return await query(`insert into user_friend (\`username\`,\`user_id\`)
                          values ('${username}', '${uid}')`)
}
//#endregion

//#region  注册——向user_friend_list 添加初始数据
module.exports.registInsert_userFriendList = async (uid, username) => {
  return await query(`insert into user_friend_list (\`username\`,\`user_id\`)
                          values ('${username}', '${uid}')`)
}
//#endregion
//#region  登录 查询user表所有信息-model
module.exports.login = async (username, password) => {
  return await query(`select \`id\`
                      from user
                      where username = '${username}' and password = '${password}';`)
//#endregion

//#region  查新所有的身份信息（userinformation表）
}
module.exports.loginUserinformation = async (id) => {
  return await query(`select * from userinformation where \`user_id\` = ${id}`)
}
//#endregion

//#region  登录时获取好友列表
module.exports.getFriendList = async (id) => {
  return await  query(`select \`apply_list\`
                            from user_friend 
                            where \`user_id\` = ${id}`
  )
}
//#endregion


