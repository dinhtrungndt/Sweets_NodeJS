const express = require("express");
const router = express.Router();
const colorModel = require("../models/colors");

// Lấy danh sách các color
// http://localhost:3001/colors
router.get("/", async (req, res) => {
  const data = await colorModel.find();
  res.json(data);
});

// Thêm color theo idUsers và idPosts
// http://localhost:3001/colors/add/:idUsers/:idPosts
router.post("/add/:idUsers/:idPosts", async (req, res) => {
  try {
    const { idUsers, idPosts } = req.params;
    const { color } = req.body;

    const newColor = new colorModel({
      idUsers: idUsers,
      idPosts: idPosts,
      colors: color
    });

    const savedColor = await newColor.save();

    res.status(200).json(savedColor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Lấy danh sách color theo idUsers và idPosts
// http://localhost:3001/colors/get-detail/:idPosts
router.get("/get-detail/:idPosts", async (req, res) => {
  try {
    const { idPosts } = req.params;
    const colors = await colorModel.find({idPosts: idPosts });
    res.json(colors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
