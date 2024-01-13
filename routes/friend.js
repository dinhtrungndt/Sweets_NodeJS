const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.post('/add-friend', async (req, res) => {
  try {
    const { userID, friendID } = req.body;

    const user = await User.findById(userID);
    const friend = await User.findById(friendID);

    if (!user || !friend) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Không được tự kết bạn với chính mình
    if (userID === friendID) {
      return res.status(400).json({ status: 0, message: 'Không thể tự kết bạn' });
    }

    // Kiểm tra xem đã là bạn bè hay chưa
    if (user.friends.includes(friendID) || friend.friends.includes(userID)) {
      return res.status(400).json({ status: 0, message: 'Đã là bạn bè' });
    }

    // Thêm bạn bè vào mảng friends
    user.friends.push(friendID);
    await user.save();

    res.json({ status: 1, message: 'Kết bạn thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi kết bạn' });
  }
});

// Lấy danh sách bạn bè
// http://localhost:3001/friend/:userID
router.get("/:userID", async function (req, res) {
  try {
    var Data = await User.findById(req.params.userID).populate("friends");
    res.json({ status: 200, message: "Lấy danh sách bạn bè thành công", Data });
  } catch (err) {
    res.json({ status: 500, message: "Lấy danh sách bạn bè thất bại" });
  }
})

// Xóa mối quan hệ bạn bè
// http://localhost:3001/friend/delete-friend/:id
router.delete("/delete-friend/:id", async function (req, res) {
  try {
    var Data = await User.findByIdAndDelete(req.params.id);
    res.json({ status: 200, message: "Xóa thành công", Data });
  } catch (err) {
    next(err);
    res.json({ status: 500, message: "Xóa thất bại" });
  }
});

module.exports = router;
