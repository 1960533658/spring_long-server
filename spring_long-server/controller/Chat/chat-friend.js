const {
  isHasUserFromFuzzy,
  isHasUserFromId,
  getFriendList,
  getMyApplylist,
  updateMyApplyList,
  updateOtherApplyList,
  getOtherApplyList,
  findMyApply,
  findApplyToMe,
  isAgreeApply, getMainApplyList, getGoodFriednList, updateUserFriendList,
  getgoodFriendInformation, getBothGoodFriends,
} = require("../../model/Chat/chat-friend");
const {jwtToken} = require("../../utils/token");
const {getMain} = require("../user");
const {getTokenFromHeaders} = require("../../utils/getTokenFromHeaders");
// 搜索用户
module.exports.searchFriend = async (ctx) => {
  const {key, id} = ctx.params;
  // console.log(ctx.params)
  // console.log(key, id)
  if (!key.trim()) {
    ctx.body = {
      status: 100,
      msg: "空格无效",
    };
    return;
  }
  // 获取所有的数据 ，并把筛选结果存在自己的那一条数据清除
  const isHas = await isHasUserFromFuzzy(key, id);
  // console.log(isHas)
  if (isHas.length) {
    ctx.body = {
      status: 200,
      searchUser: isHas,
    };
  }
};
// 添加用户
module.exports.addFriend = async (ctx) => {
  const {myId, id} = ctx.request.body;
  // 去除请求头 携带的 Bearer字符
  const token = ctx.request.headers.authorization.split(" ")[1];
  // console.log(id)
  //  先验证token是否有效过期
  const jwtVerify = jwtToken.decrypt(token);
  //如果验证成功 像数据库添加好友表
  if (jwtVerify.decoded) {
    //  查询数据用户是否存在
    const selectFromIdResult = await isHasUserFromId(id);
    // console.log( "查询数据用户是否存在", selectFromIdResult)
    //查找到数据就给用户添加好友关系申请
    if (selectFromIdResult.length) {
      // console.log(myId, id)
      // 获取好友表的所有数据
      const getFriendListResult = await getFriendList(id);
      const friendListData = getFriendListResult[0].id;
      // console.log(friendListData)
      //#region  将申请信息添加到自己的 apply_list 中
      // ! 将获取到的好友预添加到自己的好友申请中的 myApply {myApply:[], apllyToMe: []}
      const myApplyListResult = await getMyApplylist(myId);
      // console.log(myApplyListResult);
      let applyListData = myApplyListResult[0].apply_list;
      // 转化JSON为对象
      applyListData = JSON.parse(applyListData);
      // console.log("applyListData", applyListData.myApply)
      // applyListData.myApply = []
      if (!applyListData.myApply.includes(id)) {
        applyListData.myApply = [...applyListData.myApply, id];
      } else {
        ctx.body = {
          status: 206,
          msg: "您已经申请过该用户的好友申请",
        };
        return;
      }
      // 更新自己的好友表好友申请信息
      // 将添加好的自己的id数据更新给数据库
      const updateMyApplyListResult = await updateMyApplyList(myId,
          applyListData);
      //#endregion
      //#region  将申请信息添加到对方的申请信息中
      // ! 将获取到的好友预添加到好友的好友申请中的 apllyToMe {myApply:[], apllyToMe: []}
      const getOtherApplyListResult = await getOtherApplyList(id);
      // 将对方的apply_list JSON转对象
      let otherApplyListData = JSON.parse(
          getOtherApplyListResult[0].apply_list);
      console.log("otherApplyListData", otherApplyListData);
      // 将 自己的id添加到对方的好友申请中
      if (!applyListData.apllyToMe.includes(myId)) {
        otherApplyListData.apllyToMe = [...otherApplyListData.apllyToMe, myId];
      } else {
        ctx.body = {
          status: 206,
          msg: "您已经申请过该用户的好友申请",
        };
        return;
      }
      const updateOtherApplyListResult = await updateOtherApplyList(id,
          otherApplyListData);
      // console.log("updateOtherApplyListResult", updateOtherApplyListResult)
      //#endregion
      //如果 自己和对方都添加好友申请成功 就返回添加成功
      if (updateOtherApplyListResult.affectedRows &&
          updateMyApplyListResult.affectedRows) {
        ctx.body = {
          status: 200,
          msg: "添加好友申请成功",
        };
      }
    } else {
      ctx.body = {
        msg: "没有查找到用户",
      };
    }
  }
};
// 查找好友申请
module.exports.findFriendApply = async (ctx) => {
  // 获取token
  const token = ctx.request.headers.authorization.split(" ")[1];
  //  验证token是否过期
  const jwtVerify = jwtToken.decrypt(token);
  // console.log(jwtVerify.decoded)
  // 如果token验证成功 执行逻辑代码
  if (jwtVerify.decoded) {
    // 获取返回数据 { myApply: [ 2, 3 ], apllyToMe: [] }
    const {apply_list} = ctx.request.body;
    // 转换 myApply 的数据格式
    let myApply = apply_list.myApply.toString();
    // 定义变量接收我申请的好友的数据 为字符串
    let findMyApplyResult;
    // 如果 myApply 转字符串的长度不为0 向数据库获取数据
    if (myApply.length) {
      findMyApplyResult = await findMyApply(myApply);
    }
    // 转换 applyToMe 的数据格式 为字符串
    let apllyToMe = apply_list.apllyToMe.toString();
    // 定义变量接收我申请的好友的 数据
    let findApplyToMeResult;
    // 如果 applyToMe 转字符串的长度不为0 向数据库获取数据
    if (apllyToMe.length) {
      findApplyToMeResult = await findApplyToMe(apllyToMe);
    }
    ctx.body = {
      status: 200,
      msg: "接收到了数据",
      data: {
        myApply: myApply.length === 0 ? [] : [...findMyApplyResult],
        applyToMe: apllyToMe.length === 0 ? [] : [...findApplyToMeResult],
      },
    };
  } else {
    ctx.body = {
      status: 100,
      msg: "token登录验证过期",
    };
  }
};

