const app = require("../app");
const debug = require("debug")("api-sweets:server");
const http = require("http");
const socketIo = require("socket.io");
const modelMessage = require("../models/message");

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  // console.log("Có người kết nối: " + socket.id);
  socket.on("new_message", async (data) => {
    try {
      const { idSender, idReceiver, content, time } = data;

      const newMessage = new modelMessage({
        idSender,
        idReceiver,
        content,
        status: "sent",
        time,
      });
      const savedMessage = await newMessage.save();
      socket.emit("new_message", savedMessage);
      socket.to(idReceiver).emit("new_message", savedMessage);
    } catch (error) {
      console.error(error);
    }
  });
});

module.exports = server;
