const express = require("express");
const router = express.Router();
const loginQRCodeModel = require("../models/login_qrcode");

// Lấy danh sách loginQRCode
// GET http://localhost:3001/loginQRCode/get-loginQRCode
router.get("/get-loginQRCode", async (req, res) => {
  try {
    const data = await loginQRCodeModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm loginQRCode
// POST http://localhost:3001/loginQRCode/add-loginQRCode
router.post("/add-loginQRCode", async (req, res) => {
  let { iduser, deviceid } = req.body;

  // Thiết lập giá trị mặc định cho iduser là null nếu không được gửi
  iduser = iduser || null;

  // Kiểm tra nếu deviceid không được gửi, trả về lỗi
  if (!deviceid) {
    return res.status(400).json({ status: 0, message: "Thiếu thông tin deviceid" });
  }

  try {
    // Kiểm tra xem có mã QR nào sử dụng deviceid này không
    const checkLoginQRCode = await loginQRCodeModel.findOne({ deviceid });
    if (checkLoginQRCode) {
      return res.json({ status: 0, message: "Mã QR đã tồn tại" });
    }

    // Tạo mới mã QR với iduser và deviceid
    const loginQRCode = new loginQRCodeModel({ iduser, deviceid });
    await loginQRCode.save();
    res.json(loginQRCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Cập nhật loginQRCode dựa trên deviceid
// PUT http://localhost:3001/loginQRCode/update-loginQRCode/
router.put("/update-loginQRCode", async (req, res) => {
  const { iduser, deviceid } = req.body;
  
  try {
    const loginQRCode = await loginQRCodeModel.findOne({ deviceid });
    if (!loginQRCode) return res.status(404).json({ message: "Không tìm thấy mã QR với deviceid đã cung cấp" });

    loginQRCode.iduser = iduser;
    await loginQRCode.save();
    res.json({ status: true, loginQRCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Xóa loginQRCode
// DELETE http://localhost:3001/loginQRCode/delete-loginQRCode/:id
router.delete("/delete-loginQRCode/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    const loginQRCode = await loginQRCodeModel.findById(id);
    if (!loginQRCode) return res.status(404).json({ message: "Không tìm thấy mã QR" });

    await loginQRCode.remove();
    res.json({ message: "Mã QR đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
