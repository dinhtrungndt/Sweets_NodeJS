const express = require("express");
const router = express.Router();
const Friend = require("../models/friend");

// Gửi lời mời kết bạn
router.post("/send-friend-request", async (req, res) => {
    try {
      // Nhận thông tin từ request body
      const { idFriendSender, idFriendReceiver, time } = req.body;
  
      // Kiểm tra xem id người gửi có trùng với id người nhận không
      if (idFriendSender === idFriendReceiver) {
        return res
          .status(400)
          .json({ success: false, message: "Không thể gửi lời mời kết bạn cho chính mình" });
      }
  
      // Kiểm tra xem lời mời kết bạn đã tồn tại hay chưa
      const existingRequest = await Friend.findOne({
        $or: [
          { idFriendSender, idFriendReceiver },
          { idFriendSender: idFriendReceiver, idFriendReceiver: idFriendSender },
        ],
      });
  
      // Nếu đã tồn tại, trả về lỗi
      if (existingRequest) {
        return res
          .status(400)
          .json({ success: false, message: "Lời mời kết bạn đã tồn tại" });
      }
  
      // Tạo một lời mời kết bạn mới
      const newFriendRequest = new Friend({
        idFriendSender,
        idFriendReceiver,
        time,
        status: false, // Mặc định là chưa chấp nhận
      });
  
      // Lưu vào cơ sở dữ liệu
      await newFriendRequest.save();
  
      // Trả về thành công
      res
        .status(200)
        .json({ success: true, message: "Gửi lời mời kết bạn thành công" });
    } catch (error) {
      console.error(error);
      // Trả về lỗi nếu có vấn đề khi gửi lời mời kết bạn
      res
        .status(500)
        .json({ success: false, message: "Lỗi khi gửi lời mời kết bạn" });
    }
  });
  

// Chấp nhận lời mời kết bạn
router.post("/accept-friend-request", async (req, res) => {
  try {
    // Nhận thông tin từ request body
    const { idFriendSender, idFriendReceiver } = req.body;

    // Tìm lời mời kết bạn chưa được chấp nhận
    const friendRequest = await Friend.findOne({
      $or: [
        { idFriendSender, idFriendReceiver, status: false },
        {
          idFriendSender: idFriendReceiver,
          idFriendReceiver: idFriendSender,
          status: false,
        },
      ],
    });

    // Nếu không tìm thấy hoặc đã được xử lý, trả về lỗi
    if (!friendRequest) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn hoặc đã được xử lý",
        });
    }

    // Chấp nhận lời mời
    friendRequest.status = true;
    await friendRequest.save();

    // Trả về thành công
    res
      .status(200)
      .json({ success: true, message: "Chấp nhận lời mời kết bạn thành công" });
  } catch (error) {
    console.error(error);
    // Trả về lỗi nếu có vấn đề khi chấp nhận lời mời kết bạn
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi chấp nhận lời mời kết bạn" });
  }
});

// Từ chối lời mời kết bạn
router.post("/reject-friend-request", async (req, res) => {
  try {
    // Nhận thông tin từ request body
    const { idFriendSender, idFriendReceiver } = req.body;

    // Tìm lời mời kết bạn chưa được chấp nhận
    const friendRequest = await Friend.findOneAndDelete({
      $or: [
        { idFriendSender, idFriendReceiver, status: false },
        {
          idFriendSender: idFriendReceiver,
          idFriendReceiver: idFriendSender,
          status: false,
        },
      ],
    });

    // Nếu không tìm thấy hoặc đã được xử lý, trả về lỗi
    if (!friendRequest) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn hoặc đã được xử lý",
        });
    }

    // Xóa lời mời kết bạn
    // await friendRequest.remove();

    // Trả về thành công
    res
      .status(200)
      .json({ success: true, message: "Từ chối lời mời kết bạn thành công" });
  } catch (error) {
    console.error(error);
    // Trả về lỗi nếu có vấn đề khi từ chối lời mời kết bạn
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi từ chối lời mời kết bạn" });
  }
});

// Hủy lời mời kết bạn hoặc hủy kết bạn
router.post("/cancel-friend-request", async (req, res) => {
  try {
    // Nhận thông tin từ request body
    const { idFriendSender, idFriendReceiver } = req.body;

    // Tìm lời mời kết bạn chưa được chấp nhận hoặc tìm mối quan hệ bạn bè
    const friendRequest = await Friend.findOneAndDelete({
        $or: [
          { idFriendSender, idFriendReceiver, status: 'false' },
          { idFriendSender: idFriendReceiver, idFriendReceiver: idFriendSender, status: 'false' },
          { idFriendSender, idFriendReceiver, status: 'true' },
          { idFriendSender: idFriendReceiver, idFriendReceiver: idFriendSender, status: 'true' },
        ],
      });
      
    
      console.log("friend:_________"+friendRequest);
    // Nếu tìm thấy, xóa lời mời hoặc mối quan hệ bạn bè
    if (friendRequest) {
        // await Friend.findByIdAndRemove(friendRequest._id);
        console.log(friendRequest);
    } else {
      // Nếu không tìm thấy, trả về lỗi
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy lời mời kết bạn hoặc đã trở thành bạn bè",
        });
    }

    // Trả về thành công
    res
      .status(200)
      .json({
        success: true,
        message: "Hủy lời mời kết bạn hoặc hủy kết bạn thành công",
      });
  } catch (error) {
    console.error(error);
    // Trả về lỗi nếu có vấn đề khi hủy lời mời kết bạn hoặc hủy kết bạn
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi khi hủy lời mời kết bạn hoặc hủy kết bạn",
      });
  }
});

module.exports = router;
