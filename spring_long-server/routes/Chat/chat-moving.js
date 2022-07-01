const path = require("path");
const router = require("koa-router")();
// const multer = require("@koa/multer");
const {
  chatMovingUpload,
  getFriendMoving,
} = require("../../controller/Chat/chat-moving");
// const storage = upload
router.prefix("/chatmoving");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, path.join(__dirname, "../../upload/movingPic"));
//   },
//   filename(req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
// const upload = multer({
//   storage: storage,
// });
// console.log(upload.storage.getFilename);

// 获取好友动态
router.get("/getmoving/:myId", getFriendMoving);
// 上传新动态
router.post("/uploadmoving", chatMovingUpload);
module.exports = router;
