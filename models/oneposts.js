const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const oneposts = new Schema(
  {
    id: { type: ObjectId },
    idShares: { type: Number, ref: "share" },
    idPosts: { type: Number, ref: "posts" },
    idUsers: { type: ObjectId, ref: "users" },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.oneposts || mongoose.model("oneposts", oneposts);
