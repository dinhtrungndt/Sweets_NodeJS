const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const comments = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number, ref: "posts" },
    idParent: { type: ObjectId, ref: "comments", default: null},
    content: { type: String },
    image: [{ type: String }],
    parentUserName: { type: ObjectId, ref: "users" },
    createAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.comments || mongoose.model("comments", comments);
