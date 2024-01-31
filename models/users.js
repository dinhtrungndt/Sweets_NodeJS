const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const users = new Schema(
  {
    id: { type: ObjectId },
    name: { type: String },
    email: {
      type: String,
      required: true,
      trim: true,
      match: /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    gender: { type: String },
    date: { type: String },
    avatar: { type: String },
    coverImage: { type: String },
    token: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.users || mongoose.model("users", users);
