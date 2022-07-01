const { query } = require("../../db/query");
module.exports.insertPublishMoving = ({
  publish_text,
  publish_pic_name,
  publish_pic_access_path,
  create_time,
  id,
}) => {
  return query(`
    insert into user_chat_moving 
    (\`publish_text\`, \`publish_pic_name\`, \`publish_pic_access_path\`, \`create_time\`, \`user_id\`)
    values 
    ('${publish_text ? publish_text : ""}', '${
    publish_pic_name ? publish_pic_name : ""
  }', '${publish_pic_access_path ? publish_pic_access_path : "#"}', '${
    create_time ? create_time : ""
  }', '${id ? id : ""}')
  `);
};
// 获取好友和自己的动态
module.exports.getAllMoving = (friendStr) => {
  return query(`
    select *
    from \`user_chat_moving\`
    where find_in_set(user_id, "${friendStr}")
    group by create_time desc
  `);
};
// 通过集合查询获取 好友身份信息中的 username portrait user_id
module.exports.getFriendInformation = (friendStr) => {
  return query(`
    select username,portrait,user_id
    from userinformation
    where find_in_set(user_id, "${friendStr}")
  `);
};
