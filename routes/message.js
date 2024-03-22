var express = require("express");
var router = express.Router();
var modelMessage = require("../models/message");
const modelUser = require("../models/users");
// lấy danh sách tin nhắn
//http://localhost:3001/message/get-message
router.get("/get-message", async function (req, res, next) {
  var data = await modelMessage.find();
  res.json(data);
});

// Thêm tin nhắn mới
// http://localhost:3001/message/send-message
router.post("/send-message", async function (req, res, next) {
  try {
    const { idSender, idReceiver, content, time } = req.body;

    const newMessage = new modelMessage({
      idSender,
      idReceiver,
      content,
      status: "Đã gửi", // Có thể cập nhật trạng thái tin nhắn tùy vào logic của bạn
      time,
    });

    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Lấy tin nhắn theo id người gửi và id người nhận
// http://localhost:3001/message/get-message/:idSender/:idReceiver
router.get("/get-message/:idSender/:idReceiver", async (req, res, next) => {
  try {
    const { idSender, idReceiver } = req.params;

    const messages = await modelMessage.find({
      $or: [
        { idSender, idReceiver },
        { idSender: idReceiver, idReceiver: idSender },
      ],
    });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi máy chủ mess" });
  }
});

// Xóa tin nhắn theo id
// http://localhost:3001/message/delete/:id
router.delete("/delete/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = await modelMessage.findByIdAndDelete(id);
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi máy chủ mess" });
  }
});

router.post("/update-status/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const status = req.body.status;
    const data = await modelMessage.findByIdAndUpdate(id, {
      status,
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Lỗi máy chủ mess" });
  }
}
);


module.exports = router;
