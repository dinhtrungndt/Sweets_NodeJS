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
    const data = await reactionModel.find({ idPosts }).populate("idUsers", "name avatar");
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

    const nReaction = await reactionModel.findOne({ idUsers, idPosts }).populate('idPosts').populate("type");

    if (nReaction) {
      if (nReaction.type === type) {
        await reactionModel.findByIdAndDelete(nReaction._id);
      } else {
        await reactionModel.findByIdAndUpdate(nReaction._id, { type });
      }
      return res.json({
        status: 1,
        message: "Cập nhật reaction thành công",
        idPosts,
        nReaction,
        type
      });
    } else {
      const reaction = new reactionModel({ idUsers, idPosts, type });
      await reaction.save();
      return res.json({
        status: 1,
        message: "Thêm mới reaction thành công",
        idPosts,
        nReaction,
        type
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Thêm mới reaction thất bại",
      error: error,
    });
  }
});

// Thêm mới reaction dựa vào idUsers và idComments
// http://localhost:3001/reaction/add-comments/:idUsers/:idComments
router.post("/add-comments/:idUsers/:idComments", async (req, res) => {
  try {
    const { idUsers, idComments } = req.params;
    const { type } = req.body;

    const nReaction = await reactionModel.findOne({ idUsers, idComments });

    if (nReaction) {
      if (nReaction.type === type) {
        await reactionModel.findByIdAndDelete(nReaction._id);
      } else {
        await reactionModel.findByIdAndUpdate(nReaction._id, { type });
      }
      return res.json({
        status: 1,
        message: "Cập nhật reaction thành công",
        idComments,
        nReaction,
        type
      });
    } else {
      const reaction = new reactionModel({ idUsers, idComments, type });
      await reaction.save();
      return res.json({
        status: 1,
        message: "Thêm mới reaction thành công",
        idComments,
        nReaction,
        type
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Thêm mới reaction thất bại",
      error: error,
    });
  }
});


// Lấy danh sách reaction theo idPosts và idComments
// http://localhost:3001/reaction/get-idComments/:idComments
router.get("/get-idComments/:idComments", async (req, res) => {
  try {
    const { idComments } = req.params;
    const data = await reactionModel.find({ idComments }).populate("idUsers", "name avatar");
    res.json(data);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
