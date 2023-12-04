const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Đăng bài viết mới cho người dùng cụ thể
// http://localhost:3000/post/:userId/create-post
router.post('/:userId/create-post', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, image, avatar, time, actionType } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    const newPost = {
      title,
      image,
      avatar,
      time,
      actionType,
    };

    user.posts.push(newPost);
    await user.save();

    res.json({ status: 1, message: 'Bài viết đã được tạo', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi tạo bài viết' });
  }
});

module.exports = router;
