const express = require('express');
const router = express.Router();
const commentModel = require('../models/comments');

// Lấy danh sách các comment
// http://localhost:3001/comments
router.get('/', async (req, res) => {
  const data = await commentModel.find();
  res.json(data);
});

// Lấy comment theo idPosts
// http://localhost:3001/comments/get-comment/:idPosts
router.get("/get-comment/:idPosts", async (req, res) => {
  try {
    const { idPosts } = req.params;
    const data = await commentModel
      .find({ idPosts })
      .populate("idUsers", "name avatar")
      .populate("idParent");
    res.json(data);
  } catch (error) {
    res.json({
      status: "error",
      message: "Lấy comment thất bại",
    });
  }
});

// Thêm mới comment
// http://localhost:3001/comments/add
router.post('/add', async (req, res) => {
  try {
    const { idUsers, idPosts, idParent, content } = req.body;
    const comment = new commentModel({ idUsers, idPosts, idParent, content });
    await comment.save();
    res.json({
        status: 'success',
        message: 'Thêm mới comment thành công',
        data: comment,
    })
  } catch (error) {
    res.json({
        status: 'error',
        message: 'Thêm mới comment thất bại',
    })
  }
});

module.exports = router;
