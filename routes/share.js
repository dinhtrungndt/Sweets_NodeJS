const express = require("express");
const router = express.Router();
const shareModels = require("../models/share");
const mediaModels = require("../models/media");

// Lấy danh sách các share
// http://localhost:3001/share
router.get("/", async (req, res) => {
  const data = await shareModels.find();
  res.json(data);
});

// Chia sẻ bài viết
// http://localhost:3001/share/share-post
router.post("/share-post", async (req, res) => {
    try {
      const { idUsers, idPosts, content, idObject } = req.body;
  
      const newShare = new shareModels({
        idUsers,
        idPosts,
        content,
        idObject,
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
  
      const shares = await shareModels.find({ idPosts });
  
      res.json({ status: 'success', shares });
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

      const sharedPosts = await shareModels.find({ idUsers }).populate('idPosts');
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



module.exports = router;
