const {query}  = require("../db/query")
module.exports.gridlist = async (ctx) => {
  const userInfo = await query('select * from userinformation')
  ctx.body = {
    status: 200,
    userInfo
  }
}
