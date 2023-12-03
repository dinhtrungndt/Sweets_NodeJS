var express = require("express");
var router = express.Router();
var modelLogin = require("../models/login");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
// lấy danh sách người dùng
// http://localhost:3000/login/get-login
router.get("/get-login", async function (req, res) {
  var Data = await modelLogin.find();
  res.json({ Data });
});
// Đăng nhập
// http://localhost:3000/login/post-login
router.post('/post-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const item = await modelLogin.findOne({ email: email });
    if (item) {
      const match = await bcrypt.compare(password, item.password);
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
    res.json({ status: 0, message: 'Lỗi rồi' });
  }
});
// Đăng kí
// http://localhost:3000/login/post-register
router.post('/post-register', async (req, res) => {
  try {
    const { name, email, password, gioitinh, ngaysinh, avatar, anhbia } = req.body;
    const item = await modelLogin.findOne({ email: email });
    if (item) {
      res.json({ status: 0, message: 'Tài khoản đã tồn tại' });
    } else {
      const hash = await bcrypt.hash(password, saltRounds);
      const newInsert = { name, email, password: hash, gioitinh, ngaysinh, avatar, anhbia };
      res.json({ status: 1, message: 'Đăng ký thành công' });
      return await modelLogin.create(newInsert);
    }
  } catch (err) {
    res.json({ status: 0, message: 'Lỗi rồi' });
  }
});
module.exports = router;
