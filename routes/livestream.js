const express = require("express");
const router = express.Router();
const livestreamModel = require("../models/livestream");

// Lấy livestream theo id
router.get("/getLivestream/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const livestream = await livestreamModel.findById(id);
  
      if (!livestream) {
        return res.status(404).json({
          status: "error",
          message: "Không tìm thấy livestream",
        });
      }
  
      res.json({
        status: "success",
        data: livestream,
      });
    } catch (error) {
      console.error("Error while getting livestream by id:", error);
      res.status(500).json({
        status: "error",
        message: "Lỗi khi lấy livestream theo id",
        error: error,
      });
    }
});

// Lấy tất cả livestream
router.get("/getAllLivestreams", async (req, res) => {
    try {
        const allLivestreams = await livestreamModel.find();

        res.json({
            status: "success",
            data: allLivestreams,
        });
    } catch (error) {
        console.error("Error while getting all livestreams:", error);
        res.status(500).json({
            status: "error",
            message: "Lỗi khi lấy tất cả livestream",
            error: error,
        });
    }
});

// Thêm mới livestream
router.post("/addLivestream", async (req, res) => {
    try {
        const { liveid, username } = req.body;

        const newLivestream = new livestreamModel({ liveid, username });
        await newLivestream.save();

        res.json({
            status: "success",
            message: "Thêm mới livestream thành công",
            data: newLivestream,
        });
    } catch (error) {
        console.error("Error while adding livestream:", error);
        res.status(500).json({
            status: "error",
            message: "Thêm mới livestream thất bại",
            error: error,
        });
    }
});

// Xóa livestream dựa vào liveid
router.delete("/deleteLivestream/:liveid", async (req, res) => {
    try {
        const { liveid } = req.params;
        const deletedLivestream = await livestreamModel.findOneAndDelete({ liveid });
        
        if (!deletedLivestream) {
            return res.status(404).json({
                status: "error",
                message: "Không tìm thấy livestream để xóa",
            });
        }
        
        res.json({
            status: "success",
            message: "Xóa livestream thành công",
            deletedLivestream: deletedLivestream,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Xóa livestream thất bại",
            error: error,
        });
    }
});


// Sửa thông tin livestream dựa vào id
router.put("/updateLivestream/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { liveid, username } = req.body;

        const updatedLivestream = await livestreamModel.findByIdAndUpdate(
            id,
            { liveid, username },
            { new: true }
        );

        res.json({
            status: "success",
            message: "Cập nhật livestream thành công",
            data: updatedLivestream,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Cập nhật livestream thất bại",
            error: error,
        });
    }
});

module.exports = router;
