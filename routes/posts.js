const express = require('express');
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const postsModels = require('../models/posts');
const friendModels = require('../models/friend');
const { ObjectId } = require('mongoose').Types;

// Lấy danh sách bài viết
// http://localhost:3001/posts/get-all-posts
router.get('/get-all-posts', async (req, res) => {
  var data = await postsModels.find().populate("idObject").populate("idTypePosts").populate("idShare").populate("idUsers");
  data.reverse();
  res.json(data);
});

router.get('/get-posts-idObject/:idUsers', async (req, res) => {
  try {
    const idUsers = req.params.idUsers;

    const friendsResponse = await friendModels.find({
      $or: [{ idFriendSender: idUsers, status: true }, { idFriendReceiver: idUsers, status: true }],
    });
    const friendsList = friendsResponse.map(friend => friend.idFriendSender == idUsers ? friend.idFriendReceiver : friend.idFriendSender);
    friendsList.push(idUsers);
    
    const data = await postsModels.find({
      $or: [
        { 
          $and: [
            { idUsers: { $in: friendsList } }, 
            { idObject: { $ne: new ObjectId('65b1fe77ab07bc8ddd7de46c') } }, 
          ]
        },
        { idUsers: idUsers },
        { idObject: { $in: ["65b1fe1be09b1e99f9e8a235"] } } 
      ]
    }).populate("idObject").populate("idTypePosts").populate("idShare").populate("idUsers");
    
    data.reverse();
    res.json(data);
  } catch (error) {
    console.error('Error  get-posts-by-user:', error);
    res.status(500).json({ message: 'Error  get-posts-by-user' });
  }
}); 

// thêm bài viết theo idObject, idTypePosts và idUsers
// http://localhost:3001/posts/add-posts/:idUsers
router.post('/add-posts/:idUsers', async (req, res) => {
  const {_id, content, idObject, idTypePosts, idShare } = req.body;
  const { idUsers } = req.params;
  const posts = new postsModels({ _id,content, idObject, idTypePosts, idShare, idUsers });
  await posts.save();
  res.json(posts);
});

// Lấy số lượng share theo idPosts
// http://localhost:3001/posts/get-share/:idPosts
router.get("/get-share/:idPosts", async (req, res) => {
  try {
    const { idPosts } = req.params;
    const data = await postsModels.find({ idShare: idPosts });
    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

// Cập nhật bài viết theo idPosts và idUsers
// http://localhost:3001/posts/update-posts/:idPosts/:idUsers
router.put('/update-posts/:idPosts/:idUsers', async (req, res) => {
  const { idPosts, idUsers } = req.params;
  const { content, idObject, idTypePosts, idShare } = req.body;

  try {
    const post = await postsModels.findById(idPosts);

    if (!post) {
      return res.status(404).json({ message: 'Bài viết không tồn tại' });
    }

    if (post.idUsers.toString() !== idUsers) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa bài viết này' });
    }
    post.content = content || post.content;
    post.idObject = idObject || post.idObject;
    post.idTypePosts = idTypePosts || post.idTypePosts;
    post.idShare = idShare || post.idShare;

    await post.save();

    res.json({
      status: 'success',
      message: 'Cập nhật bài viết thành công',
      updatedPost: post,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật bài viết', error: error.message });
  }
});

// Xóa bài viết theo idPosts
// http://localhost:3001/posts/delete-posts/:_id
router.delete('/delete-posts/:_id', async (req, res) => {
  const { _id } = req.params;
  await postsModels.findByIdAndDelete(_id);
  res.json({ message: 'Xóa bài viết thành công' });
});

router.post("/search-all-post", async (req, res) => {
  const { content } = req.body;
  try {
    const posts = await postsModels.find({ content: { $regex: content, $options: "i" } });

    if (posts.length > 0) {
      res.json({ status: 1, message: "Tìm kiếm thành công", posts });
    } else {
      res.json({ status: 0, message: "Không tìm thấy" });
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi tìm kiếm", error: err.message });
  }
});

// Cập nhập idObject
// http://localhost:3001/posts/update-objects-posts/:idPosts/:idObject
router.put('/update-objects-posts/:idPosts/:idObject', async (req, res) => {
  const { idPosts, idObject } = req.params;

  try {
    const posts = await postsModels.findById(idPosts);

    if (posts) {
      posts.idObject = idObject;

      await posts.save();

      res.json({
        status: 'success',
        message: 'Cập nhật idObject của bài viết thành công',
        postId: idPosts,
        updatedIdObject: idObject,
      });
    } else {
      res.status(404).json({ message: 'Bài viết không tồn tại' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật idObject của bài viết' });
  }
});

// Lấy chi tiết một bài viết theo _id
// http://localhost:3001/posts/get-detail-post/:_id
router.get('/get-detail-post/:_id', async (req, res) => {
  const { _id } = req.params;

  try {
    const post = await postsModels.findById(_id).populate("idObject").populate("idTypePosts").populate("idShare").populate("idUsers");

    if (!post) {
      return res.status(404).json({ message: 'Không tìm thấy bài viết' });
    }

    res.json({ status: 'success', post });
  } catch (error) {
    console.error('Error getting post detail:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết bài viết', error: error.message });
  }
});

// Lấy danh sách bài viết dựa theo idUsers
// http://localhost:3001/posts/get-detail-users/:idUsers
router.get('/get-detail-users/:idUsers', async (req, res) => {
  try {
    const idUsers = req.params.idUsers;

    // Tìm các bài viết của người dùng có id là idUsers
    const userPosts = await postsModels.find({ idUsers }).populate("idObject").populate("idTypePosts").populate("idShare").populate("idUsers");
    
    res.json({ status: 'success', userPosts });
  } catch (error) {
    console.error('Error getting user posts:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết của người dùng', error: error.message });
  }
});

module.exports = router;