const express = require('express');
const router = express.Router();
const User = require('../models/user');
const multer = require("multer");
const cloudinary = require("cloudinary");

// Đăng bài viết mới cho người dùng cụ thể
// http://localhost:3001/post/:userId/create-post
router.post('/:userId/create-post', async (req, res) => {
  try {
    const userId = req.params.userId;
    const { avatar, name, time, content, image, likedBy, comments } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Thêm người dùng hiện tại vào mảng likedBy
    const newPost = {
      avatar,
      name,
      time,
      content,
      image,
      likedBy: [], 
      comments: [],
    };

    user.posts.push(newPost);
    await user.save();

    res.json({ status: 1, message: 'Bài viết đã được tạo', post: newPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi tạo bài viết' });
  }
});

// lấy tất cả danh sách bài viết của người dùng
// http://localhost:3001/like/:postId/:userId
router.post('/like/:postId/:userId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;

    // Lấy tất cả bài viết
    const users = await User.find({});
    const user = users.find((user) => user.posts.find((post) => post._id == postId));

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra xem bài viết có tồn tại không
    const post = user.posts.find((post) => post._id == postId);
    if (!post) {
      return res.status(404).json({ status: 0, message: 'Bài viết không tồn tại' });
    }

    // Cập nhật mảng likeBy
    const likedByIndex = post.likedBy.indexOf(userId);
    if (likedByIndex === -1) {
      post.likedBy.push(userId);
    } else {
      post.likedBy.splice(likedByIndex, 1);
    }

    // Save the changes to the database
    await user.save();

    res.json({ status: 1, message: 'Bài viết đã được like', post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi like bài viết' });
  }
});


// lấy tất cả danh sách bài viết của người dùng
// http://localhost:3001/post/get-all-post
router.get('/get-all-post', async (req, res) => {
  try {
    const posts = await User.find({}).populate('posts');

    // Check if there are no users or if users have no posts
    if (!posts || posts.length === 0) {
      return res.json({ status: 1, message: 'Không có bài viết nào được tìm thấy', posts: [] });
    }

    res.json({ status: 1, message: 'Lấy danh sách bài viết thành công', posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi lấy danh sách bài viết' });
  }
});

// xóa bài viết
// http://localhost:3001/post/:userId/delete-post/:postId
router.delete('/:userId/delete-post/:postId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const postId = req.params.postId;

    // Kiểm tra xem người dùng có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 0, message: 'Người dùng không tồn tại' });
    }

    // Tìm và xóa bài viết bằng Mongoose Model
    await User.updateOne(
      { _id: userId },
      { $pull: { posts: { _id: postId } } }
    );

    res.json({ status: 1, message: 'Bài viết đã được xóa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 0, message: 'Lỗi khi xóa bài viết' });
  }
});


// Cấu hình Cloudinary
cloudinary.v2.config({
  cloud_name: "dztqqxnqr",
  api_key: "354695779786942",
  api_secret: "Ow2cqIZwL2-VjMAWU0ENdVCmxbE",
  secure: true,
});


// Sử dụng Multer để xử lý upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Upload ảnh
// http://localhost:3001/post/upload-imageStatus
router.post(
  "/upload-imageStatus",
  upload.array("imageStatus", 5),
  async (req, res, next) => {
    try {
      const { files } = req;

      if (!files || files.length === 0) {
        return res.json({ status: 0, urls: [] });
      } else {
        const urls = [];

        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path);
          urls.push(result.secure_url);
        }

        return res.json({ status: 1, urls });
      }
    } catch (error) {
      console.log("Upload image error: ", error);
      return res.json({ status: 0, urls: [] });
    }
  }
);


module.exports = router;

