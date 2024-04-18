var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const app = express();
const cors = require("cors");

// app.use(cors());

app.use(cors({
  origin: '*'
}));

app.use(express.json());
var database

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sweets API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "https://sweets-nodejs.onrender.com/",
      },
    ],
  },
  apis: ['./routes/comments.js', './routes/friend.js']
}

const swaggerSpec = swaggerJSDoc(options);
app.use('/api-sweets', swaggerUI.serve, swaggerUI.setup(swaggerSpec))

require("./models/users");
require("./models/message");
require("./models/friend");
require("./models/reaction");
require("./models/comments");
require("./models/object");
require("./models/typeposts");
require("./models/media");
require("./models/posts");
require("./models/login_qrcode");
require("./models/livestream");
require("./models/colors");
require("./models/location");
require("./models/birthday");
require("./models/notifications");
require("./models/savePosts");


var indexRouter = require("./routes/index");
var userRouter = require("./routes/users");
var messageRouter = require("./routes/message");
var friendRouter = require("./routes/friend");
var reactionRouter = require("./routes/reaction");
var commentsRouter = require("./routes/comments");
var objectRouter = require("./routes/object");
var typepostsRouter = require("./routes/typeposts");
var mediaRouter = require("./routes/media");
var postsRouter = require("./routes/posts");
var loginQRCodeRouter = require("./routes/login_qrcode");
var livestreamRouter = require("./routes/livestream");
var colorRouter = require("./routes/colors");
var locationRouter = require("./routes/location");
var birthdayRouter = require("./routes/birthday");
var notificationsRouter = require("./routes/notifications");
var savePostsRouter = require("./routes/savePosts");


// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect("mongodb+srv://Sweets:Sweets@sweets.f8nv7np.mongodb.net/Sweets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(">>>>>>>>>> DB Connected!!!!!!"));

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/message", messageRouter);
app.use("/friend", friendRouter);
app.use("/reaction", reactionRouter);
app.use("/comments", commentsRouter);
app.use("/object", objectRouter);
app.use("/typeposts", typepostsRouter);
app.use("/media", mediaRouter);
app.use("/posts", postsRouter);
app.use("/loginQRCode", loginQRCodeRouter);
app.use("/livestream", livestreamRouter);
app.use("/colors", colorRouter);
app.use("/location", locationRouter);
app.use("/birthday", birthdayRouter);
app.use("/notifications", notificationsRouter);
app.use("/saveposts", savePostsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
