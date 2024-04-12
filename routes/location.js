const express = require("express");
const router = express.Router();
const locationModel = require("../models/location");

// Lấy danh sách các location
// http://localhost:3001/location
router.get("/", async (req, res) => {
  const data = await locationModel.find();
  res.json(data);
});

// Thêm location theo idUsers và idPosts
// http://localhost:3001/location/add/:idUsers/:idPosts
router.post("/add/:idUsers/:idPosts", async (req, res) => {
  try {
    const { idUsers, idPosts } = req.params;
    const { location } = req.body;

    const newLocation = new locationModel({
      idUsers: idUsers,
      idPosts: idPosts,
      location: location
    });

    const savedLocation = await newLocation.save();

    res.status(200).json(savedLocation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Lấy danh sách color theo idUsers và idPosts
// http://localhost:3001/location/get-detail/:idUsers/:idPosts
router.get("/get-detail/:idUsers/:idPosts", async (req, res) => {
  try {
    const { idUsers, idPosts } = req.params;
    const location = await locationModel.find({ idUsers: idUsers, idPosts: idPosts });
    res.json(location);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
