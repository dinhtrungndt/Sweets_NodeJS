const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const login = new Schema(
  {
    id: { type: ObjectId }, //khóa chính
    name: { type: String },
    email: { type: String },
    password: { type: String },
    gioitinh: { type: String },
    ngaysinh: { type: String },
    avatar: { type: String },
    anhbia: { type: String },
    token: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.login || mongoose.model("login", login);
