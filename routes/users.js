const express = require("express");
const router = express.Router();
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const saltRounds = 10;

var multer = require("multer");
// // thêm ảnh
const cloudinary = require("../configs/cloundinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "bida",
  allowedFormats: ["jpg", "png", "jpeg"],
  transformation: [{ width: 500, height: 500, crop: "limit" }],
});
const upload = multer({
  storage: storage,
});
// Lấy danh sách người dùng
// http://localhost:3001/user/get-users
router.get("/get-users", async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi lấy danh sách người dùng" });
  }
});

const secretKey = "jaktpyotjpcpefmo";
// http://localhost:3001/user/forgot-password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  // Kiểm tra xem email có tồn tại trong hệ thống hay không
  // Nếu có, tạo mã JWT và gửi email
  const payload = {
    // nhập email của người dùng vào đây
    email: email,
  };

  // Tạo mã JWT với thời gian sống (expiresIn) là ví dụ 1 giờ
  const token = jwt.sign(payload, secretKey, { expiresIn: "5m" });

  // Gửi email với mã JWT

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "nguyenhuudung312337@gmail.com",
      pass: "jaktpyotjpcpefmo",
    },
  });

  const mailOptions = {
    from: "nguyenhuudung312337@gmail.com",
    to: email,
    subject: "Khôi phục mật khẩu",
    text: `Link khôi phục mật khẩu: http://localhost:3001/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ status: 0, message: "Không thể gửi về mail này" });
    } else {
      console.log("Email sent: " + info.response);
      res
        .status(200)
        .json({ status: 1, message: "Gửi mã về mail thành công" + token });
    }
  });
});

// Endpoint để xác minh mã JWT khi người dùng nhấn vào liên kết trong email3001
router.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error(err);
      return res
        .status(401)
        .json({ status: 0, message: "Invalid or expired token" });
    }
    // Token hợp lệ, có thể thực hiện các bước khôi phục mật khẩu tại đây
    // Ví dụ: trả về trang đổi mật khẩu

    res
      .status(200)
      .json({ status: 1, message: "Token verified successfully", decoded });
  });
});
// cập nhật token vào user
// http://localhost:5000/user/update-token
// router.post('/update-token', async (req, res) => {
//   const { _id, token } = req.body;
//   try {
//     const user = await User.findOne({ _id: _id });
//     if (user) {
//       user.token = token;
//       await user.save();
//       res.json({ status: 1, message: 'Cập nhật thành công' });
//     } else {
//       res.json({ status: 0, message: 'Người dùng không tồn tại' });
//     }
//   } catch (err) {
//     res.json({ status: 0, message: 'Lỗi khi cập nhật' });
//   }
// });

// kiểm tra token
// http://localhost:3001/users/check-token
router.post("/check-token", async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, "shhhhh");
    // Lấy thời gian hiện tại
    const now = Date.now() / 1000;
    // Kiểm tra thời gian tồn tại của token
    const remainingTime = decoded.exp - now;
    // Ghi log thời gian còn lại vào console
    if (typeof decoded.exp !== "undefined" && decoded.exp < now) {
      res.json({ status: 0, message: "Hết hạn đăng nhập" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Token còn hiệu lực", remainingTime });
    }
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});

// Đăng nhập
// http://localhost:3001/users/post-login
// khi đăng nhập sẽ chạy luôn cập nhật token vào user, lưu token vào localstorage
router.post("/post-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerCaseEmail = email.toLowerCase(); // Chuyển đổi email thành chữ thường
    const user = await User.findOne({ email: lowerCaseEmail });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ email: lowerCaseEmail }, "shhhhh", {
          expiresIn: "720h",
        });
        // lưu token vào user
        user.token = token;
        await user.save();

        res.json({
          status: 1,
          message: "Đăng nhập thành công",
          token: token,
          id: user._id,
          post: user.posts,
          user,
        });
      } else {
        res.json({ status: 0, message: "Mật khẩu không đúng" });
      }
    } else {
      res.json({ status: 0, message: "Tài khoản không tồn tại" });
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi đăng nhập" });
  }
});

router.post("/change-password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token) {
    return res
      .status(0)
      .json({ success: false, message: "Không lấy được token" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    if (!decoded || !decoded.email) {
      return res.status(0).json({ success: false, message: "Token bị lỗi" });
    }
    // Tìm người dùng trong cơ sở dữ liệu bằng địa chỉ email từ decoded token
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(0)
        .json({ success: false, message: "Không có thông tin người dùng" });
    }
    // Mã hóa mật khẩu mới trước khi cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Cập nhật mật khẩu mới trong cơ sở dữ liệu
    user.password = hashedPassword;
    await user.save();

    res.status(1).json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (error) {
    console.error(error);
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(0)
        .json({ success: false, message: "Invalid or expired token" });
    }
    res.status(0).json({ success: false, message: "Internal server error" });
  }
});

// Đăng ký
// http://localhost:3001/user/post-register
router.post("/post-register", async (req, res) => {
  try {
    const { name, email, password, gender, date, avatar, coverImage } =
      req.body;
    // chuyển email về chữ thường
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });
    if (user) {
      res.json({ status: 0, message: "Tài khoản đã tồn tại" });
    } else {
      const hash = await bcrypt.hash(password, saltRounds);
      const newUser = {
        name: name,
        email: email,
        password: hash,
        gender: gender,
        date: date,
        avatar: avatar,
        coverImage: coverImage,
        token: "null",
      };

      res.json({ status: 1, message: "Đăng ký thành công", newUser });
      await User.create(newUser);
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi đăng ký" });
  }
});

// đổi mật khẩu
// http://localhost:3001/user/post-update-password
router.post("/post-update-password", async (req, res) => {
  const { _id, password, newPassword } = req.body;

  try {
    // tìm người dùng trong database
    const user = await User.findOne({ _id: _id });

    if (user) {
      // so sánh mật khẩu khi nhập vào và mật khẩu trong database
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // mã hóa mật khẩu mới trước khi cập nhật
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        // cập nhật mật khẩu mới trong database
        user.password = hashedPassword;
        await user.save();
        res.json({ status: 1, message: "Đổi mật khẩu thành công" });
      } else {
        res.json({ status: 0, message: "Mật khẩu cũ không đúng" });
      }
    } else {
      res.json({ status: 0, message: "Người dùng không tồn tại" });
    }
  } catch (error) {
    console.error(error);
    res.json({ status: 0, message: "Lỗi khi đổi mật khẩu" });
  }
});
// Cập nhật thông tin người dùng
// http://localhost:3001/user/update-avatar
// router.post('/update-avatar', upload.fields([
//   { name: 'avatar', maxCount: 1 }]), async (req, res) => {
//     const { _id } = req.body;
//     const { avatar } = req.files;
//     try {
//       const user = await User.findOne({ _id: _id });
//       if (user) {
//         user.avatar = avatar[0].path;
//         await user.save();
//         res.json({ status: 1, message: 'Cập nhật thành công' });
//       } else {
//         res.json({ status: 0, message: 'Người dùng không tồn tại' });
//       }
//     } catch (err) {
//       res.json({ status: 0, message: 'Lỗi khi cập nhật' });
//     }
//   });
// cập nhật ảnh bìa
// http://localhost:3001/user/update-anhbia
router.post(
  "/update-profile",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { email } = req.body;
      const { coverImage, avatar } = req.files;
      const { gender, date } = req.body;

      const user = await User.findOne({ email: email });

      if (!user) {
        return res.json({ status: 0, message: "Người dùng không tồn tại" });
      }

      user.gender = gender;
      user.date = date;

      if (coverImage) {
        user.coverImage = coverImage[0].path;
      }

      if (avatar) {
        user.avatar = avatar[0].path;
      }

      await user.save();

      let successMessage;
      if (coverImage && avatar) {
        successMessage = "Cập nhật thành công 4";
      } else if (coverImage) {
        successMessage = "Cập nhật thành công 3";
      } else if (avatar) {
        successMessage = "Cập nhật thành công 2";
      } else {
        successMessage = "Cập nhật thành công 1";
      }

      res.json({ status: 1, message: successMessage });
    } catch (err) {
      res.json({ status: 0, message: "Lỗi khi cập nhật " + err.message });
    }
  }
);

// cập nhật profile
// http://localhost:3001/user/update-profile

router.post("/update-thongtin", async (req, res) => {
  const { _id, name, gender, date } = req.body;
  try {
    const user = await User.findOne({ _id: _id });
    if (user) {
      user.name = name;
      user.gender = gender;
      user.date = date;
      await user.save();
      res.json({ status: 1, message: "Cập nhật thành công" });
    } else {
      res.json({ status: 0, message: "Người dùng không tồn tại" });
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi cập nhật" });
  }
});
// tìm kiếm user
// http://localhost:3001/user/search-user
router.post("/search-user", async (req, res) => {
  const { name } = req.body;
  try {
    const users = await User.find(
      { name: { $regex: new RegExp(name, "i") } },
      { name: 1, avatar: 1, date: 1 }
    );

    if (users.length > 0) {
      res.json({ status: 1, message: "Tìm kiếm thành công", users });
    } else {
      res.json({ status: 0, message: "Không tìm thấy" });
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi tìm kiếm", error: err.message });
  }
});
// search all post
// http://localhost:3001/user/search-post

// cập nhập thông tin user
// http://localhost:3001/users/update-allinfor/:id
router.post("/update-allinfor/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, token, password, gender, date, avatar, coverImage } =
    req.body;
  try {
    const user = await User.findOne({ _id: id });
    if (user) {
      user.name = name;
      user.email = email;
      user.token = token;
      user.password = password;
      user.gender = gender;
      user.date = date;
      user.avatar = avatar;
      user.coverImage = coverImage;
      await user.save();
      res.json({ status: 1, message: "Cập nhật thành công" });
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi cập nhật" });
  }
});

// Xóa người dùng dựa vào id
// http://localhost:3001/users/delete-user/:id
router.delete("/delete-user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOneAndDelete({ _id: id });
    if (user) {
      res.json({ status: 1, message: "Xóa người dùng thành công" });
    } else {
      res.json({ status: 0, message: "Người dùng không tồn tại" });
    }
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi xóa người dùng" });
  }
});

// Cập nhập avatar
// http://localhost:3001/users/update-avatar/:id
router.put("/update-avatar/:id", async function (req, res) {
  try {
    const { id } = req.params;
    console.log(req.body);
    const user = await User.findById(id);
    if (!user) {
      return res.json({ status: 0, message: "Người dùng không tồn tại" });
    }

    const { name, email, token, password, gender, date, avatar, coverImage } =
      req.body;

    if (name) {
      user.name = name;
    }

    user.email = email || user.email;
    user.token = token || user.token;
    user.gender = gender || user.gender;
    user.date = date || user.date;
    user.avatar = avatar || user.avatar;
    user.coverImage = coverImage || user.coverImage;

    if (avatar && typeof avatar === "string") {
      try {
        const avatarArray = JSON.parse(avatar);
        if (Array.isArray(avatarArray) && avatarArray.length > 0) {
          user.avatar = avatarArray[0];
        }
      } catch (error) {
        console.error("Lỗi JSON nhé T:", error);
      }
    }

    if (coverImage && typeof coverImage === "string") {
      try {
        const coverImageArray = JSON.parse(coverImage);
        if (Array.isArray(coverImageArray) && coverImageArray.length > 0) {
          user.coverImage = coverImageArray[0];
        }
      } catch (error) {
        console.error("Lỗi JSON nhé T:", error);
      }
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.json({ status: 1, message: "Cập nhập thành công", data: user });
  } catch (err) {
    console.error(err);
    res.json({ status: 0, message: "Cập nhật thất bại", error: err.message });
  }
});

//khôi phục người dùng
// http://localhost:3001/users/restore-user
router.post("/restore-user", async (req, res) => {
  try {
    // Data cần khôi phục
    const userData = {
      "_id": "65a8c3e192cef0b4744bf2b9",
      "name": "Mang Tuấn Vĩv",
      "email": "viu10112000@gmail.com",
      "password": "$2a$10$MJDn8dB2qAjhIN1G1XJqCukmKfkZHzX.65Up3xngVb5ECVt0SVW..",
      "gioitinh": "Nam",
      "ngaysinh": "16/05/2002",
      "avatar": "https://res.cloudinary.com/dfh1x8dtw/image/upload/v1709295118/br8n5kde5ehgtaunnzer.jpg",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZpdTEwMTEyMDAwQGdtYWlsLmNvbSIsImlhdCI6MTcxMTEwMjk0NiwiZXhwIjoxNzEzNjk0OTQ2fQ.tvAnUfeeAjB0knZofMv3Hy1bPNEO4gXmYkzoOV9VrE0",
      "friends": [
          "6595141808f34c704e20d196"
      ],
      "posts": [
          {
              "avatar": "https://res.cloudinary.com/dwxly01ng/image/upload/v1701845121/blltwlrisbfnxitr80ur.webp",
              "name": "Loa loa",
              "time": "2023-12-31T12:00:00Z",
              "content": "Nội dung bài ",
              "image": [
                  "https://res.cloudinary.com/dgnhucpz0/image/upload/v1697076710/xuncqrqvx5gepxbsrckn.png",
                  "https://res.cloudinary.com/dgnhucpz0/image/upload/v1697076710/xuncqrqvx5gepxbsrckn.png"
              ],
              "likedBy": [
                  "6595141808f34c704e20d196",
                  "65a8e20bd5308fd3632aa6a2"
              ],
              "comments": [],
              "_id": "65aa01fbe29d0580edf47910"
          }
      ],
      "stories": [],
      "friendRequests": [],
      "coverImage": "https://res.cloudinary.com/dztqqxnqr/image/upload/v1704255997/p1vdyjxbnmt8btfuqoab.jpg"
  }

    const user = await User.create(userData);

    res.json({ status: 1, message: "Khôi phục người dùng thành công", user });
  } catch (err) {
    res.json({ status: 0, message: "Lỗi khi khôi phục người dùng", error: err.message });
  }
});

module.exports = router;
