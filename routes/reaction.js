const express = require("express");
const router = express.Router();
const reactionModel = require("../models/reaction");

// Lấy danh sách các reaction
// http://localhost:3001/reaction
router.get("/", async (req, res) => {
  const data = await reactionModel.find();
  res.json(data);
});

// Lấy reaction theo idPosts
// http://localhost:3001/reaction/getPostsReaction
router.get("/getPostsReaction", async (req, res) => {
  const id = req.params.idPosts;
  const data = await reactionModel.find({ _id: id });
  res.json(data);
});

// Thêm mới reaction
// http://localhost:3001/reaction/add
router.post("/add", async (req, res) => {
  try {
    const { idUsers, idPosts, type } = req.body;

    const checkReaction = await reactionModel.findOne({ idUsers, idPosts });

    if (checkReaction) {
      console.log("Existing reaction:", checkReaction);

      if (checkReaction.type === type) {
        await reactionModel.findOneAndUpdate(
          { idUsers, idPosts },
          { type: "None" } 
        );

        console.log(`Removing ${type} reaction`);
      } else {
        await reactionModel.findOneAndUpdate({ idUsers, idPosts }, { type });

        console.log(`Updating reaction to ${type}`);
      }

      return res.json({
        status: "success",
        message: "Thêm mới reaction thành công",
      });
    }

    const reaction = new reactionModel({ idUsers, idPosts, type });
    await reaction.save();

    res.json({
      status: "success",
      message: "Thêm mới reaction thành công",
    });
  } catch (error) {
    console.error("Error while processing reaction:", error);
    res.json({
      status: "error",
      message: "Thêm mới reaction thất bại",
      error: error,
    });
  }
});


// Lấy danh sách idPosts theo idUsers
// http://localhost:3001/reaction/getPostsId/:idPosts
router.get("/getPostsId/:idPosts", async (req, res) => {
  try {
    const { idPosts } = req.params;
    const data = await reactionModel.find({ idPosts });
    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

// xóa reaction theo id
// http://localhost:3001/reaction/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await reactionModel.findByIdAndDelete(id);
    res.json({
      status: "success",
      message: "Xóa reaction thành công",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Xóa reaction thất bại",
      error: error, 
    });
  }
});

// thêm mới reaction dựa vào idUsers và idPosts
// http://localhost:3001/reaction/add/:idUsers/:idPosts
router.post("/add/:idUsers/:idPosts", async (req, res) => {
  try {
    const { idUsers, idPosts } = req.params;
    const { type } = req.body;

    const checkReaction = await reactionModel.findOne({ idUsers, idPosts });
    if (checkReaction) {
      console.log("Existing reaction:", checkReaction);

      if (checkReaction.type === type) {
        await reactionModel.findOneAndUpdate(
          { idUsers, idPosts },
          { type: "None" } 
        );

        console.log(`Removing ${type} reaction`);
      } else {
        await reactionModel.findOneAndUpdate({ idUsers, idPosts }, { type });

        console.log(`Updating reaction to ${type}`);
      }

      return res.json({
        status: "success",
        message: "Thêm mới reaction thành công",
      });
    }
    
    const reaction = new reactionModel({ idUsers, idPosts, type });
    await reaction.save();
    res.json({
      status: "success",
      message: "Thêm mới reaction thành công",
    });
  } catch (error) {
    res.json({
      status: "error",
      message: "Thêm mới reaction thất bại",
      error: error,
    });
  }
});

module.exports = router;
