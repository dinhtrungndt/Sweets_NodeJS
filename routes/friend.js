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
// http://localhost:3001/friend/delete-friend/:userID/:friendID
router.delete("/delete-friend/:userID/:friendID", async function (req, res) {
  try {
    const userData = await User.findById(req.params.userID);
    const friendData = await User.findById(req.params.friendID);

    // Xóa bạn bè từ người thực hiện hành động
    userData.friends.pull(req.params.friendID);
    await userData.save();

    // Xóa bạn bè từ người bị xóa
    friendData.friends.pull(req.params.userID);
    await friendData.save();

    res.json({ status: 200, message: "Xóa bạn bè thành công" });
  } catch (err) {
    console.error(err);
    res.json({ status: 500, message: "Xóa bạn bè thất bại" });
  }
});


module.exports = router;
