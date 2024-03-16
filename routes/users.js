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
router.post('/check-token', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, 'shhhhh');
    // Lấy thời gian hiện tại
    const now = Date.now() / 1000;
    // Kiểm tra thời gian tồn tại của token
    const remainingTime = decoded.exp - now;
    // Ghi log thời gian còn lại vào console
    if (typeof decoded.exp !== 'undefined' && decoded.exp < now) {
      res.json({ status: 0, message: 'Hết hạn đăng nhập' });
    } else {
      res.status(200).json({ success: true, message: 'Token còn hiệu lực', remainingTime });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ nội bộ' });
  }
});

// Đăng nhập
// http://localhost:3001/users/post-login
// khi đăng nhập sẽ chạy luôn cập nhật token vào user, lưu token vào localstorage
router.post('/post-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerCaseEmail = email.toLowerCase(); // Chuyển đổi email thành chữ thường
    const user = await User.findOne({ email: lowerCaseEmail });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ email: lowerCaseEmail }, 'shhhhh', { expiresIn: '720h' });
        // lưu token vào user
        user.token = token;
        await user.save();

        res.json({ status: 1, message: 'Đăng nhập thành công', token: token, id: user._id, post: user.posts, user });
      } else {
        res.json({ status: 0, message: 'Mật khẩu không đúng' });
      }
    } else {
      res.json({ status: 0, message: 'Tài khoản không tồn tại' });
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi đăng nhập' });
  }
});

router.post('/change-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token) {
    return res.status(0).json({ success: false, message: 'Không lấy được token' });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    if (!decoded || !decoded.email) {
      return res.status(0).json({ success: false, message: 'Token bị lỗi' });
    }
    // Tìm người dùng trong cơ sở dữ liệu bằng địa chỉ email từ decoded token
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(0).json({ success: false, message: 'Không có thông tin người dùng' });
    }
    // Mã hóa mật khẩu mới trước khi cập nhật
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Cập nhật mật khẩu mới trong cơ sở dữ liệu
    user.password = hashedPassword;
    await user.save();

    res.status(1).json({ success: true, message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(0).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(0).json({ success: false, message: 'Internal server error' });
  }
});

// Đăng ký
// http://localhost:3001/user/post-register
router.post('/post-register', async (req, res) => {
  try {
    const { name, email, password, gender, date, avatar, coverImage } = req.body;
    // chuyển email về chữ thường
    const lowerCaseEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowerCaseEmail });
    if (user) {
      res.json({ status: 0, message: 'Tài khoản đã tồn tại' });
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
        token: 'null',
      };

      res.json({ status: 1, message: 'Đăng ký thành công', newUser });
      await User.create(newUser);
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi đăng ký' });
  }
});

// đổi mật khẩu
// http://localhost:3001/user/post-update-password
router.post('/post-update-password', async (req, res) => {

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
        res.json({ status: 1, message: 'Đổi mật khẩu thành công' });
      } else {
        res.json({ status: 0, message: 'Mật khẩu cũ không đúng' });
      }
    } else {
      res.json({ status: 0, message: 'Người dùng không tồn tại' });
    }
  } catch (error) {
    console.error(error); res.json({ status: 0, message: 'Lỗi khi đổi mật khẩu' });
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
router.post('/update-profile', upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'avatar', maxCount: 1 },
]), async (req, res) => {
  try {
    const { email } = req.body;
    const { coverImage, avatar } = req.files;
    const { gender, date } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.json({ status: 0, message: 'Người dùng không tồn tại' });
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
      successMessage = 'Cập nhật thành công 4';
    } else if (coverImage) {
      successMessage = 'Cập nhật thành công 3';
    } else if (avatar) {
      successMessage = 'Cập nhật thành công 2';
    } else {
      successMessage = 'Cập nhật thành công 1';
    }

    res.json({ status: 1, message: successMessage });
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi cập nhật ' + err.message });
  }
});


// cập nhật profile
// http://localhost:3001/user/update-profile

router.post('/update-thongtin', async (req, res) => {
  const { _id, name, gender, date } = req.body;
  try {
    const user = await User.findOne({ _id: _id });
    if (user) {
      user.name = name;
      user.gender = gender;
      user.date = date;
      await user.save();
      res.json({ status: 1, message: 'Cập nhật thành công' });
    } else {
      res.json({ status: 0, message: 'Người dùng không tồn tại' });
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi cập nhật' });
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

// lấy chi tiết user
// http://localhost:3001/users/detail?_id=





module.exports = router;