// 是否同意好友申请
module.exports.isagreeapply = async (ctx) => {
  // 获取请求数据的 id myId 是否同意的类型
  const token = ctx.request.headers.authorization.split(" ")[1];
  //  验证token是否过期
  const jwtVerify = jwtToken.decrypt(token);
  // console.log(jwtVerify.decoded)
  // 如果token验证成功 执行逻辑代码
  if (jwtVerify.decoded) {
    const {id, myId, type} = ctx.request.body;
    //  如果 type 是 refuse 拒绝申请 删除applyToMe中的对方的Id 和对方myApply中的我的Id
    const isAgreeApplyResult = await isAgreeApply({id, myId});
    // console.log(isAgreeApplyResult)
    if (isAgreeApplyResult.length !== 0) {
      // 定义变量接收 二者之一的
      let myApply, applyTome;
      myApply = isAgreeApplyResult.filter(item => item.id === myId);
      applyTome = isAgreeApplyResult.filter(item => item.id === id);

      const main = JSON.parse(myApply[0].apply_list);
      const his = JSON.parse(applyTome[0].apply_list);
      // console.log(main.apllyToMe);
      // console.log(his.myApply);
      //  如果在main中的 apllyToMe 存在对方的Id 就清除
      if (main.apllyToMe.indexOf(id) !== -1) {
        // 保存对方的index进行删除
        const index = main.apllyToMe.indexOf(id);
        main.apllyToMe.splice(index, 1);
      }
      //  如果在his中的 myApply 存在我的的Id 就清除
      if (his.myApply.indexOf(myId) !== -1) {
        // 保存对方的index进行删除
        const index = his.myApply.indexOf(id);
        his.myApply.splice(index, 1);
      }
      // console.log(main);
      // console.log(his);
      // 进行删除之后 更新数据库中的apply_list
      const mainUpdateApplyListResult = await updateOtherApplyList(myId,
          main);
      const hisUpdateApplyListResult = await updateOtherApplyList(id, his);
      // 获取修改后的 apply_ist 数据
      const mainApplyListResult = await getMainApplyList(myId);
      const mainApplyList = JSON.parse(mainApplyListResult[0].apply_list);
      // 如果 tpye 是 agree 同意申请
      if (type === "agree") {
        // 获取双方的好友列表数据
        const mainGoodsListResult = await getGoodFriednList(myId);
        const otherGoodsListResult = await getGoodFriednList(id);
        // 解构获取双方的好友列表对象
        let {good_friends: myFriendsList} = mainGoodsListResult[0];
        let {good_friends: otherFriendsList} = otherGoodsListResult[0];
        myFriendsList = JSON.parse(myFriendsList);
        otherFriendsList = JSON.parse(otherFriendsList);
        //如果在双方的好友对象中都没有找到对方的id 就添加对方的id 并更新数据库
        if (myFriendsList.findIndex(item => item === id) === -1 &&
            otherFriendsList.findIndex(item => item === myId) === -1
        ) {
          myFriendsList.push(id);
          otherFriendsList.push(myId);
          await updateUserFriendList(myId, myFriendsList);
          await updateUserFriendList(id, otherFriendsList);
        }
        if (
            mainUpdateApplyListResult.affectedRows &&
            hisUpdateApplyListResult.affectedRows
        ) {
          ctx.body = {
            status: 200,
            type,
            data: {
              mainApplyList,
            },
            msg: "同意好友申请成功",
          };
        }
        // 如果类型是拒绝
      } else if (type === "refuse") {
        // 如果改变数据成功 就返回数据拒绝成功信息
        if (
            mainUpdateApplyListResult.affectedRows &&
            hisUpdateApplyListResult.affectedRows
        ) {

          ctx.body = {
            status: 200,
            type,
            data: {
              mainApplyList,
            },
            msg: "拒绝申请成功",
          };
        } else {
          ctx.body = {
            status: 100,
            msg: "拒绝申请失败",
          };
        }
      }

    } else {
      ctx.body = {
        status: 200,
        msg: "进行操作类型错误，请重试",
      };
    }
    //验证token
  } else {
    ctx.body = {
      status: 100,
      msg: "token登录验证过期",
    };
  }
};

