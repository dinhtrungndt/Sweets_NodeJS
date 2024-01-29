const express = require("express");
const router = express.Router();
const objectModels = require("../models/object");

// Lấy danh sách đối tượng
// http://localhost:3001/object/get-object
router.get("/get-object", async (req, res) => {
  var data = await objectModels.find();
  res.json(data);
});

// thêm đối tượng
// http://localhost:3001/object/add-object
router.post("/add-object", async (req, res) => {
  const { name } = req.body;
  const checkName = await objectModels.findOne({ name });
  
  if (checkName) return res.json({ status: 0, message: "Name đã tồn tại" });

  if (name !== "Công khai" && name !== "Bạn bè" && name !== "Chỉ mình tôi")
    return res.json({ status: 0, message: "Name không hợp lệ" });

  const object = new objectModels({ name });
  await object.save();
  res.json(object);
});

module.exports = router;
