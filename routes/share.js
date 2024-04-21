const express = require("express");
const router = express.Router();
const shareModels = require("../models/share");
const mediaModels = require("../models/media");
const friendModels = require("../models/friend");
const axios = require('axios');

// Lấy danh sách các share
// http://localhost:3001/share
router.get("/", async (req, res) => {
  const data = await shareModels.find().populate('idObject').populate('idUsers', 'name avatar coverImage').populate('idPosts').populate('idTypePosts');
  res.json(data);
});

// Chia sẻ bài viết
// http://localhost:3001/share/share-post
router.post("/share-post", async (req, res) => {
    try {
      const { _id, idUsers, idPosts, content, idObject } = req.body;
  
      const newShare = new shareModels({
        _id,
        idUsers,
        idPosts,
        content,
        idObject: '65b1fe6dab07bc8ddd7de469',
        idTypePosts: '65b20030261511b0721a9913',
      });
  
      const savedShare = await newShare.save();
  
      res.json({ status: 'success', message: 'Chia sẻ bài viết thành công', share: savedShare });
    } catch (error) {
      console.error('Error sharing post:', error);
      res.status(500).json({ message: 'Lỗi khi chia sẻ bài viết', error: error.message });
    }
  });

// Lấy số lượng chia sẻ của bài viết dựa trên idPosts
// http://localhost:3001/share/get-share/:idPosts
router.get("/get-share/:idPosts", async (req, res) => {
    try {
      const { idPosts } = req.params;
    
    const responsePosts = await axios.get(`https://sweets-nodejs.onrender.com/posts/get-detail-post/${idPosts}`);
    const postsList = responsePosts.data;

      const shares = await shareModels.find({ idPosts }).populate('idObject').populate('idUsers', 'name avatar coverImage');
      const formattedResponse ={
        shares: shares.map(share => {
          return {
            ...share._doc,
            idPosts: postsList,
          };
        })
      }
  
      res.json({ status: 'success', shares: formattedResponse.shares });
    } catch (error) {
      console.error('Error getting shares:', error);
      res.status(500).json({ message: 'Lỗi khi lấy số lượng chia sẻ', error: error.message });
    }
  });

// Lấy danh sách các bài viết đã chia sẻ dựa trên idUsers
// http://localhost:3001/share/get-shared/:idUsers
router.get("/get-shared/:idUsers", async (req, res) => {
    try {
      const { idUsers } = req.params;

      const sharedPosts = await shareModels.find({ idUsers }).populate('idPosts').populate('idObject').populate('idUsers', 'name avatar coverImage');
      const postIds = sharedPosts.map(post => post.idPosts._id);
      const media = await mediaModels.find({ idPosts: { $in: postIds } });
      const mediaMap = media.reduce((acc, cur) => {
        acc[cur.idPosts.toString()] = cur;
        return acc;
      }, {});
      const postsWithMedia = sharedPosts.map(post => {
        return {
          ...post._doc,
          idPosts: {
            ...post.idPosts._doc,
            media: mediaMap[post.idPosts._id.toString()]
          }
        };
      });

      res.json({ status: 'success', sharedPosts: postsWithMedia });
    } catch (error) {
      console.error('Error getting shared posts:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết đã chia sẻ', error: error.message });
    }
});

// Lấy số lượng chia sẻ của bài viết dựa trên idPosts và idUsers
// http://localhost:3001/share/get-share-object/:idPosts/:idUsers
router.get("/get-share-object/:idPosts/:idUsers", async (req, res) => {
  try {
    const { idPosts, idUsers } = req.params;

    const friendsResponse = await friendModels.find({
      $or: [
        { idFriendSender: idUsers, status: true },
        { idFriendReceiver: idUsers, status: true }
      ]
    });
    const friendsList = friendsResponse.map(friend => friend.idFriendSender == idUsers ? friend.idFriendReceiver : friend.idFriendSender);
    friendsList.push(idUsers); 

    const responsePosts = await axios.get(`https://sweets-nodejs.onrender.com/posts/get-detail-post/${idPosts}`);
    const postDetail = responsePosts.data;

    const shares = await shareModels.find({
      idPosts,
      idUsers: { $in: friendsList }
    })
      .populate('idObject')
      .populate('idUsers', 'name avatar coverImage');

    const formattedResponse = {
      shares: shares.map(share => ({
        ...share._doc,
        idPosts: postDetail
      }))
    };

    res.json({ status: 'success', shares: formattedResponse.shares });
  } catch (error) {
    console.error('Error getting shares:', error);
    res.status(500).json({ message: 'Lỗi khi lấy số lượng chia sẻ', error: error.message });
  }
});

module.exports = router;
