const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const posts = new Schema(
  {
    id: { type: ObjectId },
    content: { type: String, required: true },
    createAt: { type: Date, default: Date.now },
    idObject: { type: ObjectId, ref: "object" },
    idTypePosts: { type: ObjectId, ref: "typePosts" },
    idShare: { type: ObjectId, ref: "posts" },
    idUsers: { type: ObjectId, ref: "users" },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.posts || mongoose.model("posts", posts);
