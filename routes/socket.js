const app = require("../app");
const debug = require("debug")("api-sweets:server");
const http = require("http");
const socketIo = require("socket.io");
const modelMessage = require("../models/message");

const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
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
      console.log(`Sent message: ${savedMessage}`);

      // Emit the new message to the sender and receiver
      socket.emit("new_message", savedMessage);
      socket.to(idReceiver).emit("new_message", savedMessage);

      // Log that the message has been sent to the receiver
      console.log(`Message sent to ${data.content}`);
    } catch (error) {
      console.error(error);
    }
  });
});


module.exports = server;
