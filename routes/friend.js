const express = require('express');
const router = express.Router();
const User = require('../models/user');
// Gửi lời mời kết bạn
router.post('/send-friend-request', async (req, res) => {
  try {
    const { senderID, receiverID } = req.body;

    const sender = await User.findById(senderID);
    const receiver = await User.findById(receiverID);

    if (!sender || !receiver) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra xem đã là bạn bè hay chưa
    if (sender.friends.includes(receiverID) || receiver.friends.includes(senderID)) {
      return res.status(400).json({ status: 0, message: 'Đã là bạn bè' });
    }

    // Kiểm tra xem đã gửi lời mời chưa
    const existingRequest = receiver.friendRequests.find(request => String(request.sender) === String(senderID));
    if (existingRequest) {
      return res.status(400).json({ status: 0, message: 'Đã gửi lời mời kết bạn' });
    }

    // Kiểm tra nếu người nhận đã gửi lời mời, thì thêm nhau làm bạn bè
    const senderReceivedRequest = sender.friendRequests.find(request => String(request.sender) === String(receiverID));
    if (senderReceivedRequest) {
      sender.friends.push(receiverID);
      receiver.friends.push(senderID);

      // Xóa lời mời từ mảng friendRequests cả hai
      sender.friendRequests = sender.friendRequests.filter(request => String(request.sender) !== String(receiverID));
      receiver.friendRequests = receiver.friendRequests.filter(request => String(request.sender) !== String(senderID));
    } else {
      // Thêm lời mời vào mảng friendRequests
      receiver.friendRequests.push({ sender: senderID, status: 'pending' });
    }

    // Lưu cập nhật vào cơ sở dữ liệu
    await receiver.save();
    await sender.save();

    res.json({ status: 1, message: 'Đã gửi lời mời kết bạn' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi gửi lời mời kết bạn' });
  }
});



// Chấp nhận lời mời kết bạn
router.post('/accept-friend-request', async (req, res) => {
  try {
    const { userID, senderID } = req.body;

    const user = await User.findById(userID);
    const sender = await User.findById(senderID);

    if (!user || !sender) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra xem lời mời còn tồn tại không
    const friendRequestIndex = user.friendRequests.findIndex(request => String(request.sender) === String(senderID));
    if (friendRequestIndex === -1) {
      return res.status(400).json({ status: 0, message: 'Lời mời kết bạn không tồn tại' });
    }

    // Thêm người gửi vào mảng friends của cả hai người dùng
    user.friends.push(senderID);
    sender.friends.push(userID);

    // Xóa lời mời từ mảng friendRequests
    user.friendRequests.splice(friendRequestIndex, 1);

    // Lưu cập nhật vào cơ sở dữ liệu
    await user.save();
    await sender.save();

    res.json({ status: 1, message: 'Chấp nhận lời mời kết bạn thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi chấp nhận lời mời kết bạn' });
  }
});
// Từ chối lời mời kết bạn
router.post('/reject-friend-request', async (req, res) => {
  try {
    const { userID, senderID } = req.body;

    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra xem lời mời còn tồn tại không
    const friendRequestIndex = user.friendRequests.findIndex(request => String(request.sender) === String(senderID));
    if (friendRequestIndex === -1) {
      return res.status(400).json({ status: 0, message: 'Lời mời kết bạn không tồn tại' });
    }

    // Xóa lời mời từ mảng friendRequests
    user.friendRequests.splice(friendRequestIndex, 1);

    // Lưu cập nhật vào cơ sở dữ liệu
    await user.save();

    res.json({ status: 1, message: 'Từ chối lời mời kết bạn thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi từ chối lời mời kết bạn' });
  }
});



module.exports = router;
