const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const login = new Schema(
  {
    id: { type: ObjectId }, //khóa chính
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    username: { type: String, required: true },
    password: { type: String, required: true },
    img: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports = mongoose.models.login || mongoose.model("login", login);
