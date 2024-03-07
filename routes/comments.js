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

// Thêm mới comment dựa theo idUsers, idPosts và idParent
// http://localhost:3001/comments/add/:idUsers/:idPosts/:idParent
router.post('/add/:idUsers/:idPosts/:idParent', async (req, res) => {
  try {
    const { idUsers, idPosts, idParent } = req.params;
    const { content } = req.body;

    const comment = new commentModel({ idUsers, idPosts, idParent, content });
    await comment.save();

    res.json({
        status: 'success',
        message: 'Thêm mới comment thành công',
        data: comment,
    });
  } catch (error) {
    res.json({
        status: 'error',
        message: 'Thêm mới comment thất bại',
    });
  }
});

// Thêm mới comment dựa theo idUsers và idPosts
// http://localhost:3001/comments/add/:idUsers/:idPosts
router.post('/add/:idUsers/:idPosts', async (req, res) => {
  try {
    const { idUsers, idPosts } = req.params;
    const { content } = req.body;

    const comment = new commentModel({ idUsers, idPosts, content });
    await comment.save();

    res.json({
        status: 'success',
        message: 'Thêm mới comment thành công',
        data: comment,
    });
  } catch (error) {
    res.json({
        status: 'error',
        message: 'Thêm mới comment thất bại',
    });
  }
});

// Xóa comment
// http://localhost:3001/comments/delete/:id
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await commentModel.findByIdAndDelete(id);
    res.json({
        status: 1,
        message: 'Xóa comment thành công',
    })
  } catch (error) {
    res.json({
        status: 0,
        message: 'Xóa comment thất bại',
    })
  }
});

module.exports = router;
