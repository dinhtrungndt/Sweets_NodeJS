/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API endpoints for managing comments
 */
const express = require('express');
const router = express.Router();
const commentModel = require('../models/comments');
const axios = require('axios');

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve all comments
 *     tags: [Comments]
 *     responses:
 *       '200':
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
// Lấy danh sách các comment
// http://localhost:3001/comments
router.get('/', async (req, res) => {
  const data = await commentModel.find();
  res.json(data);
});

/**
 * @swagger
 * /comments/get-comment/{idPosts}:
 *   get:
 *     summary: Retrieve comments by post ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: idPosts
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Comments found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       '404':
 *         description: Comments not found
 */
// Lấy comment theo idPosts
// http://localhost:3001/comments/get-comment/:idPosts
router.get("/get-comment/:idPosts", async (req, res) => {
  try {
    const { idPosts } = req.params;
    const data = await commentModel
      .find({ idPosts })
      .populate("idUsers", "name avatar")
      .populate("idParent")
      .populate("parentUserName")
    res.json(data);
  } catch (error) {
    console.error(error);
    res.json({
      status: "error",
      message: "Lấy comment thất bại",
    });
  }
});

/**
 * @swagger
 * /comments/add:
 *   post:
 *     summary: Add a new comment
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       '200':
 *         description: New comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       '400':
 *         description: Invalid request body
 */
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
    const { content , image, parentUserName } = req.body;

    const parentUserNameC = parentUserName || '';

    const comment = new commentModel({ idUsers, idPosts, idParent, content , image, parentUserName: parentUserNameC });
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
    const { content, image, parentUserName } = req.body;

    const parentUserNameC = parentUserName || '';

    const comment = new commentModel({ idUsers, idPosts, content, image, parentUserName: parentUserNameC});
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

// Sắp xếp comments dự theo danh sách bạn bè theo idUsers lên đầu còn chưa kết bạn nằm dưới
// http://localhost:3001/comments/arrange-comment-friend/:idUser/:idPosts
router.get('/arrange-comment-friend/:idUser/:idPosts', async (req, res) => {
  try {
    const { idUser, idPosts } = req.params;

    // Lấy danh sách bạn bè của người dùng từ routes friend
    const response = await axios.get(`https://sweets-nodejs.onrender.com/friend/friends/${idUser}`);
    const friendsList = response.data.friendsList;

    // Lấy tất cả các comment
    const allComments = await commentModel.find({ idPosts }).populate("idUsers", "name avatar");

    // Sắp xếp các comment dựa trên danh sách bạn bè
    const sortedComments = [];
    const otherComments = [];
    
    allComments.forEach(comment => {
      const commentUserId = comment.idUsers._id.toString();
      if (friendsList.includes(commentUserId)) {
        sortedComments.push(comment);
      } else {
        otherComments.push(comment);
      }
    });

    // Gửi danh sách comment đã sắp xếp cho client
    const arrangedComments = sortedComments.concat(otherComments);
    res.json(arrangedComments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Lỗi khi sắp xếp comment",
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