//#region  获取好友列表
module.exports.getFriendsList = async (ctx) => {
  // 获取传递的id
  const {id} = ctx.params;
  //获取token
  const token = getTokenFromHeaders(ctx);
  // 验证token是否过期
  const jwtVerify = jwtToken.decrypt(token);
  if (jwtVerify.decoded) {
    //获取好友数据列表
    const getFriendsListResult = await getGoodFriednList(id);
    // 将 “[]” JSON数组转化为 数组
    let goodFriendsList = JSON.parse(getFriendsListResult[0].good_friends);
    // 通过数组转字符串获取数据库的好友信息数据
    const goodFriendsListInformationResult = await getgoodFriendInformation(
        goodFriendsList.toString());
    ctx.body = {
      status: 200,
      data: goodFriendsListInformationResult,
      msg: "数据已获取",
    };
  } else {
    ctx.body = {
      status: 100,
      msg: "登录过期，请重新登录",
    };
  }
};
//#endregion

//#region  删除好友
module.exports.delFriend = async (ctx) => {
  const {id, myId} = ctx.request.body;
  console.log(id, myId);
  const token = getTokenFromHeaders(ctx);
  // 验证token是否过期
  const jwtVerify = jwtToken.decrypt(token);
  //token 有效获取自已和对方的好友信息进行修改覆盖
  if (jwtVerify.decoded) {
    // 获取双方好友信息
    const getMyGoodFriendsResult = await getGoodFriednList(myId);
    const getOtherGoodFriendsResult = await getGoodFriednList(id);
    // 将 “[]” JSON数组转化为 数组
    let myGoodFriendsList = JSON.parse(getMyGoodFriendsResult[0].good_friends);
    let otherGoodFriendsList = JSON.parse(
        getOtherGoodFriendsResult[0].good_friends);
    // 将双方的好友id删除
    myGoodFriendsList = myGoodFriendsList.filter(item => item !== id);
    otherGoodFriendsList = otherGoodFriendsList.filter(item => item !== myId);
    // 覆盖数据库的数据 为删除双方id后的结果
    await updateUserFriendList(myId, myGoodFriendsList);
    await updateUserFriendList(id, otherGoodFriendsList)
    console.log(myGoodFriendsList);
    console.log(otherGoodFriendsList);
    ctx.body = {
      status: 200,
      msg: "好友已删除",
    };
  } else {
    ctx.body = {
      status: 100,
      msg: "token验证过期,请先登录",
    };
  }

};
//#endregion
