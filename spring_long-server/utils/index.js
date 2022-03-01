// 引入node内置加密模块
const crypto = require('crypto')

/**
 * 
 * @param {密码} password 参数（密码）
 * @returns MD5加密过的password字符串
 */
module.exports.cryptoPassword = (password) => {
  return crypto.createHash('MD5').update(password).digest('hex');
}