const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const postSchema = new Schema(
  {
    id: { type: ObjectId },
    title: { type: String },
    image: { type: String },
    avatar: { type: String },
    time: { type: String },
    actionType: { type: String },
  },
  {
    versionKey: false,
  }
);

const userSchema = new Schema(
  {
    id: { type: ObjectId },
    name: { type: String },
    email: { type: String },
    password: { type: String },
    gioitinh: { type: String },
    ngaysinh: { type: String },
    avatar: { type: String },
    anhbia: { type: String },
    token: { type: String },
    posts: [postSchema],
  },
  {
    versionKey: false,
  }
);

// Đổi tên model từ "login" thành "user"
module.exports = mongoose.models.user || mongoose.model("user", userSchema);
