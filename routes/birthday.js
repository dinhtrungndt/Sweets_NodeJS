const express = require("express");
const router = express.Router();
const birthdayModel = require("../models/birthday");

// Lấy danh sách các birthdayModel
// http://localhost:3001/birthday
router.get("/", async (req, res) => {
  const data = await birthdayModel.find();
  res.json(data);
});

// Thêm birthday mới vào danh sách
// POST http://localhost:3001/birthday/add
router.post("/add", async (req, res) => {
    try {
      const { idSender, idReceiver, time, content, image } = req.body;
  
      const newBirthday = new birthdayModel({
        idSender,
        idReceiver,
        time,
        content,
        image,
      })
  
      await newBirthday.save();
  
      res.status(201).json({ success: true, message: "Sinh nhật đã được thêm vào." });
    } catch (error) {
      console.error("Lỗi khi thêm sinh nhật:", error);
      res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi thêm sinh nhật." });
    }
  });

// Lấy danh sách nhận theo idUsers
// http://localhost:3001/birthday/idReceiver/:id
router.get("/idReceiver/:id", async (req, res) => {
  const { id } = req.params;
  const data = await birthdayModel.find({ idReceiver: id });
  res.json(data);
});

// Lấy danh sách gửi theo idUsers
// http://localhost:3001/birthday/idSender/:id
router.get("/idSender/:id", async (req, res) => {
  const { id } = req.params;
  const data = await birthdayModel.find({ idSender: id });
  res.json(data);
});
  
module.exports = router;
