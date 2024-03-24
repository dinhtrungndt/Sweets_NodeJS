const express = require('express');
const router = express.Router();
const ListChat = require('../models/listchat'); // Đảm bảo sử dụng tên biến với chữ cái đầu tiên viết hoa cho tên mô hình


// Lấy danh sách listchat
// http://localhost:3001/listchat/get-listchat/:id
router.get('/get-listchat/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = await ListChat.find({
            iduser: id // Tìm các mục có iduser chứa id
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi máy chủ" });
    }
});
// thêm user vô listchat
// http://localhost:3001/listchat/add-listchat

router.post('/add-listchat', async (req, res) => {
    try {
        const { idsender, iduser } = req.body;
        const newListChat = new ListChat({
            idsender,
            iduser
        });
        const savedListChat = await newListChat.save();
        res.json(savedListChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi máy chủ" });
    }
});



module.exports = router;
