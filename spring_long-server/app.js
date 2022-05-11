const Koa = require('koa')
const cors = require('koa2-cors')
const app = new Koa()
app.use(cors());
// 通过http模块 使用socket.io
const server = require("http").createServer(app.callback())
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const user = require('./routes/user');
const chatFrient = require("./routes/Chat/chat-friend")
const { create } = require('domain');

// error handler
onerror(app)

// middlewares

app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(chatFrient.routes(), chatFrient.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
// const io = require("socket.io")(server)
// io.on("connection", socket => {
//   console.log("一名用户已连接")
//   socket.on("disconnect", () => {
//     console.log("断开连接");
//   })
// })
const { Server } = require("socket.io");
const {searchFriend} = require("./controller/Chat/chat-friend");
const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})
io.on("connection", socket => {
  console.log("客户端连接")
  socket.on("aa", data => {
    console.log(data)
  })
  socket.on("disconnect", () => console.log("断开连接"))
})
io.listen(3001)
module.exports = app
