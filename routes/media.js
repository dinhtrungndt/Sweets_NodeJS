const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const mediaModels = require("../models/media");
const postsModels = require('../models/posts');
// Lấy danh sách media
// http://localhost:3001/media/get-media
router.get("/get-media", async (req, res) => {
  var data = await mediaModels.find();
  res.json(data);
});

// Cấu hình Cloudinary
cloudinary.v2.config({
  cloud_name: "dfh1x8dtw",
  api_key: "182242976743445",
  api_secret: "AtujP-65GcmIXf2cZcT0iI9T5_I",
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
// http://localhost:3001/media/upload-imageStatus
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

// thêm media theo idPosts và đưa url lên cloudinary
// http://localhost:3001/media/add-media/:idPosts
router.post("/add-media/:idPosts", async (req, res) => {
  const { idPosts } = req.params;
  const { url, type } = req.body;

  if (type !== "image" && type !== "video") {
    return res.json({ status: 0, message: "Không đúng loại" });
  }

  try {
    const media = new mediaModels({ url, type, idPosts });
    await media.save();
    res.json(media);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: "Lỗi" });
  }
});

// Lấy media theo idPosts
// http://localhost:3001/media/get-media/:idPosts
router.get("/get-media/:idPosts", async (req, res) => {
  const { idPosts } = req.params;
  var data = await mediaModels.find({ idPosts });

  if (!data) return res.json({ status: 0, message: "Không tìm thấy" });

  res.json(data);
});



// khi thêm bài viết và thêm luôn cả ảnh
const uploadImage = async (req, res, next) => {
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
};

const addMedia = async (idPosts, url, type) => {
  try {
    if (type !== 'image' && type !== 'video') {
      return { status: 0, message: 'Không đúng loại' };
    }

    const media = new mediaModels({ url, type, idPosts });
    await media.save();
    return { status: 1, media };
  } catch (error) {
    console.error(error);
    return { status: 0, message: 'Lỗi' };
  }
};

router.post('/add-posts/:idUsers', upload.array('media', 5), async (req, res) => {
  const { content, idObject, idTypePosts, idShare } = req.body;
  const { idUsers } = req.params;

  const posts = new postsModels({
    content,
    idObject,
    idTypePosts,
    idShare,
    idUsers,
  });

  try {
    // Kiểm tra xem có dữ liệu ảnh được gửi lên hay không
    if (req.files && req.files.length > 0) {
      const { status, mediaItems } = await uploadImage(req);

      if (status === 1) {
        // Thêm id của bài viết vào từng media item
        for (const media of mediaItems) {
          const result = await addMedia(posts._id, media.secure_url, media.type);
          if (result.status === 1) {
            // Thêm id của media vào bài viết
            posts.mediaIds.push(result.media._id);
          }
        }
      }
    }

    // Lưu bài viết vào database
    await posts.save();
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Lỗi' });
  }
});


module.exports = router;
