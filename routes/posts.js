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

module.exports = router;

