var express = require("express");
var router = express.Router();
var modelRelationS = require("../models/relationship");

// lấy danh sách relationS
// http://localhost:3001/relationS/get-relationS
router.get("/get-relationS", async function (req, res) {
  try {
    var data = await modelRelationS
      .find()
      .populate({
        path: 'userId1 userId2', 
        populate: {
          path: 'posts stories', 
        },
      })
      .exec();

    res.json({ data });
  } catch (err) {
    next(err);
    res.json({ status: 500, message: "Lấy danh sách relationS thất bại" });
  }
});

// lấy danh sách bạn bè của người dùng
// http://localhost:3001/relationS/get-relationS/:userId
router.get("/get-relationS/:userId", async function (req, res) {
  try {
    const userId = req.params.userId;

    const data = await modelRelationS
      .find({
        $or: [{ userId1: userId }, { userId2: userId }],
      })
      .populate({
        path: 'userId1 userId2',
        populate: {
          path: 'posts stories',
        },
      })
      .lean()
      .exec();

    res.json({ data });
  } catch (err) {
    next(err);
    res.json({ status: 500, message: "Lấy danh sách bạn bè thất bại" });
  }
});

// Thêm mối quan hệ bạn bè
// http://localhost:3001/relationS/add-relationS
router.post("/add-relationS", async function (req, res) {
  try {
    const { userId1, userId2 } = req.body;

    // Kiểm tra xem userId2 có trùng nhau không
    if (Array.isArray(userId2) && new Set(userId2).size !== userId2.length) {
      return res.json({ status: 400, message: "userId2 đã bị trùng !" });
    }

    // Kiểm tra xem mối quan hệ bạn bè đã tồn tại chưa
    const existingRelation = await modelRelationS.findOne({
      $or: [
        { userId1, userId2 },
        { userId1: userId2, userId2: userId1 }, 
      ],
    });

    if (existingRelation) {
      return res.json({ status: 400, message: "Mối quan hệ bạn bè đã tồn tại" });
    }

    // Nếu mối quan hệ bạn bè chưa tồn tại, thêm vào cơ sở dữ liệu
    const newData = await modelRelationS.create(req.body);

    res.json({ status: 200, message: "Thêm mới thành công", data: newData });
  } catch (err) {
    next(err);
    res.json({ status: 500, message: "Thêm mới thất bại" });
  }
});


// Xóa mối quan hệ bạn bè
// http://localhost:3001/relationS/delete-relationS/:id
router.delete("/delete-relationS/:id", async function (req, res) {
  try {
    var Data = await modelRelationS.findByIdAndDelete(req.params.id);
    res.json({ status: 200, message: "Xóa thành công", Data });
  } catch (err) {
    next(err);
    res.json({ status: 500, message: "Xóa thất bại" });
  }
})

// Cập nhật mối quan hệ bạn bè như hủy kết bạn
// http://localhost:3001/relationS/update-relationS/:id
router.put("/update-relationS/:id", async function (req, res) {
  try {
    const updatedData = await modelRelationS.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Trả về dữ liệu mới sau khi cập nhật
    );

    res.json({ status: 200, message: "Cập nhật thành công", data: updatedData });
  } catch (err) {
    next(err);
    res.json({ status: 500, message: "Cập nhật thất bại" });
  }
});

module.exports = router;
