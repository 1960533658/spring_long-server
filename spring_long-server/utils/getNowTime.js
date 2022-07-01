// 补0
const addZero = (item) => {
  return item >= 10 ? item : "0" + item;
};
module.exports.getNowTime = () => {
  let timeStr = "";
  let date = new Date();
  timeStr += date.getFullYear() + "-";
  timeStr += addZero(date.getMonth() + 1) + "-";
  timeStr += addZero(date.getDate()) + " ";
  timeStr += addZero(date.getHours()) + ":";
  timeStr += addZero(date.getMinutes()) + ":";
  timeStr += addZero(date.getSeconds());
  return timeStr;
};
