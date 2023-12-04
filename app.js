var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const mongoose = require("mongoose");
require("./models/login");
require("./models/post");
require("./models/user");

var indexRouter = require("./routes/index");
var loginRouter = require("./routes/login");
var postRouter = require("./routes/post");
var userRouter = require("./routes/user");

var app = express();

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
app.use("/login", loginRouter);
app.use("/post", postRouter);
app.use("/user", userRouter);

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
