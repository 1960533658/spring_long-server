module.exports.getTokenFromHeaders = (ctx) => {
  return ctx.request.headers.authorization.split(" ")[1];
}
