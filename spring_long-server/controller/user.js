const { regist, isHasUsername, login, loginUpdata } = require("../model/user.js")
// 引入MD5加密方法
const { cryptoPassword } = require('../utils')
// 导入joi表单验证
const Joi = require("joi")

// 引入jwt
const jwt = require('jsonwebtoken')
// 登陆加密字符串 jwt加密字符串
const { scrite, jwtScrite } = require("../config/config")


//#region  注册-controller
module.exports.regist = async (ctx) => {
  const { username, password, mobile } = ctx.request.body
  console.log(cryptoPassword(password))
  // 校验用户名  密码 手机号
  const schema = Joi.object({
    username: Joi.string().min(3).max(20).required(),
    password: Joi.string().pattern(/^[a-zA-Z0-9]{3,20}$/),
    repeat_password: Joi.ref('password'),
    //手机号正则  
    mobile: Joi.string().pattern(/^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/)
  })
  const verify = schema.validate({ username, password, mobile })
  console.log(verify)
  // 如果正则不通过，则向后台返回错误
  if (verify.error) {
    ctx.body = {
      status: 100,
      msg: verify.error.details[0].message
    }
    return;
  }
  const isHas = await isHasUsername(username)
  // 如果用户名存在 就停止注册
  if (isHas.length) {
    ctx.body = {
      status: 110,
      isHas: true,
      msg: "用户名已存在"
    }
    return
  }
  // 注册成功加密密码
  const result = await regist(username, cryptoPassword(password, scrite), mobile)
  // ! 如果result.affectedRows（受改变的） 为0表示 为插入数据 为1插入一条数据，为0时修改返回状态
  if (!(result.affectedRows)) {
    registStatus.status = 401
    registStatus.msg = "服务器繁忙，请稍后重试"
    return;
  }
  console.log(ctx.request.body)
  ctx.body = {
    status: 200,
    msg: "注册成功",
  }
}
//#endregion

//#region  登录-controller
module.exports.login = async (ctx) => {
  const { username, password } = ctx.request.body
  console.log("正在登录")
  console.log(username, password)
  // 表单校验
  // ! 查询sql 用户和密码是否正确 有数据说明正确
  const loginResult = await login(username, cryptoPassword(password))
  console.log(loginResult)
  if (loginResult.length) {
    // 如果登录成功 根据用户名和密码生成Token 并重置数据库中的token
    const token = jwt.sign({
      data: { username, password }
    }, jwtScrite, { expiresIn: "1d" })
    // 登录成功返回 jwt 登录账户的所有信息
    ctx.body = {
      status: 200,
      userInfo: {
        ...loginResult[0],
        token,
      },
      msg: "登录成功"
    }
  } else {
    ctx.body = {
      status: 100,
      msg: "登录失败"
    }
  }

}
//#endregion
