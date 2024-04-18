const express = require("express");
const router = express.Router();
const savePostsModel = require("../models/saveposts");
const postsModel = require("../models/posts");
const axios = require('axios');

// Lấy danh sách các savePosts
// http://localhost:3001/saveposts
router.get("/", async (req, res) => {
  const data = await savePostsModel.find();
  res.json(data);
});
 
// Lưu bài viết dựa theo idUsers và idPosts
// http://localhost:3001/savePosts/saved-post/:idUsers/:idPosts
router.post("/saved-post/:idUsers/:idPosts", async (req, res) => {
    try {
      const { idUsers, idPosts } = req.params;
  
      const existingPost = await savePostsModel.findOne({ idUsers, idPosts })
      if (existingPost) {
        return res.status(400).json({ message: "Bài viết đã được lưu trước đó" });
      }
  
      const newSavedPost = await savePostsModel.create({ idUsers, idPosts, save: true });
  
      res.json({ status: "success", message: "Bài viết đã được lưu", newSavedPost });
    } catch (error) {
      console.error("Error saving post:", error);
      res.status(500).json({ message: "Lỗi khi lưu bài viết", error: error.message });
    }
  });

// Lấy danh sách các bài viết đã lưu dựa trên idUsers
// http://localhost:3001/savePosts/get-saved/:idUsers
router.get("/get-saved/:idUsers", async (req, res) => {
    try {
      const { idUsers } = req.params;
  
      const savedPosts = await savePostsModel.find({ idUsers });
  
      const postIds = savedPosts.map(post => post.idPosts);
  
      const userSavedPosts = await postsModel.find({ _id: { $in: postIds } }).populate("idUsers", "name avatar");
  
      const result = userSavedPosts.map(post => {
        const savedPost = savedPosts.find(sp => sp.idPosts === post._id);
        return {
          ...post.toObject(),
          save: savedPost.save,
          createAt: savedPost.createAt
        };
      }).sort((a, b) => b.createAt - a.createAt);
  
      res.json({ status: 'success', userSavedPosts: result });
    } catch (error) {
      console.error('Error getting saved posts:', error);
      res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết đã lưu', error: error.message });
    }
  });

// Xóa bài viết đã lưu dựa trên idUsers và idPosts
// http://localhost:3001/savePosts/delete-saved/:idUsers/:idPosts
router.delete("/delete-saved/:idUsers/:idPosts", async (req, res) => {
    try {
        const { idUsers, idPosts } = req.params;
    
        const deletedPost = await savePostsModel.deleteOne({ idUsers, idPosts });
    
        if (deletedPost.deletedCount === 0) {
          return res.status(404).json({ message: 'Bài viết không được lưu trước đó' });
        }
    
        res.json({ status: 'success', message: 'Bài viết đã được xóa khỏi danh sách đã lưu' });
      } catch (error) {
        console.error('Error deleting saved post:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài viết đã lưu', error: error.message });
      }
});

// Lấy bài viết đã lưu dựa trên idUsers và lấy theo idPosts
// http://localhost:3001/savePosts/get-saved-media/:idUsers
router.get("/get-saved-media/:idUsers", async (req, res) => {
  try {
    const { idUsers } = req.params;
    
    const savedPosts = await savePostsModel.find({ idUsers })

    const postIds = savedPosts.map(post => post.idPosts)

    const userSavedPosts = await postsModel.find({ _id: { $in: postIds } }).populate("idUsers", "name avatar")

    const result = userSavedPosts.map(post => {
      const savedPost = savedPosts.find(sp => sp.idPosts === post._id);
      return {
        ...post.toObject(),
        save: savedPost.save,
        createAt: savedPost.createAt
      };
    }
    );

    for (let i = 0; i < result.length; i++) {
      const post = result[i];
      const posts = await axios.get(`https://sweets-nodejs.onrender.com/posts/get-detail-post/${post._id}`);
      result[i].posts = posts.data;
    }

    res.json({ status: 'success', userSavedPosts: result });
  } catch (error) {
    console.error('Error getting saved posts:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết đã lưu', error: error.message });
  }
});

module.exports = router;
