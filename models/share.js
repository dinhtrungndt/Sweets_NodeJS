const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const share = new Schema(
  {
    _id: { type: Number },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number, ref: "posts" },
    content: { type: String },
    idObject: { type: ObjectId, ref: "object" },
    createAt: { type: Date, default: Date.now },
    idTypePosts: { type: ObjectId, ref: "typePosts" },
  },
  {
    versionKey: false,
    _id: false,
  }
);

module.exports =
  mongoose.models.share || mongoose.model("share", share);
