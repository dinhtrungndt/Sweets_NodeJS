const express = require('express');
const router = express.Router();
const typePostsModels = require('../models/typeposts');

// Lấy danh sách loại bài viết
// http://localhost:3001/typeposts/get-typeposts
router.get('/get-typeposts', async (req, res) => {
  var data = await typePostsModels.find();
  res.json(data);
});

// thêm loại bài viết
// http://localhost:3001/typeposts/add-typeposts
router.post('/add-typeposts', async (req, res) => {
  const { name } = req.body;
  const checkName = await typePostsModels.findOne({ name });
  
  if (checkName) return res.json({ status: 0, message: "Name đã tồn tại" });
  if (name !== "Bài viết" && name !== "Story")
    return res.json({ status: 0, message: "Name không hợp lệ" });

  const typePosts = new typePostsModels({ name });
  await typePosts.save();
  res.json(typePosts);
});

// Lấy loại bài viết theo name là "Bài viết hoặc Story"
// http://localhost:3001/typeposts/get-typeposts/:name
router.get('/get-typeposts/:name', async (req, res) => {
  const { name } = req.params;
  var data = await typePostsModels.findOne({ name });

  if (!data) return res.json({ status: 0, message: "Không tìm thấy" });

  res.json(data);
});

module.exports = router;
