const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Đổi tên model từ "login" thành "user"
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

// Lấy danh sách người dùng
// http://localhost:3000/user/get-users
router.get('/get-users', async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi lấy danh sách người dùng' });
  }
});

// Đăng nhập
// http://localhost:3000/user/post-login
router.post('/post-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    
    if (user) {
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        const token = jwt.sign({ email: email }, 'shhhhh', { expiresIn: '2h' });
        res.json({ status: 1, message: 'Đăng nhập thành công', token: token });
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
// http://localhost:3000/user/post-register
router.post('/post-register', async (req, res) => {
  try {
    const { name, email, password, gioitinh, ngaysinh, avatar, anhbia } = req.body;
    const user = await User.findOne({ email: email });

    if (user) {
      res.json({ status: 0, message: 'Tài khoản đã tồn tại' });
    } else {
      const hash = await bcrypt.hash(password || 'default', saltRounds);
      const newUser = {
        name: name || 'default',
        email: email || 'default',
        password: hash,
        gioitinh: gioitinh || 'default',
        ngaysinh: ngaysinh || 'default',
        avatar: avatar || 'default',
        anhbia: anhbia || 'default'
      };

      res.json({ status: 1, message: 'Đăng ký thành công' });
      await User.create(newUser);
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi khi đăng ký' });
  }
});


module.exports = router;
