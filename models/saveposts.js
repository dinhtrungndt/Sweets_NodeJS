const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const saveposts = new Schema(
  {
    id: { type: ObjectId },
    idUsers: { type: ObjectId, ref: "users" },
    idPosts: { type: Number, ref: "posts" },
    createAt: { type: Date, default: Date.now },
    save: { type: Boolean, default: true },
  },
  {
    versionKey: false,
  }
);

module.exports =
  mongoose.models.saveposts || mongoose.model("saveposts", saveposts);
