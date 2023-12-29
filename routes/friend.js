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

    // Kiểm tra xem đã là bạn bè hay chưa
    if (user.friends.includes(friendID) || friend.friends.includes(userID)) {
      return res.status(400).json({ status: 0, message: 'Đã là bạn bè' });
    }

    // Thêm bạn bè vào mảng friends
    user.friends.push(friendID);
    friend.friends.push(userID);

    // Lưu cập nhật vào cơ sở dữ liệu
    await user.save();
    await friend.save();

    res.json({ status: 1, message: 'Kết bạn thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi kết bạn' });
  }
});

module.exports = router;