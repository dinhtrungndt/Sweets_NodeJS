const app = require("../app");
const debug = require("debug")("api-sweets:server");
const http = require("http");
const socketIo = require("socket.io");
const modelMessage = require("../models/message");

const server = http.createServer(app);
 const io = socketIo(server);
 
// io.on("connection", (socket) => {
//   socket.on("new_chat", async (data) => {
//     try {
//       const { avatar, name, content } = data;
//       // lấy lại danh sách tin nhắn
//       const newlistchat = new modelMessage({
//         idSender,
//         idReceiver,
//         content,
//         status: "sent",
//         time,
//         idgroup: idSender + idReceiver,

//       });
//       // ghi log khi có tin nhắn mới được gửi đến
//       console.log(`Received message: ${newlistchat}`);
//       const savedMessage = await newlistchat.save();
//       // gửi lại list tin nhắn mới
//       io.emit("new_chat", savedMessage);
//       console.log(`Sent message: ${savedMessage}`);

//     } catch (e) {

//     }
//   });
// });

io.on("connection", (socket) => {
  socket.on("new_message", async (data) => {
    try {
      const { idSender, idReceiver, content, time, idgroup } = data;
      // Lưu tin nhắn mới vào cơ sở dữ liệu MongoDB
      const newMessage = new modelMessage({
        idSender,
        idReceiver,
        content,
        status: "sent",
        time,
        idgroup: idSender + idReceiver,
      });
      const savedMessage = await newMessage.save();

      // Ghi log tin nhắn đã được gửi đi
      console.log(`Sent message: ${savedMessage}`);

      // Gửi tin nhắn mới đến cả người gửi và người nhận
      io.emit("new_message", savedMessage); // Gửi lại tin nhắn mới cho cả người gửi
      socket.to(idReceiver).emit("new_message", savedMessage); // Gửi lại tin nhắn mới cho người nhận

      // Ghi log tin nhắn đã được nhận
      console.log(`Received message: ${savedMessage}`);
    } catch (error) {
      console.error(error);
    }
  });
});


module.exports = server;
