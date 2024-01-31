var express = require("express");
var router = express.Router();
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Sweets" });
});


const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(router);
const cors = require('cors');
router.use(cors());

const wss = new WebSocket.Server({ server: server });
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
  
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

});
server.listen(3002, () => {
  console.log('Listening on http://localhost:3002');
});

module.exports = router;
