const express = require("express");
const router = express.Router();
const notificationsModel = require("../models/notifications");
const Comments = require("../models/comments");

// Lấy danh sách các notifications
// http://localhost:3001/notifications
router.get("/", async (req, res) => {
  const data = await notificationsModel.find();
  res.json(data);
});

// Lấy danh sách người nhận theo recipient
// http://localhost:3001/notifications/recipient/:id
router.get("/recipient/:id", async (req, res) => {
  const { id } = req.params;
  const data = await notificationsModel.find({ recipient: id }).populate("recipient", "name avatar").populate("sender", "name avatar");
  res.json(data);
});

// Xóa thông báo dự vào id
// http://localhost:3001/notifications/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await notificationsModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Đã xóa thông báo." });
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi xóa thông báo." });
  }
});

// Cập nhật trạng thái đã đọc của thông báo
// http://localhost:3001/notifications/update/:id
router.put("/update/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await notificationsModel.findByIdAndUpdate(
        id,
        { read: true },
        { new: true } 
      );
      if (!notification) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông báo." });
      }
      res.json({ success: true, message: "Đã cập nhật trạng thái đã đọc của thông báo." });
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đã đọc của thông báo:", error);
      res.status(500).json({ success: false, message: "Đã xảy ra lỗi khi cập nhật trạng thái đã đọc của thông báo." });
    }
  });

module.exports = router;
