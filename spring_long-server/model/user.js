const { query } = require('../db/query');

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


//#region  登录 查询所有信息-model
module.exports.login = async (username, password) => {
  return await query(`select * from user where username = '${username}' and password = '${password}';`)
}
// 登录时更新token
module.exports.loginUpdata = async (username, token) => {
  return await query(`UPDATE user SET token='${token}' where username='${username}'`)
}
//#endregion


