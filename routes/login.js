var express = require("express");
var router = express.Router();
var modelLogin = require("../models/login");

// lấy danh sách người dùng
// http://localhost:3000/login/get-login
router.get("/get-login", async function (req, res) {
  var Data = await modelLogin.find();
  res.json({ Data });
});

module.exports = router;
