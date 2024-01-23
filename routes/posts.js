const express = require('express');
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary");


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

