var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");

require("./models/users");
require("./models/message");
require("./models/friend");
require("./models/reaction");
require("./models/comments");
require("./models/object");
require("./models/typeposts");
require("./models/media");
require("./models/posts");


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


var app = express();

const cors = require("cors");

app.use(cors());

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
