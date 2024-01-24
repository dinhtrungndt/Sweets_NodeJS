const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const comments = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: ObjectId, ref: "posts" },
    idParent: { type: ObjectId, ref: "comments" },
    content: { type: String },
    createAt: { type: String },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.comments || mongoose.model("comments", comments);
