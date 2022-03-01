const {query}  = require("../db/query")
module.exports.gridlist = async (ctx) => {
  const userInfo = await query('select * from userinfomation')
  ctx.body = {
    status: 200,
    userInfo
  }
}