const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Đổi tên model từ "login" thành "user"
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const saltRounds = 10;


var multer = require('multer');
// // thêm ảnh
const cloudinary = require('../configs/cloundinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'bida',
  allowedFormats: ["jpg", "png", "jpeg"],
  transformation: [{ width: 500, height: 500, crop: "limit" }],

});
const upload = multer({
  storage: storage,
});
// Lấy danh sách người dùng
// http://localhost:3001/user/get-users
router.get('/get-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

const secretKey = 'jaktpyotjpcpefmo';
// http://localhost:3001/user/forgot-password
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  // Kiểm tra xem email có tồn tại trong hệ thống hay không
  // Nếu có, tạo mã JWT và gửi email
  const payload = {
    // nhập email của người dùng vào đây
    email: email,
  };

  // Tạo mã JWT với thời gian sống (expiresIn) là ví dụ 1 giờ
  const token = jwt.sign(payload, secretKey, { expiresIn: '5m' });

  // Gửi email với mã JWT

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nguyenhuudung312337@gmail.com',
      pass: 'jaktpyotjpcpefmo',
    },
  });

  const mailOptions = {
    from: 'nguyenhuudung312337@gmail.com',
    to: email,
    subject: 'Khôi phục mật khẩu',
    text: `Link khôi phục mật khẩu: http://localhost:3001/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ status: 0, message: 'Không thể gửi về mail này' });
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).json({ status: 1, message: 'Gửi mã về mail thành công' + token });
    }
  });
});

// Endpoint để xác minh mã JWT khi người dùng nhấn vào liên kết trong email3001
router.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(401).json({ status: 0, message: 'Invalid or expired token' });
    }

    // Token hợp lệ, có thể thực hiện các bước khôi phục mật khẩu tại đây
    // Ví dụ: trả về trang đổi mật khẩu

    res.status(200).json({ status: 1, message: 'Token verified successfully', decoded });
  });
});

// Đổi mật khẩu
// http://localhost:3001/user/change-password
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

// Đăng nhập
// http://localhost:3001/user/post-login
router.post('/post-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const lowerCaseEmail = email.toLowerCase(); // Chuyển đổi email thành chữ thường

    const user = await User.findOne({ email: lowerCaseEmail });

    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const token = jwt.sign({ email: lowerCaseEmail }, 'shhhhh', { expiresIn: '2h' });
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


// Đăng ký
// http://localhost:3001/user/post-register
router.post('/post-register', async (req, res) => {
  try {
    const { name, email, password, gioitinh, ngaysinh, avatar, anhbia } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      res.json({ status: 0, message: 'Tài khoản đã tồn tại' });
    } else {
      const hash = await bcrypt.hash(password, saltRounds);
      const newUser = {
        name: name,
        email: email,
        password: hash,
        gioitinh: gioitinh,
        ngaysinh: ngaysinh,
        avatar: avatar,
        anhbia: anhbia
      };

      res.json({ status: 1, message: 'Đăng ký thành công' });
      await User.create(newUser);
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi đăng ký' });
  }
});

// đổi mật khẩu
// http://localhost:3001/user/post-update-password
router.post('/post-update-password', async (req, res) => {

  const { email, password, newPassword } = req.body;

  try {
    // tìm người dùng trong database
    const user = await User.findOne({ email: email });

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
    console.error(error);
    res.json({ status: 0, message: 'Lỗi khi đổi mật khẩu' });
  }
});

// Cập nhật thông tin người dùng
// http://localhost:3001/user/update-avatar
router.post('/update-avatar', upload.fields([
  { name: 'avatar', maxCount: 1 }]), async (req, res) => {
    const { _id } = req.body;
    const { avatar } = req.files;
    try {
      const user = await User.findOne({ _id: _id });
      if (user) {
        user.avatar = avatar[0].path;
        await user.save();
        res.json({ status: 1, message: 'Cập nhật thành công' });
      } else {
        res.json({ status: 0, message: 'Người dùng không tồn tại' });
      }
    } catch (err) {
      res.json({ status: 0, message: 'Lỗi khi cập nhật' });
    }
  });
// cập nhật ảnh bìa
// http://localhost:3001/user/update-anhbia
router.post('/update-anhbia', upload.fields([
  { name: 'anhbia', maxCount: 1 }]), async (req, res) => {
    const { _id } = req.body;
    const { anhbia } = req.files;
    try {
      const user = await User.findOne({ _id: _id });
      if (user) {
        user.anhbia = anhbia[0].path;
        await user.save();
        res.json({ status: 1, message: 'Cập nhật thành công' });
      } else {
        res.json({ status: 0, message: 'Người dùng không tồn tại' });
      }
    } catch (err) {
      res.json({ status: 0, message: 'Lỗi khi cập nhật' });
    }
  });

// cập nhật profile
// http://localhost:3001/user/update-profile
router.post('/update-profile', async (req, res) => {
  const { _id, name, gioitinh, ngaysinh } = req.body;
  try {
    const user = await User.findOne({ _id: _id });
    if (user) {
      user.name = name;
      user.gioitinh = gioitinh;
      user.ngaysinh = ngaysinh;
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
router.post('/search-user', async (req, res) => {
  const { name } = req.body;
  try {
    const users = await User.find(
      { name: { $regex: new RegExp(name, 'i') } },
      { name: 1, avatar: 1, ngaysinh: 1 }
    );

    if (users.length > 0) {
      res.json({ status: 1, message: 'Tìm kiếm thành công', users });
    } else {
      res.json({ status: 0, message: 'Không tìm thấy' });
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi tìm kiếm', error: err.message });
  }
});
// search all post
// http://localhost:3001/user/search-post

router.post('/search-all-post', async (req, res) => {
  const { name } = req.body;
  try {
    const users = await User.find(
      { name: { $regex: new RegExp(name, 'i') } },
      { posts: 1 }
    );

    if (users.length > 0) {
      res.json({ status: 1, message: 'Tìm kiếm thành công', users });
    } else {
      res.json({ status: 0, message: 'Không tìm thấy' });
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi tìm kiếm', error: err.message });
  }
});





module.exports = router;
