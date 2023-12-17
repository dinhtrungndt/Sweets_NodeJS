const express = require('express');
const router = express.Router();
const settinguser = require('../models/settinguser');

// http://localhost:3001/settinguser
router.get('/', async (req, res) => {
    try {
        const settingusers = await settinguser.find();
        res.json({ settingusers });
    } catch (err) {
        res.json({ status: 0, message: 'Lỗi khi lấy danh sách settinguser' });
    }
});

module.exports = router;
