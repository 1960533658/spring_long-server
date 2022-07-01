const Koa = require("koa");
const cors = require("koa2-cors");
const app = new Koa();
app.use(cors());
// 通过http模块 使用socket.io
const server = require("http").createServer(app.callback());
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const index = require("./routes/index");
const user = require("./routes/user");
const chatFrient = require("./routes/Chat/chat-friend");
const chatList = require("./routes/Chat/chat-list");
const chatMoving = require("./routes/Chat/chat-moving");
const { create } = require("domain");

// error handler
onerror(app);

// middlewares
// 挂载koa-body

app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(user.routes(), user.allowedMethods());
app.use(chatFrient.routes(), chatFrient.allowedMethods());

// 好友聊天列表
app.use(chatList.routes(), chatList.allowedMethods());
// 好友动态
app.use(chatMoving.routes(), chatMoving.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});
// const io = require("socket.io")(server)
// io.on("connection", socket => {
//   console.log("一名用户已连接")
//   socket.on("disconnect", () => {
//     console.log("断开连接");
//   })
// })
const { Server } = require("socket.io");
const { jwtToken } = require("./utils/token");
const io = new Server(server, {
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const {
  getUserChatMsgRecords,
  addChatRoom,
  saveUserChatMsg,
} = require("./model/Chat/chat-records");
const { getNowTime } = require("./utils/getNowTime");
const { maxIdAndMinId } = require("./utils/maxIdAndMinId");
io.on("connection", (socket) => {
  console.log("客户端连接", socket.id);
  socket.on("sendMsg", async ({ from, msg, to, chatRoom }) => {
    // 获取前端socket.io发送的token信息服务
    const token = socket.handshake.auth.token;
    // 判断token 验证是否过期
    let tokenVerify = jwtToken.decrypt(token);
    // 如果 token 校验成功 就向对方发送消息
    if (tokenVerify.decoded) {
      //#region  向双方存储本次的消息记录
      // 修改自己的消息记录
      const sendTime = getNowTime();
      let dataResult = await getUserChatMsgRecords(chatRoom);
      console.log(dataResult.length);
      // 如果没有返回数据 说明需要添加一个用于聊天的房间数据
      if (dataResult.length === 0) {
        await addChatRoom(chatRoom, from, to);
        // 添加新的房间数据之后 重新获取房间数据
        dataResult = await getUserChatMsgRecords(chatRoom);
      }
      // 获取返回的用户聊聊天室 返回的 chat_records 消息聊天记录
      const chat_records = JSON.parse(dataResult[0].chat_records);
      // 添加用户聊天记录
      chat_records.push({
        // 是谁发送的
        from,
        //  发送给谁
        sendTarget: to,
        // 发送的消息记录
        msg,
        // 发送时间
        sendTime,
      });
      // 保存发送的消息至 聊天室的聊天记录中 这我（kangknag3）发送给kangknag2的第一条消息
      console.log(chat_records);
      await saveUserChatMsg(chatRoom, chat_records);
      // 保存消息记录到数据库
      console.log(chatRoom);
      //#endregion
      // 发送给自己的信息
      socket.emit(`msgInfo`, {
        sendData: {
          from,
          msg,
          sendTarget: to,
          sendTime,
        },
        isTokenVerify: true,
        chatRoom,
      });

      // 发送给对方的信息
      socket.broadcast.emit(`msg${to}`, {
        status: 200,
        sendData: {
          from,
          msg,
          sendTarget: to,
          sendTime,
        },
        isTokenVerify: true,
      });
      // 如果 token 校验成失败 则自己需要重新登录
    } else {
      socket.emit(`msgInfo`, {
        msg: "token验证过期，请重新登录后再进行操作",
        status: 100,
        isTokenVerify: false,
      });
    }
    //定义发送消息的
    // socket.emit(`${socket.id}Chat`)
  });
  socket.on("disconnect", () => {
    console.log("断开连接");
  });
});
io.listen(3001);
module.exports = app;
