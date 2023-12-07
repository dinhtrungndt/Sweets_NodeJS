const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Tạo story mới cho người dùng cụ thể
// http://localhost:3001/story/:userId/create-story
router.post('/:userId/create-story', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { title, file } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    const newStory = {
      title,
      file,
    };

    // const createdStory = await User.create(newStory);

    user.stories.push(newStory);
    await user.save();

    res.json({ status: 1, message: 'Story đã được tạo', story: newStory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi tạo story' });
  }
});

// Lấy tất cả danh sách story của người dùng
// http://localhost:3001/story/get-all-stories
router.get('/get-all-stories', async (req, res) => {
  try {
    const stories = await User.find({}, 'stories').populate('stories');
    res.json({ status: 1, message: 'Lấy danh sách story thành công', stories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi lấy danh sách story' });
  }
});

module.exports = router;
