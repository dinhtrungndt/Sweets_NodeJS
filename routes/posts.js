const express = require('express');
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const postsModels = require('../models/posts');

// Lấy danh sách bài viết
// http://localhost:3001/posts/get-all-posts
router.get('/get-all-posts', async (req, res) => {
  var data = await postsModels.find().populate("idObject").populate("idTypePosts").populate("idShare").populate("idUsers", "name avatar");
  data.reverse();
  res.json(data);
});

// thêm bài viết theo idObject, idTypePosts và idUsers
// http://localhost:3001/posts/add-posts/:idUsers
router.post('/add-posts/:idUsers', async (req, res) => {
  const { content, idObject, idTypePosts, idShare } = req.body;
  const { idUsers } = req.params;
  const posts = new postsModels({ content, idObject, idTypePosts, idShare, idUsers });
  await posts.save();
  res.json(posts);
});

// Lấy số lượng share theo idPosts
// http://localhost:3001/posts/get-share/:idPosts
router.get("/get-share/:idPosts", async (req, res) => {
  try {
    const { idPosts } = req.params;
    const data = (await postsModels.find({ idShare: idPosts })) || [];
    res.json({ data });
  } catch (error) {
    res.json(error);
  }
});


module.exports = router;

