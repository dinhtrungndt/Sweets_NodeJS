const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");
const mediaModels = require("../models/media");

// Lấy danh sách media
// http://localhost:3001/media/get-media
router.get("/get-media", async (req, res) => {
  var data = await mediaModels.find();
  res.json(data);
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
// http://localhost:3001/posts/upload-imageStatus
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

module.exports = router;
