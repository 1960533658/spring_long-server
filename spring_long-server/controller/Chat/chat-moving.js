const { icefireUpload } = require("koa-icefire-upload");
const path = require("path");
const { getNowTime } = require("../../utils/getNowTime");
const {
  insertPublishMoving,
  getAllMoving,
  getFriendInformation,
} = require("../../model/Chat/chat-moving");
const { getTokenFromHeaders } = require("../../utils/getTokenFromHeaders");
const { jwtToken } = require("../../utils/token");
const { getGoodFriednList } = require("../../model/Chat/chat-friend");
const { serverURL } = require("../../config/config");
//#region  获取自己和好友的动态
module.exports.getFriendMoving = async (ctx) => {
  const token = getTokenFromHeaders(ctx);
  const jwtVerify = jwtToken.decrypt(token);
  if (jwtVerify.decoded) {
    const { myId } = ctx.params;
    console.log(myId);
    // 通过 Id 获取自己的好友列表
    const getMyFriendResult = await getGoodFriednList(myId);
    // 将好友列表处理成 字符串 用于通过mysql集合查询获取数据
    const friendList = JSON.parse(getMyFriendResult[0].good_friends);
    // 获取好友和自己的动态
    let friendMovingResult = await getAllMoving(
      friendList.toString() + `,${myId}`
    );
    // 收集动态中的好友id 用于获取对方的 简单用户信息 username portrait user_id
    const friendId = [];
    friendMovingResult.filter((item) => {
      // 排除重复Id
      if (friendId.indexOf(item.user_id) === -1) {
        friendId.push(item.user_id);
      }
    });
    console.log(friendId);
    // 根据好友字符集 获取好友的用户信息
    const friendInfoResult = await getFriendInformation(friendId.toString());
    //更新获取的好友身份信息调价到好友动态信息中
    friendMovingResult = friendMovingResult.filter((item) => {
      const index = friendInfoResult.findIndex(
        (info) => info.user_id === item.user_id
      );
      if (index !== -1) {
        item.username = friendInfoResult[index].username;
        item.portrait = friendInfoResult[index].portrait;
        return item;
      }
      return item;
    });
    console.log(friendMovingResult);
    ctx.body = {
      status: 200,
      myId,
      moving: friendMovingResult,
      msg: "好友动态数据获取成功",
    };
  } else {
    ctx.body = {
      status: 100,
      tokenVerify: false,
      msg: "token验证过期或不存在请重新登录",
    };
  }
};
//#endregion
//#region  更新动态数据
module.exports.chatMovingUpload = async (ctx) => {
  // 获取 token
  const token = getTokenFromHeaders(ctx);
  const jwtVerify = jwtToken.decrypt(token);
  if (jwtVerify.decoded) {
    console.log(ctx.request.files);
    // 允许文件后缀名
    let extendsions = ["jpg", "jpeg", "gif", "png"];
    // 文件保存路径
    const filePath = path.join(__dirname, "../../public/images/movingPic");
    // 传递 文件后缀+文件保存路径+ctx 给文件上传组件
    const params = await icefireUpload({ ctx, extendsions, filePath });
    // params[1].imgPath.slice(1) 浏览器可访问文件路径
    // console.log(params);
    const publishMovingData = {};
    params.filter((item) => {
      if (item.fieldname === "myId") {
        // 添加用户动态-Id
        publishMovingData.id = item.val;
      }
      if (item.fieldname === "myPublish") {
        // 添加用户动态-文字
        publishMovingData.publish_text = item.val.trim();
      }
      if (item.fieldname === "myPic") {
        if (item.errorMsg) return;
        //添加用户动态-图片名称
        publishMovingData.publish_pic_name = item.imgKey;
        //添加用户动态-图片访问地址
        // http://localhost:3000/images/movingPic/XXX.jpg
        publishMovingData.publish_pic_access_path =
          serverURL + "/movingPic/" + item.imgKey;
      }
    });
    if (
      publishMovingData.publish_text === "" &&
      publishMovingData.publish_pic_name === undefined
    ) {
      ctx.body = {
        status: 101,
        msg: "请保证发布的动态拥有文字或者图片中的一种",
      };
      return;
    }
    // 添加动态的创建时间
    publishMovingData.create_time = getNowTime();
    await insertPublishMoving(publishMovingData);

    ctx.body = {
      status: 200,
      msg: "表单提交成功",
      newMoving: publishMovingData,
    };
  }
};
//#endregion
