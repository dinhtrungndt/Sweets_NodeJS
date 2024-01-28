const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const users = new Schema(
  {
    id: { type: ObjectId },
    name: { type: String },
    email: { type: String },
    token: { type: String },
    password: { type: String, required: true },
    gender: { type: String },
    date: { type: String },
    avatar: { type: String },
    coverImage: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.users || mongoose.model("users", users);
