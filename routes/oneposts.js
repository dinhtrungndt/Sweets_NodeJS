const express = require('express');
const router = express.Router();
const onePostsModels = require('../models/oneposts');
const axios = require('axios');

// Lấy danh sách oneposts
// http://localhost:3001/oneposts
router.get('/', async (req, res) => {
  var data = await onePostsModels.find();
  res.json(data);
});

// Lấy danh sách bài đăng và chia sẻ dựa trên id người dùng
// http://localhost:3001/oneposts/get-oneposts/:idUsers
router.get('/get-oneposts/:idUsers', async (req, res) => {
    try {
        const { idUsers } = req.params;

        const responsePosts = await axios.get(`http://localhost:3001/posts/get-posts-idObject/${idUsers}`);
        const postsList = responsePosts.data;

        const responseShares = await axios.get(`http://localhost:3001/share`);
        const sharesList = responseShares.data;

        const promises = sharesList.map(async (share) => {
            const idPost = share.idPosts._id;
            const responseDetail = await axios.get(`https://api.dinhtrungndt.id.vn/posts/get-detail-post/${idPost}`);
            return responseDetail.data;
        });

        const postsDetails = await Promise.all(promises);

        const combinedList = [...postsList, ...postsDetails];

        res.json({ status: 'success', combinedList });
    } catch (error) {
        console.error('Error getting combined posts and shares:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài đăng và chia sẻ', error: error.message });
    }
});


module.exports = router;
