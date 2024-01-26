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

    const checkLike = await reactionModel.findOne({ idUsers, idPosts });

    if (checkLike) {
      console.log("Existing reaction:", checkLike);

      if (checkLike.type === "Like") {
        await reactionModel.findOneAndUpdate(
          { idUsers, idPosts },
          { type: "Unlike" }
        );

        console.log("Updating Like to Unlike");
      } else {
        await reactionModel.findOneAndUpdate(
          { idUsers, idPosts },
          { type: "Like" }
        );

        console.log("Updating Unlike to Like");
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
// http://localhost:3001/reaction/getPostsId
router.get("/getPostsId", async (req, res) => {
  const id = req.params.idUsers;
  const data = await reactionModel.find({ _id: id });
  res.json(data);
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
module.exports = router;
