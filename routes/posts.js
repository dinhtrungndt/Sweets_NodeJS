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
    const data = await postsModels.find({ idShare: idPosts });
    res.json( data );
  } catch (error) {
    res.json(error);
  }
});

// Cập nhật bài viết theo idPosts
// http://localhost:3001/posts/update-posts/:idPosts
router.put('/update-posts/:idPosts', async (req, res) => {
  const { idPosts } = req.params;
  const { content, idObject, idTypePosts, idShare } = req.body;

  try {
    const posts = await postsModels.findById(idPosts);

    if (posts) {
      if (content !== undefined) {
        posts.content = content;
      }

      if (idObject !== undefined) {
        posts.idObject = idObject;
      }

      if (idTypePosts !== undefined) {
        posts.idTypePosts = idTypePosts;
      }

      if (idShare !== undefined) {
        posts.idShare = idShare;
      }

      await posts.save();

      res.json({
        status: 'success',
        message: 'Cập nhật bài viết thành công',
      });
    } else {
      res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error 500' });
  }
});

// Xóa bài viết theo idPosts
// http://localhost:3001/posts/delete-posts/:idPosts
router.delete('/delete-posts/:idPosts', async (req, res) => {
  const { idPosts } = req.params;
  await postsModels.findByIdAndDelete(idPosts);
  res.json({ message: 'Xóa bài viết thành công' });
});

// Đăng bài viết


module.exports = router;

