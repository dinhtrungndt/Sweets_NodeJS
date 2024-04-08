const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const posts = new Schema(
  {
    _id: { type: Number },
    content: { type: String, required: false },
    createAt: { type: Date, default: Date.now },
    idObject: { type: ObjectId, ref: "object" },
    idTypePosts: { type: ObjectId, ref: "typePosts" },
    idShare: { type: ObjectId, ref: "posts", default: null },
    idUsers: { type: ObjectId, ref: "users" },
  },
  {
    versionKey: false,
    _id: false,
  }
);

module.exports = mongoose.models.posts || mongoose.model("posts", posts);
