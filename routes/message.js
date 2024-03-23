var express = require("express");
var router = express.Router();
var modelMessage = require("../models/message");
const modelUser = require("../models/users");
// lấy danh sách tin nhắn
//http://localhost:3001/message/get-message
router.get("/get-message", async function (req, res, next) {
    var data = await modelMessage.find();
    res.json(data);
});

// Thêm tin nhắn mới
// http://localhost:3001/message/send-message
router.post("/send-message", async function (req, res, next) {
    try {
        const { idSender, idReceiver, content, time } = req.body;

        const newMessage = new modelMessage({

            idSender,
            idReceiver,
            content,
            status: "sent", // Có thể cập nhật trạng thái tin nhắn tùy vào logic của bạn
            time,
        });

        const savedMessage = await newMessage.save();
        res.json(savedMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Lấy tin nhắn theo id người gửi và id người nhận
// http://localhost:3001/message/get-message/:idSender/:idReceiver

router.get("/get-message/list/:idSender/:idReceiver", async (req, res, next) => {
    try {
        const { idSender, idReceiver } = req.params;

        // Tạo idgroup duy nhất từ idSender và idReceiver
        const idgroup = idSender + idReceiver;
        const idgroup2 = idReceiver + idSender;

        // Lấy tất cả tin nhắn có idgroup chứa cả idSender và idReceiver
        let messages = await modelMessage.find({ idgroup: idgroup }).sort({ time: 1 });
        if (messages.length === 0) {
            messages = await modelMessage.find({ idgroup: idgroup2 }).sort({ time: 1 });
        }
        // nếu cả 2 trường hợp idgroup và idgroup2 đều có tin nhắn thì gộp lại và sắp xếp theo thời gian
        let messages2 = await modelMessage.find({ idgroup: idgroup2 }).sort({ time: 1 });
        if (messages.length > 0 && messages2.length > 0) {
            messages = messages.concat(messages2);
            messages.sort((a, b) => new Date(a.time) - new Date(b.time));
        }

 
        return res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi máy chủ mess" });
    }
});









// Xóa tin nhắn theo id
// http://localhost:3001/message/delete/:id
router.delete("/delete/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await modelMessage.findByIdAndDelete(id);
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Lỗi máy chủ mess" });
    }
});

router.post("/update-status", async (req, res, next) => {
    const { _id, status } = req.body;
    try {
        const respont = await modelMessage.findOne({ _id: _id });
        if (respont) {
            respont.status = status;
            await respont.save();
            res.json({ status: 1, message: "Cập nhật thành công" });
        } else {
            res.json({ status: 0, message: "Người dùng không tồn tại" });
        }
    } catch (err) {
        res.json({ status: 2, message: "Lỗi khi cập nhật" });
    }
});


// Lấy danh sách bạn bè theo idUser
// http://localhost:3001/message/listchat
router.get("/listchat/:_id", async (req, res) => {
    try {
        const _id = req.params._id;

        // Lấy tất cả tin nhắn của người dùng
        const allMessages = await modelMessage.find({
            $or: [{ idSender: _id }, { idReceiver: _id }],
        });

        // Tạo một đối tượng map để lưu tin nhắn mới nhất từ mỗi người nhắn tin
        const latestMessagesMap = new Map();

        allMessages.forEach(message => {
            // Kiểm tra xem các thuộc tính idSender và idReceiver có tồn tại không
            if (message.idSender && message.idReceiver) {
                const partnerId = message.idSender.toString() === _id ? message.idReceiver.toString() : message.idSender.toString();

                // Kiểm tra xem tin nhắn đã tồn tại trong map chưa hoặc có tin nhắn mới hơn không
                if (!latestMessagesMap.has(partnerId) || latestMessagesMap.get(partnerId).time < message.time) {
                    latestMessagesMap.set(partnerId, message);
                }
            }
        });

        // Khởi tạo mảng để lưu tin nhắn mới nhất với thông tin avatar của người nhận
        const allIdSender = [];

        // Lặp qua tất cả các tin nhắn đã lọc và chỉ lấy tin nhắn mới nhất từ mỗi người nhắn tin
        for (const [partnerId, message] of latestMessagesMap) {
            const { idSender, idReceiver, content, time } = message;

            // Lấy thông tin người gửi và người nhận từ database
            const senderUser = await modelUser.findById(idSender);
            const receiverUser = await modelUser.findById(idReceiver);

            // Xác định ID của người gửi và người nhận dựa trên tên trong database modelMessage
            const senderIdInMessage = (message.idSender.toString() === senderUser._id.toString()) ? senderUser._id : receiverUser._id;
            const receiverIdInMessage = (message.idReceiver.toString() === senderUser._id.toString()) ? senderUser._id : receiverUser._id;

            // Sắp xếp lại senderv1 và receiverv1 theo như trong database modelMessage
            const receiverv1  = senderIdInMessage;
            const senderv1  = receiverIdInMessage;

            // Lấy thông tin người nhận từ database loại trừ bản thân mình ra 


            if (senderUser._id.toString() === _id) {
                var avatar = receiverUser.avatar;
                var name = receiverUser.name;
                var senderv2 = receiverUser._id;
                var receiverv2 = receiverUser._id;
            } else {
                var avatar = senderUser.avatar;
                var name = senderUser.name;
                var senderv2 = receiverUser._id;
                var receiverv2 = senderUser._id;
            }

            allIdSender.push({ senderv2, receiverv2, content, time, avatar, name, status: message.status, _id: message._id });
        }

        // Sắp xếp mảng allIdSender theo thời gian giảm dần
        allIdSender.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(allIdSender);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách tin nhắn" });
    }
});



module.exports = router;
