const jwt = require("jsonwebtoken");
const {jwtScrite} = require("../config/config");
const jwtToken = {
  /**
   * token生成
   * @param data 用于生成token 的数据username或者password
   * @param time token有效时间
   * @returns {String} 最终生成的token
   */
  encrypt: function (data, time) {
    return jwt.sign(data, jwtScrite, {expiresIn: time})
  },
  decrypt: function (token) {
    return jwt.verify(token, jwtScrite, (err, decoded) => {
      //如果token验证发生错误返回err
      if (err) {
        return {err}
        //  如果验证成功返回成功的数据
      } else {
        return {decoded}
      }
    })
  }
}
module.exports = {jwtToken};
